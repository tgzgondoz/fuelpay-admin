// src/pages/Profile.jsx
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();

  const handleUpdate = () => {
    toast.success('Profile updated (demo)');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#1a73e8', fontSize: 32 }}>
            {user?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ ml: 3 }}>
            <Typography variant="h5">{user?.email}</Typography>
            <Typography color="textSecondary">Administrator</Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Display Name"
              defaultValue={user?.displayName || ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleUpdate}>
            Update Profile
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}