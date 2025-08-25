import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      console.log('Checking auth in ProtectedRoute:', token && user ? 'Token and user exist' : 'Missing credentials');
      setHasToken(!!token && !!user);
      setIsChecking(false);
    };

    // Check token immediately
    checkToken();
    
    // Check multiple times to handle race conditions
    const intervalId = setInterval(() => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        setHasToken(true);
        setIsChecking(false);
        clearInterval(intervalId);
      }
    }, 50);

    // Stop checking after 1 second
    setTimeout(() => {
      clearInterval(intervalId);
      setIsChecking(false);
    }, 1000);

    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        checkToken();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  if (isChecking) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Checking authentication...</div>;
  }

  if (!hasToken) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('Token found, rendering protected content');
  return children;
};

export default ProtectedRoute;
