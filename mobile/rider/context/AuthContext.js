import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('riderToken');
        if (stored) setToken(stored);
      } catch (e) {
        console.log('Storage read error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (phone, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, {
      phone,
      password,
      role: 'rider',
    });
    const newToken = res.data.token;
    await AsyncStorage.setItem('riderToken', newToken);
    setToken(newToken);
    return res.data.user;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('riderToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);