// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Deposits from './pages/Deposits';
import Transactions from './pages/Transactions';
import Stations from './pages/Stations';
import QRManager from './pages/QRManager';
import Login from './pages/Login';
import Profile from './pages/Profile';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="deposits" element={<Deposits />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="stations" element={<Stations />} />
            <Route path="qr-manager" element={<QRManager />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;