import React, { useEffect } from 'react';
import './index.css';

import AppRouter from './router/AppRouter';

import { AuthProvider } from './context/AuthContext'; 
import { ThemeProvider } from './context/ThemeContext'; 


function App() {
  
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;