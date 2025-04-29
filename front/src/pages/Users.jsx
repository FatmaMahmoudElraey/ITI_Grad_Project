import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import { fetchUsers } from '../store/slices/usersSlice';
import { useDispatch, useSelector } from 'react-redux';

function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUserEmail = localStorage.getItem('email');
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await dispatch(fetchUsers()).unwrap();
        // Filter out the current user from the list
        if (Array.isArray(response)) {
          const filteredUsers = response.filter(user => user.email !== currentUserEmail);
          setUsers(filteredUsers);
        } else {
          console.error('Fetched data is not an array:', response);
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [dispatch, currentUserEmail]);

  return (
    <div className="chat-page-container" style={styles.container}>
      {!selectedUser ? (
        <div style={styles.userListContainer}>
          <h2 style={styles.heading}>Select someone to chat with</h2>
          {loading ? (
            <div style={styles.loadingMessage}>Loading users...</div>
          ) : error ? (
            <div style={styles.errorMessage}>{error}</div>
          ) : users.length === 0 ? (
            <div style={styles.emptyMessage}>No other users available</div>
          ) : (
            <ul style={styles.userList}>
              {users.map((user) => (
                <li key={user.id} style={styles.userItem}>
                  <button 
                    onClick={() => setSelectedUser(user.email)}
                    style={styles.userButton}
                  >
                    <div style={styles.userInfo}>
                      <div style={styles.userName}>{user.name || user.email}</div>
                      <div style={styles.userEmail}>{user.email}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div style={styles.chatContainer}>
          <div style={styles.backButtonContainer}>
            <button 
              onClick={() => setSelectedUser(null)}
              style={styles.backButton}
            >
              ← Back to Users
            </button>
          </div>
          <Chat name={currentUserEmail} othername={selectedUser} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  userListContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  heading: {
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
  },
  userList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  userItem: {
    marginBottom: '10px',
  },
  userButton: {
    width: '100%',
    padding: '15px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: '16px',
    marginBottom: '5px',
  },
  userEmail: {
    color: '#6c757d',
    fontSize: '14px',
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '20px',
    color: '#6c757d',
  },
  errorMessage: {
    textAlign: 'center',
    padding: '20px',
    color: '#dc3545',
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '20px',
    color: '#6c757d',
  },
  chatContainer: {
    width: '100%',
  },
  backButtonContainer: {
    marginBottom: '15px',
  },
  backButton: {
    padding: '8px 15px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default ChatPage;
