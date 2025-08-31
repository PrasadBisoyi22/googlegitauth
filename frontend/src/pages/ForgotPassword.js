import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/forgot-password',
        { email },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Password reset email sent. Please check your inbox.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">Enter your email to receive a password reset link</p>

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
          </div>
        )}

        {success && (
          <div style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            border: '1px solid #c8e6c9',
            borderRadius: '4px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

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
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>

        <p style={{marginTop: '20px', color: '#666'}}>
          Remember your password?{' '}
          <span
            style={{color: '#667eea', cursor: 'pointer', textDecoration: 'underline'}}
            onClick={() => navigate('/login')}
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
