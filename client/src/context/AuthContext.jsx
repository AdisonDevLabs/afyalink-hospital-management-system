// AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // --- Initial Load Effect ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedDemoMode = localStorage.getItem('isDemoMode');

    if (storedDemoMode) {
      // Demo Mode
      setIsDemoMode(true);
      setUser({ role: 'guest_demo', ...JSON.parse(storedUser || '{}') });
    } else if (storedUser) {
      try {
        // Standard User
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
        console.log('AuthContext useEffect: User session restored from localStorage:', parsedUser.username);

      } catch (error) {
        console.error('AuthContext: Failed to parse stored user data. Clearing session.', error);
        logout();
      }
    } 
    setLoading(false);
  }, []);


  // --- Authentication Actions ---

  const login = (userData) => {
    console.log('AuthContext Login: User data received and saved:', userData.username);

    // Clear demo flags
    setIsDemoMode(false);
    localStorage.removeItem('isDemoMode');

    // Set user state and localStorage
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsDemoMode(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isDemoMode');
  };

  const enterDemoMode = (demoUser) => {
    localStorage.removeItem('user');

    setUser(demoUser);
    setIsDemoMode(true);
    localStorage.setItem('isDemoMode', 'true');
    localStorage.setItem('user', JSON.stringify(demoUser));
  };

  const getApiPrefix = () => {
    const base = import.meta.env.VITE_BACKEND_URL || '';
    return isDemoMode ? '/demo/api' : `${base}/api`;
  };

  // Provide auth state and functions to children components
  const contextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    isDemoMode,
    login,
    logout,
    enterDemoMode,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth musth be within an AuthProvider');
  }
  return context;
};