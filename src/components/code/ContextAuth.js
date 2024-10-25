import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear un contexto de autenticación
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulación de verificación del token en localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Aquí podrías hacer una llamada a la API para validar el token
      // Si es válido, establecer el usuario
      setUser(JSON.parse(localStorage.getItem('user')));
    } else {
      // Si no hay token o no es válido, eliminar el usuario
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

