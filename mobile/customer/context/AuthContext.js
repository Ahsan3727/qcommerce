import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('customerToken');
      if (stored) setToken(stored);
      setLoading(false);
    })();
  }, []);

  const login = async (phone, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { phone, password, role: 'customer' });
    const { token, user } = res.data;
    await AsyncStorage.setItem('customerToken', token);
    setToken(token);
    setUser(user);
    return user;
  };

  const register = async (phone, password, name) => {
    const res = await axios.post(`${API_URL}/api/auth/register/customer`, { phone, password, name });
    const { token, user } = res.data;
    await AsyncStorage.setItem('customerToken', token);
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('customerToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);