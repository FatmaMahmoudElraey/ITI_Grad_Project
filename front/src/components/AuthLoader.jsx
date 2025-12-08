import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { loadUser, refreshToken } from '../store/slices/authSlice';

const AuthLoader = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname || '';
    const skipPaths = [
      '/login',
      '/register',
      '/reset-password',
      '/reset-password-confirm',
      '/activate',
    ];

    const shouldSkip = skipPaths.some((p) => pathname.startsWith(p));
    if (shouldSkip) return;

    dispatch(refreshToken()).finally(() => {
      dispatch(loadUser());
    });
  }, [dispatch, location.pathname]);

  return children;
};

export default AuthLoader;
