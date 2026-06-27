import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  // 1. All the state required for registering a new user
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('maintain'); // Default value
  const [gender, setGender] = useState('other'); // Default value
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(2000); // Default value
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // 2. The core registration function
  const handleRegister = async () => {
    // Client-Side Validation: Catch obvious errors before bothering the server
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // POST to our backend /api/auth/register route
      // We wrap dailyCalorieTarget in Number() just to be absolutely sure it doesn't send as a String
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        password, 
        goal, 
        gender,
        dailyCalorieTarget: Number(dailyCalorieTarget) 
      });
      
      // The backend returns a brand new Token! Log them in instantly.
      login(response.data.user, response.data.token);
      
      // Teleport them to their brand new Dashboard!
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Submit on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <>
      <div className="login-page">
        <div className="card login-card register-card">
          <div className="login-header">
            <h1 className="login-logo">⚡ FitAI</h1>
            <p className="login-subtitle">Create your account</p>
          </div>

          <div className="input-group">
            <label>Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="John Doe"
            />
          </div>

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

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
            />
            <span className="input-hint">Minimum 6 characters</span>
          </div>

          {/* Put Goal and Calories side-by-side to save vertical space */}
          <div className="input-row">
            <div className="input-group">
              <label>Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="lose">Lose weight</option>
                <option value="maintain">Maintain weight</option>
                <option value="gain">Gain weight</option>
              </select>
            </div>

            <div className="input-group">
              <label>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="other">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Daily Calories</label>
            <input 
              type="number" 
              value={dailyCalorieTarget}
              onChange={(e) => setDailyCalorieTarget(e.target.value)}
              onKeyDown={handleKeyDown}
              step="50"
              min="1000"
              max="5000"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            className="btn-primary login-btn" 
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="login-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>

      <style>{`
        /* These styles mirror the Login page, ensuring a consistent design language */
        .login-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--bg-primary);
          padding: 2rem 1rem; /* Extra vertical padding so it doesn't hit the screen edges on short monitors */
        }

        .login-card {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem; /* Slightly tighter gap than login to fit more fields */
        }

        .register-card {
          max-width: 450px; /* Slightly wider than the login card to fit the side-by-side inputs */
        }

        .login-header {
          text-align: center;
          margin-bottom: 0.25rem;
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
          flex: 1; /* Allows items inside input-row to take up exactly 50% width each */
        }

        .input-row {
          display: flex;
          gap: 1rem;
        }

        /* Mobile Responsiveness: Break the side-by-side row into a column on very small phones */
        @media (max-width: 480px) {
          .input-row {
            flex-direction: column;
          }
        }

        .input-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
        }

        .input-group input, .input-group select {
          width: 100%;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .input-group input:focus, .input-group select:focus {
          outline: none;
          border-color: var(--accent-green);
        }

        .input-hint {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: -0.25rem;
        }

        .error-message {
          color: var(--accent-red);
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
          background: rgba(239, 68, 68, 0.1);
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

        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
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
