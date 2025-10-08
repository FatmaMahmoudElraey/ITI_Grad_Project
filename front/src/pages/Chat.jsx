// chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '../api/constants';
import { useNavigate, useLocation } from 'react-router-dom';

function Chat({ name, othername }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const messagesEndRef = useRef(null);
  // Using cookie-based auth; we do not read tokens from sessionStorage
  const token = null;
  const navigate = useNavigate();
  const location = useLocation();
  
  // If accessed directly without props, redirect to users page
  useEffect(() => {
    if (!othername && location.pathname === '/chat') {
      console.log('Chat component accessed directly without othername, redirecting to users');
      navigate('/users');
    }
  }, [othername, navigate, location]);
  
  // Get current user email if not provided
  const effectiveName = name || localStorage.getItem('email');

  // Load previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching messages for chat with: ${othername}`);
        const response = await axios.get(`${ENDPOINTS.CHAT_MESSAGES}?email=${encodeURIComponent(othername)}`);
        
        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} messages`);
          const formattedMessages = response.data.map(msg => ({
            message: msg.message,
            sender: msg.sender_name || msg.sender.email,
            timestamp: new Date(msg.date),
            isRead: msg.is_read
          }));
          setMessages(formattedMessages);
        } else {
          console.warn('Received non-array data:', response.data);
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Don't show error for 404 - it might just mean no messages yet
        if (error.response && error.response.status === 404) {
          console.log('No messages found - this is normal for new conversations');
          setMessages([]);
        } else {
          setError('Failed to load messages. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (othername && token) {
      fetchMessages();
    }
  }, [othername, token]);

  // Set up WebSocket connection
  useEffect(() => {
    // Create WebSocket connection with proper URL format
    if (!othername) {
      console.error('Missing othername or token for WebSocket connection');
      // Don't show error if we're redirecting anyway
      if (location.pathname !== '/chat') {
        setError('Authentication error. Please log in again.');
      }
      return;
    }

    // Limit connection attempts to prevent infinite retries
    if (connectionAttempts > 3) {
      setError('Unable to establish connection after multiple attempts. The server might be offline.');
      return;
    }

  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // Use localhost:8000 for development
  // NOTE: With HttpOnly cookie auth, the server must authenticate WebSocket connections via cookies/session.
  const wsUrl = `${wsProtocol}//localhost:8000/ws/chat/${encodeURIComponent(othername)}/`;
    console.log(`Connecting to WebSocket (attempt ${connectionAttempts + 1}):`, wsUrl);
    
    let ws = null;
    try {
      ws = new WebSocket(wsUrl);
      
      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.error('WebSocket connection timeout');
          ws.close();
          setConnectionAttempts(prev => prev + 1);
          setError('Connection timeout. The server might be offline.');
        }
      }, 5000); // 5 second timeout
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        clearTimeout(connectionTimeout);
        setError(null);
        setConnectionAttempts(0); // Reset attempts on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Message received:', data);
          
          // Check if this is a message from the current user (to avoid duplicates)
          // Only add messages from other users via WebSocket
          if (data.sender !== effectiveName) {
            setMessages(prev => [...prev, {
              message: data.message,
              sender: data.sender,
              timestamp: new Date(),
              isRead: false
            }]);
          }
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket closed:', event.code, event.reason);
        if (event.code === 4001) {
          setError('Authentication failed. Please log in again.');
        } else if (event.code === 4002) {
          setError('User not found');
        } else if (event.code === 1000) {
          // Normal closure, don't show error
          console.log('WebSocket closed normally');
        } else {
          setConnectionAttempts(prev => prev + 1);
          setError('Connection closed. The server might be offline or restarting.');
        }
      };

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket error:', error);
        setConnectionAttempts(prev => prev + 1);
        setError('Connection error. Server might be offline.');
      };

      setSocket(ws);
    } catch (e) {
      console.error('Error creating WebSocket:', e);
      setConnectionAttempts(prev => prev + 1);
      setError('Failed to establish connection');
    }

    // Cleanup when component unmounts
    return () => {
      if (ws) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [othername, token, connectionAttempts]); // Dependencies include connectionAttempts for retries

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ 'message': newMessage }));
      setNewMessage('');
      
      // Optimistically add message to UI
      setMessages(prev => [...prev, {
        message: newMessage,
        sender: effectiveName,
        timestamp: new Date(),
        isRead: false,
        pending: true // Mark as pending until confirmed
      }]);
    } else {
      console.error('WebSocket is not open, readyState:', socket?.readyState);
      setError('Connection lost. Please refresh the page.');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const reconnect = () => {
    setConnectionAttempts(0); // Reset connection attempts
    setError(null); // Clear error
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.header}>
        <h3>Chat with {othername}</h3>
      </div>

      <div style={styles.messagesContainer}>
        {loading ? (
          <div style={styles.loadingMessage}>Loading messages...</div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <div style={styles.errorMessage}>{error}</div>
            <button onClick={reconnect} style={styles.reconnectButton}>Try Again</button>
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.emptyMessage}>No messages yet. Start a conversation!</div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              style={{
                ...styles.message,
                alignSelf: msg.sender === effectiveName ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === effectiveName ? '#dcf8c6' : '#e1f5fe',
                opacity: msg.pending ? 0.7 : 1,
              }}
            >
              <div style={styles.messageContent}>
                {msg.message}
              </div>
              <div style={styles.messageFooter}>
                <span style={styles.messageTime}>
                  {formatTime(msg.timestamp)}
                </span>
                {msg.sender === effectiveName && (
                  <span style={styles.readStatus}>
                    {msg.pending ? '⌛' : (msg.isRead ? '✓✓' : '✓')}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled={loading || error || !socket || socket.readyState !== WebSocket.OPEN}
        />
        <button 
          style={{
            ...styles.button,
            opacity: loading || error || !socket || socket.readyState !== WebSocket.OPEN ? 0.5 : 1,
            cursor: loading || error || !socket || socket.readyState !== WebSocket.OPEN ? 'not-allowed' : 'pointer'
          }} 
          onClick={sendMessage}
          disabled={loading || error || !socket || socket.readyState !== WebSocket.OPEN}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '600px',
      height: '600px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif',
      margin: '0 auto',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    header: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '15px',
      textAlign: 'center',
      fontWeight: 'bold'
    },
    messagesContainer: {
      flex: 1,
      padding: '15px',
      overflowY: 'auto',
      backgroundColor: '#f7f7f7',
      display: 'flex',
      flexDirection: 'column'
    },
    message: {
      marginBottom: '10px',
      maxWidth: '70%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '10px',
      padding: '10px',
      position: 'relative'
    },
    messageContent: {
      wordBreak: 'break-word',
      marginBottom: '5px'
    },
    messageFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#666',
      alignSelf: 'flex-end',
      width: '100%'
    },
    messageTime: {
      marginRight: '5px'
    },
    readStatus: {
      color: '#4fc3f7'
    },
    loadingMessage: {
      textAlign: 'center',
      color: '#999',
      margin: 'auto'
    },
    errorContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 'auto',
      padding: '20px',
      backgroundColor: '#ffebee',
      borderRadius: '8px',
      maxWidth: '80%'
    },
    errorMessage: {
      textAlign: 'center',
      color: '#f44336',
      marginBottom: '15px'
    },
    reconnectButton: {
      padding: '8px 16px',
      backgroundColor: '#f44336',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    emptyMessage: {
      textAlign: 'center',
      color: '#999',
      margin: 'auto'
    },
    inputContainer: {
      display: 'flex',
      borderTop: '1px solid #ccc',
      padding: '10px',
      backgroundColor: 'white'
    },
    input: {
      flex: 1,
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '20px',
      outline: 'none',
      marginRight: '10px'
    },
    button: {
      padding: '12px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      fontWeight: 'bold'
    }
  };

export default Chat;
