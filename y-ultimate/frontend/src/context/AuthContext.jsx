import React, { createContext, useState, useEffect, useContext} from 'react';
import authService from '../services/authservice';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(token) {
            try {
                const decoded = jwtDecode(token)

                if(decoded.exp * 1000 > Date.now()) 
                    setUser(decoded.user)
                else {
                    localStorage.removeItem('token')
                    setToken(null)
                    setUser(null)
                }
            } catch (err) {
                console.error('Invalid token ', err);
                localStorage.removeItem('token')
                setToken(null)
                setUser(null)
            }   
        }
        setLoading(false);
    }, [token])

    const login = async (email, password) => {
        const data = await authService.login({ email, password });
        localStorage.setItem('token', data.token);
        setToken(data.token);

        const decoded = jwtDecode(data.token);
        setUser(decoded.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = { user, token, login, logout, isAuthenticated: !!user };

    if(loading) 
        return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={value}>
            { children }
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};