// client/src/hooks/useAuthService.js

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as authService from '../api/authService';

/**
 * Custom hook to handle login/logout API calls and integrate with AuthContext.
 */
export const useAuthService = () => {
    const { login: contextLogin, logout: contextLogout, enterDemoMode: contextEnterDemoMode } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loginUser = async (credentials) => {
        setIsLoading(true);
        setError(null);
        try {
            // Call the service function (handles demo login logic within the controller)
            const response = await authService.login(credentials); 
            
            // Check if the response indicates successful demo mode login
            if (response.isDemoMode) {
                contextEnterDemoMode(response.user);
            } else {
                // Standard login: JWT is set in HttpOnly cookie by server
                contextLogin(response.user); 
            }
            return response.user; // Return user object on success

        } catch (err) {
            // Error object structured by the Axios interceptor (e.g., { status: 401, message: '...' })
            setError(err.message || 'Login failed.'); 
            console.error('Login error:', err);
            throw err; // Re-throw for component-level handling
        } finally {
            setIsLoading(false);
        }
    };

    const logoutUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Call API to clear the server's HttpOnly cookie
            await authService.logout();
            
            // Clear client-side state
            contextLogout();

        } catch (err) {
            // Logout should usually succeed even if the token is expired/invalid,
            // but we ensure client state is cleared anyway.
            console.warn('Logout API call failed, but clearing client state anyway:', err);
            contextLogout();
        } finally {
            setIsLoading(false);
        }
    };

    return { 
        loginUser, 
        logoutUser, 
        isLoading, 
        error 
    };
};