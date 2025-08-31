import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      navigate('/dashboard');
      return;
    }

    // Handle OAuth redirect with token and user data
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const userFromUrl = urlParams.get('user');
    const error = urlParams.get('error');
    const providerFromUrl = urlParams.get('provider');

    if (tokenFromUrl && userFromUrl) {
      // Store token and user data in localStorage
      localStorage.setItem('accessToken', tokenFromUrl);
      localStorage.setItem('user', decodeURIComponent(userFromUrl));
      
      // Immediately redirect to dashboard
      navigate('/dashboard');
      return;
    }

    // Handle OAuth error redirects
    if (error) {
      setError(decodeURIComponent(error));
      setProvider(providerFromUrl || '');
    }
  }, [navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/api/auth/google/callback',
        { credential: credentialResponse.credential },
        { withCredentials: true }
      );

      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Store user data and isLoggedIn flag in localStorage for immediate access
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isLoggedIn', 'true');
        // Also store token in localStorage to match OAuth login behavior
        localStorage.setItem('accessToken', response.data.token);
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const getProviderDisplayName = (provider) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      default:
        return provider;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>
        
        {error && (
          <div style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            border: '1px solid #ffcdd2',
            borderRadius: '4px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
            {provider && (
              <span style={{ display: 'block', marginTop: '5px', fontWeight: 'bold' }}>
                Please use {getProviderDisplayName(provider)} login for your account
              </span>
            )}
          </div>
        )}
        
        <button
          onClick={() => {
            // Redirect to Google OAuth flow
            window.location.href = 'http://localhost:5000/api/auth/google';
          }}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '10px 15px',
            backgroundColor: 'white',
            color: '#444',
            border: '1px solid #dadce0',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'box-shadow 0.2s ease-in-out',
            marginBottom: '10px'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google logo"
            style={{width: '20px', height: '20px', marginRight: '10px'}}
          />
          Continue with Google
        </button>
        
        <button
          onClick={() => {
            // Redirect to GitHub OAuth flow
            window.location.href = 'http://localhost:5000/api/auth/github';
          }}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '10px 15px',
            backgroundColor: 'white',
            color: '#444',
            border: '1px solid #dadce0',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'box-shadow 0.2s ease-in-out',
            marginBottom: '10px'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          <img 
            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
            alt="GitHub logo"
            style={{width: '20px', height: '20px', marginRight: '10px'}}
          />
          Continue with GitHub
        </button>
        
        <div className="divider">or</div>
        
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '15px'}}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div style={{marginBottom: '15px'}}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p style={{marginTop: '20px', color: '#666'}}>
          <span
            style={{color: '#667eea', cursor: 'pointer', textDecoration: 'underline'}}
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </span>
        </p>
        <p style={{marginTop: '10px', color: '#666'}}>
          Don't have an account?{' '}
          <span
            style={{color: '#667eea', cursor: 'pointer', textDecoration: 'underline'}}
            onClick={() => navigate('/signup')}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
