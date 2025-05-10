import React, { useState, useRef, useEffect } from "react";
import { CohereClient } from "cohere-ai";
import 'bootstrap-icons/font/bootstrap-icons.css';

const cohere = new CohereClient({
  token: import.meta.env.VITE_CHATBOT_TOKEN
});

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
  
    // Add user message
    const userMessage = { 
      sender: "user", 
      text: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);
  
    try {
      // Format chat history for Cohere
      const chatHistory = messages.map(msg => ({
        role: msg.sender === "user" ? "USER" : "CHATBOT",
        message: msg.text
      }));

      // Get AI response
      const response = await cohere.chat({
        message: input,
        chatHistory: chatHistory,
        model: "command",
        temperature: 0.7,
        maxTokens: 300,
        preamble: "You are a helpful AI assistant. Be concise and friendly."
      });

      // Add bot response
      const botMessage = {
        sender: "bot",
        text: response.text,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Cohere API error:", err);
      setError(err.message || "Failed to get response");
      setMessages(prev => [
        ...prev,
        { 
          sender: "system", 
          text: "⚠️ Sorry, I'm having trouble responding right now.",
          timestamp: new Date().toISOString()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  // Format time for messages
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      fontFamily: "'Inter', sans-serif"
    }}>
      {isOpen ? (
        <div style={{
          width: '380px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #6b46c1 0%, #4f46e5 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="bi bi-robot" style={{ fontSize: '18px' }}></i>
              </div>
              <div>
                <div style={{ 
                  fontWeight: '600', 
                  fontSize: '16px',
                  lineHeight: '1.2'
                }}>
                  AI Webify
                </div>
                <div style={{ 
                  fontSize: '12px',
                  opacity: 0.8,
                  marginTop: '2px'
                }}>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '4px',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ':hover': {
                  background: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={chatRef}
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              background: '#f9fafb',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' 
                      ? '16px 16px 0 16px' 
                      : '16px 16px 16px 0',
                    background: msg.sender === 'user' 
                      ? '#4f46e5' 
                      : msg.sender === 'system'
                        ? '#fef3c7'
                        : 'white',
                    color: msg.sender === 'user' ? 'white' : '#1f2937',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    border: msg.sender === 'system' 
                      ? '1px solid #f59e0b' 
                      : 'none',
                    lineHeight: '1.5'
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    paddingLeft: msg.sender === 'user' ? '0' : '12px',
                    paddingRight: msg.sender === 'user' ? '12px' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>
                      {msg.sender === 'user' ? 'You' : 
                       msg.sender === 'system' ? 'System' : 'Assistant'}
                    </span>
                    <span>•</span>
                    <span>{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                width: 'fit-content'
              }}>
                <div className="typing-indicator">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  color: '#4b5563',
                  fontWeight: '500'
                }}>
                  Generating response...
                </span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            background: 'white'
          }}>
            {error && (
              <div style={{
                padding: '10px 12px',
                background: '#fee2e2',
                color: '#b91c1c',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{error}</span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              gap: '8px',
              position: 'relative'
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  paddingRight: '48px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '24px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  ':focus': {
                    borderColor: '#4f46e5',
                    boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)'
                  }
                }}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  ':hover': {
                    background: '#4338ca'
                  },
                  ':disabled': {
                    background: '#d1d5db',
                    cursor: 'not-allowed'
                  }
                }}
                aria-label="Send message"
              >
                {loading ? (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                ) : (
                  <i className="bi bi-send-fill" style={{ fontSize: '14px' }}></i>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6b46c1 0%, #4f46e5 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            ':hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
            }
          }}
          aria-label="Open chat"
        >
          <i className="bi bi-chat-dots"></i>
        </button>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .typing-indicator {
          display: flex;
          gap: 6px;
          height: 20px;
          align-items: center;
        }
        .typing-indicator div {
          width: 8px;
          height: 8px;
          background-color: #9ca3af;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-indicator div:nth-child(1) { animation-delay: 0s; }
        .typing-indicator div:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator div:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;