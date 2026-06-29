import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // State to track if the mobile hamburger menu is open or closed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper function to close the menu when a user clicks a link on mobile
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        {/* Left Side: Logo */}
        <div className="navbar-left">
          <span className="logo">⚡ FitAI</span>
        </div>

        {/* Center: Navigation Links (Hidden on Mobile) */}
        <div className="navbar-center desktop-only">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Dashboard
          </NavLink>
          <NavLink to="/log" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Log
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            History
          </NavLink>
          {user?.gender === 'female' && (
            <NavLink to="/cycle" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Cycle
            </NavLink>
          )}
          <NavLink to="/plan" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Weekly Plan
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Nutritionist
          </NavLink>
        </div>

        {/* Right Side: Profile & Logout (Hidden on Mobile) */}
        <div className="navbar-right desktop-only">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn" 
            aria-label="Toggle Theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <span className="user-greeting">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
          <button onClick={handleLogout} className="btn-secondary btn-sm">Logout</button>
        </div>

        {/* Hamburger Button (Hidden on Desktop, Visible on Mobile) */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* The Mobile Dropdown Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"}>
          Dashboard
        </NavLink>
        <NavLink to="/log" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"}>
          Log
        </NavLink>
        <NavLink to="/history" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"}>
          History
        </NavLink>
        {user?.gender === 'female' && (
          <NavLink to="/cycle" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"}>
            Cycle
          </NavLink>
        )}
        <NavLink to="/plan" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"}>
          Weekly Plan
        </NavLink>
        <NavLink to="/chat" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"}>
          Nutritionist
        </NavLink>
        
        <div className="mobile-menu-footer">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn" 
            aria-label="Toggle Theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <span className="user-greeting">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
          <button onClick={handleLogout} className="btn-secondary btn-sm">Logout</button>
        </div>
      </div>

      <style>{`
        /* --- GLOBAL NAVBAR STYLES --- */
        .navbar {
          position: fixed;
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
          z-index: 1000;
        }

        body {
          padding-top: 64px;
        }

        .logo {
          color: var(--accent-green);
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        /* --- DESKTOP STYLES --- */
        .desktop-only {
          display: flex;
        }

        .navbar-center {
          gap: 2rem;
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
          padding-bottom: 4px;
          border-bottom: 2px solid transparent;
        }

        .nav-link:hover {
          color: var(--text-primary);
        }

        .nav-link.active {
          color: var(--accent-green);
          border-bottom: 2px solid var(--accent-green);
        }

        .navbar-right {
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

        .theme-toggle-btn {
          background: transparent;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: var(--text-primary);
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .theme-toggle-btn:hover {
          background: var(--bg-card-hover);
        }

        /* --- MOBILE STYLES (Hidden by default on Desktop) --- */
        .mobile-menu-btn {
          display: none; /* Invisible on large screens */
          background: transparent;
          border: none;
          font-size: 1.8rem;
          color: var(--text-primary);
          cursor: pointer;
        }

        .mobile-menu {
          display: none;
        }

        /* --- THE MAGIC RESPONSIVE BREAKPOINT --- */
        /* Any screen smaller than 768px (tablets and phones) will run this CSS! */
        @media (max-width: 768px) {
          
          /* Shrink the padding so the logo doesn't touch the edges */
          .navbar { padding: 0 1rem; }

          /* Erase the center and right desktop containers completely */
          .desktop-only { display: none !important; }

          /* Make the hamburger icon visible */
          .mobile-menu-btn { display: block; }

          /* Style the fullscreen mobile dropdown */
          .mobile-menu {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 64px; /* Just beneath the navbar */
            left: 0;
            width: 100%;
            height: calc(100vh - 64px); /* Fills the rest of the screen */
            background: var(--bg-card);
            z-index: 999;
            padding: 1.5rem;
            /* Start it off-screen to the right */
            transform: translateX(100%); 
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-top: 1px solid var(--border);
          }

          /* When the 'open' class is added via React State, it slides into view! */
          .mobile-menu.open {
            transform: translateX(0);
          }

          .mobile-link {
            font-size: 1.25rem;
            color: var(--text-secondary);
            text-decoration: none;
            padding: 1.25rem 0;
            border-bottom: 1px solid var(--border);
            font-weight: 600;
          }

          .mobile-link.active {
            color: var(--accent-green);
          }

          .mobile-menu-footer {
            margin-top: auto; /* Pushes the profile/logout to the very bottom of the screen */
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 2rem;
          }
        }
      `}</style>
    </>
  );
}
