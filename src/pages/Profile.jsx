import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import { Person } from '@mui/icons-material';

const Profile = () => {
  const user = {
    email: 'admin@fuelpay.com',
    name: 'Admin User',
    role: 'Administrator',
    joinDate: '2024-01-01',
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Profile Settings
        </Typography>
        
        <Box display="flex" alignItems="center" mb={4}>
          <Avatar sx={{ width: 100, height: 100, mr: 3 }}>
            <Person sx={{ fontSize: 60 }} />
          </Avatar>
          <Box>
            <Typography variant="h5">{user.name}</Typography>
            <Typography color="textSecondary">{user.email}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {user.role} • Joined {user.joinDate}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              defaultValue={user.name}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              defaultValue={user.email}
              margin="normal"
              type="email"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              margin="normal"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button variant="contained">
            Update Profile
          </Button>
          <Button variant="outlined">
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;