import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // First check localStorage for OAuth tokens
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');

        if (token && user) {
          console.log('OAuth token found in localStorage');
          setIsAuthenticated(true);
          setIsChecking(false);
          return;
        }

        // If no localStorage token, check server-side session
        console.log('Checking server-side session...');
        const response = await axios.get('http://localhost:5000/api/auth/verify-session', {
          withCredentials: true
        });

        if (response.data.authenticated) {
          console.log('Server-side session verified');
          // Store user data in localStorage for future checks
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setIsAuthenticated(true);
        } else {
          console.log('No valid session found');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthentication();

    // Listen for storage changes (for OAuth logins)
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' || e.key === 'user') {
        checkAuthentication();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isChecking) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('User authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;
