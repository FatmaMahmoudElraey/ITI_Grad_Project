import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { activateAccount } from '../store/slices/authSlice';
import { Box, Typography, Paper, Container, Alert, CircularProgress } from '@mui/material';

export default function ActivateAccount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [activationAttempted, setActivationAttempted] = useState(false);
  
  const { loading, success, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (uid && token && !activationAttempted) {
      dispatch(activateAccount({ uid, token }));
      setActivationAttempted(true);
    }
  }, [dispatch, uid, token, activationAttempted]);

  useEffect(() => {
    if (success && !loading && activationAttempted) {
      // Redirect to login page after 3 seconds on successful activation
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, loading, navigate, activationAttempted]);

  // Format error message for display
  const getErrorMessage = () => {
    if (!error) return '';
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (typeof error === 'object') {
      // Try to extract a meaningful message from the error object
      if (error.detail) return error.detail;
      if (error.message) return error.message;
      
      // If it's an object with multiple fields, join them
      return Object.entries(error)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('; ');
    }
    
    return 'Account activation failed. Please try again or contact support.';
  };

  return (
    <Container style={{height:"50vh"}} maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Account Activation
        </Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && !loading && (
          <Alert severity="error" sx={{ my: 2 }}>
            {getErrorMessage()}
          </Alert>
        )}
        
        {success && !loading && (
          <>
            <Alert severity="success" sx={{ my: 2 }}>
              {success}
            </Alert>
            <Typography variant="body1">
              Redirecting to login page...
            </Typography>
          </>
        )}
        
        {!loading && !success && !error && (
          <Typography variant="body1">
            Processing your account activation...
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
