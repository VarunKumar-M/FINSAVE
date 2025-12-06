import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({ username: decoded.sub }); // "sub" claim from JWT
            } catch (e) {
                console.error("Invalid token", e);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await authApi.post('/login', { username, password });
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        const decoded = jwtDecode(access_token);
        setUser({ username: decoded.sub });
    };

    const register = async (username, password) => {
        await authApi.post('/register', { username, password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
