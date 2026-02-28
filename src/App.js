// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Deposits from './pages/Deposits';
import Transactions from './pages/Transactions';
import Stations from './pages/Stations';
import QRManager from './pages/QRManager';
import Profile from './pages/Profile';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  console.log('App rendering'); // Add this to check if App renders

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="deposits" element={<Deposits />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="stations" element={<Stations />} />
            <Route path="qr-manager" element={<QRManager />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Catch all other routes and redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;