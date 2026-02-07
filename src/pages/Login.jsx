// src/pages/Login.jsx
import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For testing - use hardcoded credentials if Firebase is not configured
      if (!process.env.REACT_APP_FIREBASE_API_KEY) {
        // Use hardcoded credentials for demo
        if (email === 'admin@fuelpay.com' && password === 'admin123') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userName', 'Admin User');
          toast.success('Login successful!');
          
          // Force a page reload to update the App.js authentication state
          window.location.href = '/';
          return;
        } else {
          toast.error('Invalid email or password');
          setLoading(false);
          return;
        }
      }

      // Firebase login
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      toast.success('Login successful!');
      
      // Force a page reload to update the App.js authentication state
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Admin Login
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
        
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Demo Credentials:<br />
          Email: admin@fuelpay.com<br />
          Password: admin123
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;