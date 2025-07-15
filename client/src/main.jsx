import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> {/* BrowserRouter wraps the entire app */}
      <AuthProvider> { /* AuthProvider makes auth context available */ }
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);