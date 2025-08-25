import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check localStorage for existing token and user
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (!token) {
          navigate('/login');
          return;
        }

        if (storedUser) {
          // Use stored user data
          setUser(JSON.parse(storedUser));
        } else {
          // Fetch user data using token
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Only redirect to login if there's no token or token is invalid
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch user data if we have a token
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      fetchUserData();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="dashboard-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div className="dashboard-card" style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1>Welcome, {user.name}!</h1>
        <div className="user-info">
          <img 
            src={user.avatar || 'https://via.placeholder.com/150'} 
            alt="User Avatar" 
            style={{width: '100px', height: '100px', borderRadius: '50%', marginBottom: '20px'}}
          />
          <h2>{user.name}</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Provider:</strong> {user.authProvider}</p>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={handleLogout}
            style={{
              margin: '10px',
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
