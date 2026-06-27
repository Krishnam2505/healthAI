import React, { createContext, useContext, useState } from 'react';

// 1. Create the Context (The central brain for authentication data)
const AuthContext = createContext();

export default function AuthProvider({ children }) {
  // 2. Initialize State
  // Why do we read from localStorage here instead of just starting with `null`?
  // Because if a user hits the "Refresh" button on their browser, React completely destroys all its memory and restarts.
  // By checking localStorage first, React instantly pulls their saved token from the browser's hard drive and 
  // they magically stay logged in!
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // 3. The Login Function
  // Any component (like the Login Page) can call this function and pass in the user data & token
  const login = (userData, newToken) => {
    // Save it into React's short-term memory (State) so the screen updates immediately
    setUser(userData);
    setToken(newToken);
    
    // Save it into the Browser's long-term memory (localStorage) so it survives a page refresh
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', newToken);
  };

  // 4. The Logout Function
  // Any component can call this to destroy the session
  const logout = () => {
    // Clear React's short-term memory
    setUser(null);
    setToken(null);
    
    // Clear the Browser's long-term memory
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // 5. Wrap the entire app and provide these 4 pieces of data/functions to everything inside
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 6. Create a custom Hook
// This makes it extremely easy for any file to access this data. 
// Instead of writing 3 lines of code in every file to pull the Context, they just write: const { user, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
