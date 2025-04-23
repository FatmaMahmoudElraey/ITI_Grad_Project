import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Seller/Sidebar";
import DataTable from "../../components/Seller/DataTable";
import { FiMail, FiMessageSquare, FiCheck, FiX, FiPlus, FiSend } from "react-icons/fi";
import dashboardData from "../../assets/data/dashboardData.json";
import "../../assets/css/dashboard/dash.css";

export default function Inbox() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentMessages, setSentMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const fetchedMessages = dashboardData.inboxMessages.map(message => ({
          ...message,
          relatedProduct: dashboardData.popularProducts.find(
            p => p.id === message.relatedProductId
          )
        }));

        setMessages(fetchedMessages);
        setLoading(false);
      } catch (err) {
        setError("Failed to load messages");
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setMessages(prevMessages =>
        prevMessages.map(message =>
          message.id === id ? { ...message, status: "read" } : message
        )
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleReply = (id) => {
    const message = messages.find(msg => msg.id === id);
    setSelectedMessage(message);
    setReplyText(`\n\n--- Original Message ---\nFrom: ${message.sender}\nDate: ${formatDate(message.date)}\nSubject: ${message.subject}\n\n${message.message}`);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      setIsSending(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create sent message record
      const newSentMessage = {
        id: Date.now(),
        to: selectedMessage.sender,
        subject: `Re: ${selectedMessage.subject}`,
        message: replyText,
        date: new Date().toISOString(),
        originalMessageId: selectedMessage.id
      };

      // Update state
      setSentMessages(prev => [...prev, newSentMessage]);
      setMessages(prevMessages =>
        prevMessages.map(message =>
          message.id === selectedMessage.id 
            ? { ...message, status: "read", replied: true }
            : message
        )
      );
      
      // Reset form
      setSelectedMessage(null);
      setReplyText("");
      
      // Show success (in a real app, you might use a toast notification)
      console.log("Reply sent successfully:", newSentMessage);
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="card loading-container">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="card error-content">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="button button-primary"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <div className="page-header">
          <h1 className="dashboard-header">Inbox</h1>
          <button 
            className="button button-primary"
            onClick={() => navigate('/seller/inbox/new')}
          >
            <FiPlus className="icon" /> New Message
          </button>
        </div>

        <div className="card data-table-container">
          <DataTable
            headers={[
              { key: 'sender', label: 'Sender' },
              { key: 'subject', label: 'Subject' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={messages.map(message => ({
              ...message,
              date: formatDate(message.date),
              status: (
                <span className={`status-badge ${
                  message.status === 'read' 
                    ? message.replied 
                      ? 'status-completed' 
                      : 'status-read'
                    : 'status-processing'
                }`}>
                  {message.replied ? 'Replied' : 
                   message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                </span>
              ),
              actions: (
                <div className="actions-container">
                  {message.status !== 'read' && (
                    <button 
                      onClick={() => handleMarkAsRead(message.id)}
                      className="button button-secondary button-sm"
                    >
                      <FiCheck className="icon" /> Mark Read
                    </button>
                  )}
                  <button 
                    onClick={() => handleReply(message.id)}
                    className="button button-primary button-sm"
                    disabled={message.replied}
                  >
                    <FiMessageSquare className="icon" /> 
                    {message.replied ? 'Replied' : 'Reply'}
                  </button>
                </div>
              )
            }))}
            sortable
            pagination
            itemsPerPage={10}
          />
        </div>

        {selectedMessage && (
          <div className="card message-detail-container">
            <div className="message-header">
              <h3>{selectedMessage.subject}</h3>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="button button-danger button-icon"
                disabled={isSending}
              >
                <FiX />
              </button>
            </div>
            
            <div className="message-content">
              <div className="message-meta">
                <p><strong>From:</strong> {selectedMessage.sender}</p>
                <p><strong>Date:</strong> {formatDate(selectedMessage.date)}</p>
                {selectedMessage.replied && (
                  <p className="text-success">
                    <FiCheck /> Replied
                  </p>
                )}
              </div>
              
              {selectedMessage.relatedProduct && (
                <div className="related-product">
                  <hr />
                  <p><strong>Related Product:</strong> {selectedMessage.relatedProduct.name}</p>
                  <p><strong>Category:</strong> {
                    dashboardData.categories.find(c => c.value === selectedMessage.relatedProduct.category)?.label || 
                    selectedMessage.relatedProduct.category
                  }</p>
                  <hr />
                </div>
              )}
              
              <div className="message-body">
                <p>{selectedMessage.message}</p>
              </div>
              
              <div className="message-reply">
                <h4>Reply</h4>
                <textarea
                  className="form-control"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  rows={8}
                  disabled={isSending}
                />
                <div className="reply-actions">
                  <button 
                    onClick={handleSendReply}
                    className="button button-primary"
                    disabled={!replyText.trim() || isSending}
                  >
                    {isSending ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <FiSend className="icon" /> Send Response
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="button button-secondary"
                    disabled={isSending}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}