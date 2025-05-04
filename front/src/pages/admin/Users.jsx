import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaUserAlt, FaUserCog, FaUserTie } from 'react-icons/fa';
import DataTable from '../../components/Admin/DataTable';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'user',
    is_active: true
  });

  useEffect(() => {
    // Fetch users from the database
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/auth/users/');
        
        // Add date_joined if it's missing
        const usersWithDateJoined = response.data.map(user => ({
          ...user,
          date_joined: user.date_joined || new Date().toISOString()
        }));
        
        setUsers(usersWithDateJoined);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user edit
  const handleEditUser = (user) => {
    setCurrentUser({
      ...user,
      password: '' // Don't show password in edit form
    });
    setShowEditModal(true);
  };

  // Handle user delete
  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/auth/users/${user.id}/`);
        setUsers(users.filter(u => u.id !== user.id));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  // Handle active status toggle
  const handleActiveToggle = async (user) => {
    try {
      const updatedUser = { ...user, is_active: !user.is_active };
      await axios.patch(`http://localhost:8000/api/auth/customers/${user.id}/`, {
        is_active: updatedUser.is_active
      });
      
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, is_active: updatedUser.is_active } : u
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating user active status:', error);
      alert('Failed to update user active status. Please try again.');
    }
  };

  // Handle input change for new user form
  const handleNewUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser({
      ...newUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle input change for edit user form
  const handleEditUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Validate user form
  const validateUserForm = (user) => {
    const errors = {};
    
    if (!user.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!user.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!user.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Only validate password for new users or if password field is filled for existing users
    if ((!user.id && !user.password) || (user.id && user.password && user.password.length > 0 && user.password.length < 6)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  // Handle add user form submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateUserForm(newUser);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Format the user data to match what the backend expects
      const formattedUser = {
        email: newUser.email,
        name: `${newUser.first_name} ${newUser.last_name}`,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        password: newUser.password,
        role: newUser.role,
        re_password: newUser.password // Djoser often requires password confirmation
      };
      
      console.log('Sending user data:', formattedUser);
      await axios.post('http://localhost:8000/api/auth/users/', formattedUser);
      
      // Fetch the updated user list instead of trying to add the response data
      const response = await axios.get('http://localhost:8000/api/auth/users/');
      
      // Add date_joined if it's missing
      const usersWithDateJoined = response.data.map(user => ({
        ...user,
        date_joined: user.date_joined || new Date().toISOString()
      }));
      
      setUsers(usersWithDateJoined);
      
      // Reset form and close modal
      setNewUser({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'user',
        is_active: true
      });
      setFormErrors({});
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding user:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        // Format error messages for display
        const serverErrors = {};
        
        // Handle different error formats from the server
        if (error.response.data) {
          Object.keys(error.response.data).forEach(key => {
            // Handle array of errors or single string error
            if (Array.isArray(error.response.data[key])) {
              serverErrors[key] = error.response.data[key][0];
            } else {
              serverErrors[key] = error.response.data[key];
            }
          });
          
          // Special handling for email errors which are common
          if (error.response.data.email) {
            if (Array.isArray(error.response.data.email) && error.response.data.email[0].includes('already exists')) {
              serverErrors.email = 'This email is already in use. Please try another one.';
            }
          }
          
          setFormErrors(serverErrors);
        } else {
          alert('Failed to add user. Please try again.');
        }
      } else {
        alert('Failed to add user. Please try again.');
      }
    }
  };

  // Handle edit user form submission
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateUserForm(currentUser);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Create a copy of the user data to send to the server
      const userData = { ...currentUser };
      
      // Only include password if it's not empty
      if (!userData.password) {
        delete userData.password;
      }
      
      await axios.put(`http://localhost:8000/api/auth/customers/${currentUser.id}/`, userData);
      
      // Update the user in the list
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? { ...user, ...userData } : user
      );
      
      setUsers(updatedUsers);
      
      // Reset form and close modal
      setCurrentUser(null);
      setFormErrors({});
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
      
      // Handle validation errors from the server
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to update user. Please try again.');
      }
    }
  };

  // Format date to local format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserCog className="text-danger" />;
      case 'seller':
        return <FaUserTie className="text-success" />;
      default:
        return <FaUserAlt className="text-primary" />;
    }
  };

  // Filter users by role
  const filteredUsers = filterRole 
    ? users.filter(user => user.role === filterRole)
    : users;

  // Table columns
  const columns = [
    { field: 'id', header: 'ID', sortable: true },
    { 
      field: 'name', 
      header: 'Name', 
      sortable: true,
      render: (item) => (
        <div className="d-flex align-items-center">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${item.first_name} ${item.last_name}`)}&background=random`} 
            alt={`${item.first_name} ${item.last_name}`}
            className="img-circle mr-2"
            width="30"
            height="30"
          />
          {`${item.first_name} ${item.last_name}`}
        </div>
      )
    },
    { field: 'email', header: 'Email', sortable: true },
    { 
      field: 'role', 
      header: 'Role', 
      sortable: true,
      render: (item) => (
        <span>
          {getRoleIcon(item.role)} {item.role ? (item.role.charAt(0).toUpperCase() + item.role.slice(1)) : 'User'}
        </span>
      )
    },
    { 
      field: 'date_joined', 
      header: 'Joined Date', 
      sortable: true,
      render: (item) => formatDate(item.date_joined)
    },
    { 
      field: 'is_active', 
      header: 'Status', 
      sortable: true,
      render: (item) => (
        <div className="custom-control custom-switch">
          <input 
            type="checkbox" 
            className="custom-control-input" 
            id={`status-switch-${item.id}`}
            checked={item.is_active}
            onChange={() => handleActiveToggle(item)}
          />
          <label className="custom-control-label" htmlFor={`status-switch-${item.id}`}>
            {item.is_active ? 'Active' : 'Inactive'}
          </label>
        </div>
      )
    },
    { 
      field: 'actions', 
      header: 'Actions', 
      sortable: false,
      render: (item) => (
        <div className="btn-group">
          <button 
            className="btn btn-sm btn-info mr-1" 
            onClick={() => handleEditUser(item)}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button 
            className="btn btn-sm btn-danger" 
            onClick={() => handleDeleteUser(item)}
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2">Loading users...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Content Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Users Management</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Home</a></li>
                <li className="breadcrumb-item active">Users</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row mb-3">
            <div className="col-md-8">
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="mr-1" /> Add New User
              </button>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <select 
                  className="form-control" 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="seller">Seller</option>
                  <option value="user">User</option>
                </select>
                <div className="input-group-append">
                  <button className="btn btn-outline-secondary" type="button">
                    <FaFilter />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">All Users</h3>
                  <div className="card-tools">
                    <div className="input-group input-group-sm" style={{ width: '150px' }}>
                      <input 
                        type="text" 
                        name="table_search" 
                        className="form-control float-right" 
                        placeholder="Search"
                      />
                      <div className="input-group-append">
                        <button type="submit" className="btn btn-default">
                          <FaSearch />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body table-responsive p-0">
                  <DataTable 
                    columns={columns} 
                    data={filteredUsers} 
                    itemsPerPage={10}
                    sortable={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add New User</h4>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => {
                    setShowAddModal(false);
                    setFormErrors({});
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="first_name">First Name *</label>
                        <input 
                          type="text" 
                          className={`form-control ${formErrors.first_name ? 'is-invalid' : ''}`}
                          id="first_name"
                          name="first_name"
                          value={newUser.first_name}
                          onChange={handleNewUserChange}
                          required
                        />
                        {formErrors.first_name && (
                          <div className="invalid-feedback">{formErrors.first_name}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="last_name">Last Name *</label>
                        <input 
                          type="text" 
                          className={`form-control ${formErrors.last_name ? 'is-invalid' : ''}`}
                          id="last_name"
                          name="last_name"
                          value={newUser.last_name}
                          onChange={handleNewUserChange}
                          required
                        />
                        {formErrors.last_name && (
                          <div className="invalid-feedback">{formErrors.last_name}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input 
                      type="email" 
                      className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleNewUserChange}
                      required
                    />
                    {formErrors.email && (
                      <div className="invalid-feedback">{formErrors.email}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input 
                      type="password" 
                      className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleNewUserChange}
                      required
                    />
                    {formErrors.password && (
                      <div className="invalid-feedback">{formErrors.password}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select 
                      className="form-control"
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleNewUserChange}
                    >
                      <option value="user">User</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <div className="custom-control custom-switch">
                      <input 
                        type="checkbox" 
                        className="custom-control-input" 
                        id="is_active"
                        name="is_active"
                        checked={newUser.is_active}
                        onChange={handleNewUserChange}
                      />
                      <label className="custom-control-label" htmlFor="is_active">Active</label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-default" 
                    onClick={() => {
                      setShowAddModal(false);
                      setFormErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Add User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit User: {currentUser.first_name} {currentUser.last_name}</h4>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentUser(null);
                    setFormErrors({});
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="edit-first_name">First Name *</label>
                        <input 
                          type="text" 
                          className={`form-control ${formErrors.first_name ? 'is-invalid' : ''}`}
                          id="edit-first_name"
                          name="first_name"
                          value={currentUser.first_name}
                          onChange={handleEditUserChange}
                          required
                        />
                        {formErrors.first_name && (
                          <div className="invalid-feedback">{formErrors.first_name}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="edit-last_name">Last Name *</label>
                        <input 
                          type="text" 
                          className={`form-control ${formErrors.last_name ? 'is-invalid' : ''}`}
                          id="edit-last_name"
                          name="last_name"
                          value={currentUser.last_name}
                          onChange={handleEditUserChange}
                          required
                        />
                        {formErrors.last_name && (
                          <div className="invalid-feedback">{formErrors.last_name}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-email">Email *</label>
                    <input 
                      type="email" 
                      className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      id="edit-email"
                      name="email"
                      value={currentUser.email}
                      onChange={handleEditUserChange}
                      required
                    />
                    {formErrors.email && (
                      <div className="invalid-feedback">{formErrors.email}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-password">Password (Leave blank to keep current)</label>
                    <input 
                      type="password" 
                      className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                      id="edit-password"
                      name="password"
                      value={currentUser.password}
                      onChange={handleEditUserChange}
                    />
                    {formErrors.password && (
                      <div className="invalid-feedback">{formErrors.password}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-role">Role</label>
                    <select 
                      className="form-control"
                      id="edit-role"
                      name="role"
                      value={currentUser.role}
                      onChange={handleEditUserChange}
                    >
                      <option value="user">User</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <div className="custom-control custom-switch">
                      <input 
                        type="checkbox" 
                        className="custom-control-input" 
                        id="edit-is_active"
                        name="is_active"
                        checked={currentUser.is_active}
                        onChange={handleEditUserChange}
                      />
                      <label className="custom-control-label" htmlFor="edit-is_active">Active</label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-default" 
                    onClick={() => {
                      setShowEditModal(false);
                      setCurrentUser(null);
                      setFormErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Update User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
