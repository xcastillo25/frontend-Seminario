import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/code/ContextAuth.js';

import Dashboard from './components/code/Dashboard';
// import AdminDashboard from './components/code/AdminDashboard';
import Login from './components/code/Login';
// import AdminLogin from './components/code/AdminLogin';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/session" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/session" replace />} />
            <Route path="/home" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            {/* <Route path="/home" element={<Dashboard />} /> */}
            <Route path="/session" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
