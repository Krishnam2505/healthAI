import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  // Grab the user data and the logout function from our global radio tower (AuthContext)
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Destroy the token
    navigate('/login'); // Send them to the login screen
  };

  return (
    <>
      <nav className="navbar">
        {/* Left Side: Logo */}
        <div className="navbar-left">
          <span className="logo">⚡ FitAI</span>
        </div>

        {/* Center: Navigation Links */}
        <div className="navbar-center">
          {/* NavLink is a special React Router component. It automatically knows if it is the "active" page! */}
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Dashboard
          </NavLink>
          <NavLink to="/log" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Log
          </NavLink>
          <NavLink to="/plan" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Weekly Plan
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Nutritionist
          </NavLink>
        </div>

        {/* Right Side: Profile & Logout */}
        <div className="navbar-right">
          {/* Use optional chaining (?.) just in case the user data hasn't loaded yet */}
          <span className="user-greeting">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
          <button onClick={handleLogout} className="btn-secondary btn-sm">Logout</button>
        </div>
      </nav>

      {/* Component-Specific Styles */}
      <style>{`
        .navbar {
          position: fixed; /* Sticks to the very top of the screen */
          top: 0;
          left: 0;
          width: 100%;
          height: 64px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
          z-index: 1000; /* Ensure it stays on top of everything else */
        }

        /* Add padding to the body so the fixed navbar doesn't cover the top of our pages */
        body {
          padding-top: 64px;
        }

        .logo {
          color: var(--accent-green);
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .navbar-center {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
          padding-bottom: 4px;
          border-bottom: 2px solid transparent; /* Invisible border by default */
        }

        .nav-link:hover {
          color: var(--text-primary);
        }

        /* When the URL matches the NavLink, React automatically applies this .active class! */
        .nav-link.active {
          color: var(--accent-green);
          border-bottom: 2px solid var(--accent-green);
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .user-greeting {
          color: var(--text-primary);
          font-weight: 500;
        }

        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}
