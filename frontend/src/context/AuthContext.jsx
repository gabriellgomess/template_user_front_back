// src/context/AuthContext.jsx
import React, { createContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para redirecionamento

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/login`, { email, password });
      const { token } = response.data;
      sessionStorage.setItem('token', token);
      setAuthToken(token);
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setAuthToken(null);
    navigate('/'); // Redirecionar para a página pública após o logout
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
