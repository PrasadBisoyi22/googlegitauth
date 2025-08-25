import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleGoogleSignup = () => {
    // Redirect to Google OAuth flow for signup
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleGitHubSignup = () => {
    // Redirect to GitHub OAuth flow for signup
    window.location.href = 'http://localhost:5000/api/auth/github';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/google-auth/login',
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Your Account</h1>
        <p className="auth-subtitle">Sign up for a new account</p>
        
        {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
        
        <button
          onClick={handleGoogleSignup}
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
          onClick={handleGitHubSignup}
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
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          
          <div style={{marginBottom: '15px'}}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        
        <p style={{marginTop: '20px', color: '#666'}}>
          Already have an account?{' '}
          <span 
            style={{color: '#667eea', cursor: 'pointer', textDecoration: 'underline'}}
            onClick={() => navigate('/login')}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
