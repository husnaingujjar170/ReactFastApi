import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    if (storedUsers[username] && storedUsers[username].password === password) {
      const token = `fake-jwt-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ username }));
      setIsAuthenticated(true);
      setUser({ username });
      return true;
    }
    return false;
  };

  const signup = (username, email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    if (storedUsers[username]) {
      return false;
    }
    storedUsers[username] = { email, password };
    localStorage.setItem('users', JSON.stringify(storedUsers));
    const token = `fake-jwt-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify({ username }));
    setIsAuthenticated(true);
    setUser({ username });
    return true;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};