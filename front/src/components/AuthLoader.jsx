import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from '../store/slices/authSlice';

/**
 * Component that loads user data on application startup
 * This ensures that user role information is available for protected routes
 */
const AuthLoader = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Only try to load user data if we have a token but no user data yet
    if (isAuthenticated && !user) {
      dispatch(loadUser());
    }
  }, [dispatch, isAuthenticated, user]);

  return children;
};

export default AuthLoader;
