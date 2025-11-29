import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser, refreshToken } from '../store/slices/authSlice';

const AuthLoader = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(refreshToken()).finally(() => {
      dispatch(loadUser());
    });
  }, [dispatch]);

  return children;
};

export default AuthLoader;
