// AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedDemoMode = localStorage.getItem('isDemoMode') === 'true';

    if (storedDemoMode) {
      setIsDemoMode(true);
      setUser({ role: 'guest_demo' });
      setToken('dummy_token');
    } else if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const decodedToken = jwtDecode(storedToken);

        if (decodedToken.exp * 1000 < Date.now()) {
          console.warn('AuthContext: Stored token is EXPIRED. Clearing session.');
          logout();
        } else {
          setUser(parsedUser);
          setToken(storedToken);
          // *** ADD THIS LOG ***
          console.log('AuthContext useEffect: User parsed from localStorage on initial load:', parsedUser);
          // *********************
        }

      } catch (error) {
        console.error('AuthContext: Failed to parse or decode stored data/token:', error);
        logout();
      }
    } else {
      // console.log('AuthContext: No token or user found in localStorage.'); // Uncomment for more verbosity
    }
    setLoading(false);
  }, []); // Empty dependency array means this runs once on mount

  const login = (userData, jwtToken) => {
    // *** ADD THESE LOGS ***
    console.log('AuthContext Login: userData RECEIVED by login function:', userData);
    // *********************

    setIsDemoMode(false);
    localStorage.removeItem('isDemoMode');

    setUser(userData); // This updates the React state
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData)); // This updates localStorage

    // *** ADD THIS LOG ***
    console.log('AuthContext Login: User object STRINGIFIED and SAVED to localStorage:', JSON.stringify(userData));
    // *********************
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsDemoMode(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isDemoMode');
  };

  const enterDemoMode = () => {
    const demoUser = {
      role: 'guest_demo',
      first_name: 'Demo',
      last_name: 'User',
      username: 'demo_user',
    };

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(demoUser);
    setToken('dummy_token');
    setIsDemoMode(true);
    localStorage.setItem('isDemoMode', 'true');
    localStorage.setItem('user', JSON.stringify(demoUser));
  };

  const getApiPrefix = () => {
    return isDemoMode ? '/demo/api' : '/api';
  };

  // Provide auth state and functions to children components
  const contextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isDemoMode,
    login,
    logout,
    enterDemoMode,
    getApiPrefix,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};