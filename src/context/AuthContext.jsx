import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing auth on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { user: userData, token: authToken } = response.data.data;

        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setToken(authToken);
        setUser(userData);

        return userData;
    };

    const register = async (userData) => {
        const response = await authAPI.register(userData);
        const { user: newUser, token: authToken } = response.data.data;

        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        setToken(authToken);
        setUser(newUser);

        return newUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = () => {
        return !!token && !!user;
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const isVictim = () => hasRole('victim');
    const isVolunteer = () => hasRole('volunteer');
    const isAdmin = () => hasRole('admin');

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
        isVictim,
        isVolunteer,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
