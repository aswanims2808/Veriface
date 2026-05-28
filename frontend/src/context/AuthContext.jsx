import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for existing session on mount
        const initAuth = async () => {
            const token = localStorage.getItem('veriface_token');
            const storedUser = localStorage.getItem('veriface_user');

            if (token && storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                    // Optionally verify token with backend
                    // authAPI.verify().catch(() => logout());
                } catch (e) {
                    localStorage.removeItem('veriface_token');
                    localStorage.removeItem('veriface_user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const data = await authAPI.login(username, password);
            setUser(data.user);
            setIsAuthenticated(true);
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                message: error.response?.data?.error || 'Login failed. Please check your credentials.'
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password) => {
        setLoading(true);
        try {
            const data = await authAPI.register(username, email, password);
            return { success: true, message: data.message };
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                message: error.response?.data?.error || 'Registration failed.'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
