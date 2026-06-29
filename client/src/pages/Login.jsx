import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios'; // Our custom Messenger with the Interceptor built in!
import { useAuth } from '../context/AuthContext';

export default function Login() {
  // 1. Set up the memory (State) for this specific page
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Used to show a spinning wheel or disable the button while waiting

  const navigate = useNavigate();
  const { login } = useAuth(); // Tune into the global radio tower

  // 2. The Core Login Function
  const handleLogin = async () => {
    // Basic validation to make sure they actually typed something
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(''); // Clear any previous errors from the screen

    try {
      // POST the data to our Node.js backend. 
      // Because we set the baseURL in axios.js, this automatically goes to http://localhost:5001/api/auth/login
      const response = await api.post('/auth/login', { email, password });

      // If the backend says "Success!", it will hand us the user profile and the secret JWT token.
      // We instantly hand those two things to our Context (which saves them to localStorage)
      login(response.data.user, response.data.token);

      // Navigate them to the Protected Dashboard!
      navigate('/');
    } catch (err) {
      // If the backend says "Error: Invalid Password", we grab that specific message and show it on screen.
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      // Whether it succeeded or failed, stop the loading state
      setLoading(false);
    }
  };

  // Auto-login for recruiters!
  const handleGuestLogin = () => {
    setEmail('guest@fitai.com');
    setPassword('guest123');
    
    // We write a quick inline login specifically for the guest
    setLoading(true);
    setError('');
    api.post('/auth/login', { email: 'guest@fitai.com', password: 'guest123' })
      .then(response => {
        login(response.data.user, response.data.token);
        navigate('/');
      })
      .catch(err => {
        setError('Guest account not found! Please register guest@fitai.com first.');
        setLoading(false);
      });
  };

  // 3. User Experience Feature
  // If the user types their password and hits the "Enter" key on their keyboard, we want it to submit the form!
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <>
      <div className="login-page">
        {/* We reuse the global .card class we built in Chunk 7.1! */}
        <div className="card login-card">

          <div className="login-header">
            <h1 className="login-logo">⚡ FitAI</h1>
            <p className="login-subtitle">Welcome back</p>
          </div>

          {/* Email Input */}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
            />
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
            />
          </div>

          {/* Only draw the error box if the 'error' state actually contains text */}
          {error && <div className="error-message">{error}</div>}

          <button
            className="btn-primary login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button 
            className="btn-secondary login-btn guest-btn" 
            onClick={handleGuestLogin}
            disabled={loading}
          >
            🕵️‍♂️ Try as Guest
          </button>

          <div className="login-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--bg-primary);
          padding: 1rem; 
        }

        .login-card {
          width: 100%;
          max-width: 400px; /* Prevents the card from stretching too wide on desktop monitors */
          display: flex;
          flex-direction: column;
          gap: 1.5rem; /* Puts perfect spacing between every element */
        }

        .login-header {
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .login-logo {
          color: var(--accent-green);
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.25rem;
        }

        .login-subtitle {
          color: var(--text-secondary);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
        }

        .input-group input {
          width: 100%;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        /* Beautiful glowing green border when the user clicks on the input */
        .input-group input:focus {
          outline: none;
          border-color: var(--accent-green);
        }

        .error-message {
          color: var(--accent-red);
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
          background: rgba(239, 68, 68, 0.1); /* 10% opacity Red */
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .login-btn {
          width: 100%;
          margin-top: 0.5rem;
          padding: 0.8rem;
          font-size: 1rem;
        }

        /* If the loading state is true, fade the button so they know they can't click it twice */
        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .guest-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-primary);
          margin-top: -0.5rem;
        }

        .guest-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--text-secondary);
        }

        .login-footer {
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 1rem;
        }

        .login-footer a {
          color: var(--accent-green);
          text-decoration: none;
          font-weight: 600;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
