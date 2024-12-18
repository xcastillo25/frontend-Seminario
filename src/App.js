import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/code/ContextAuth.js';

import Dashboard from './components/code/Dashboard';
import Login from './components/code/Login';
import Consumos from './components/code/Consumos';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Si el estado de autenticación está en proceso de carga, puedes mostrar un loader
  if (isLoading) {
    return <div>Loading...</div>; // O tu componente de carga
  }

  // Si el usuario no está autenticado, redirigir al login
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta raíz redirige a la sesión */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Ruta protegida */}
            <Route path="/home" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />
            <Route path="/consumos" element={<Consumos />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
