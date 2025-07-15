import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // <--- ADD THIS IMPORT

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user info { id, username, role }
  const [token, setToken] = useState(null); // Stores JWT token
  const [loading, setLoading] = useState(true); // indicate if auth state is being loaded

  useEffect(() => {
    // On component mount, check for existing token in localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser); // Parse user data first
        const decodedToken = jwtDecode(storedToken); // <--- DECODE THE TOKEN

        // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
        if (decodedToken.exp * 1000 < Date.now()) { // <--- ADD EXPIRY CHECK
          console.warn('AuthContext: Stored token is EXPIRED. Clearing session.');
          logout(); // Clear invalid data if token is expired
        } else {
          setUser(parsedUser); // Set user only if token is valid
          setToken(storedToken); // Set token only if token is valid
        }

      } catch (error) {
        console.error('AuthContext: Failed to parse or decode stored data/token:', error);
        logout(); // Clear invalid data if parsing/decoding fails
      }
    } else {
    }
    setLoading(false); // Finished loading regardless of token presence/validity
  }, []); // Empty dependency array means this runs only once on mount

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Provide auth state and functions to children components
  const contextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};