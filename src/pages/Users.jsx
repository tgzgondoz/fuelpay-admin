// src/pages/Users.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon
} from '@mui/icons-material';
import { ref, onValue, update } from 'firebase/database';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { rtdb } from '../services/firebase'; // Import Realtime Database

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up real-time listener for users
    const usersRef = ref(rtdb, 'users');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert the object to an array and add the uid as id
          const usersArray = Object.entries(data).map(([uid, userData]) => ({
            id: uid,
            uid: uid,
            ...userData
          }));
          
          setUsers(usersArray);
          setFilteredUsers(usersArray);
          setError(null);
        } else {
          setUsers([]);
          setFilteredUsers([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error processing users data:', err);
        setError('Failed to load users data');
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching users:', error);
      setError('Failed to connect to database');
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.accountNumber?.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      
      // Update in Firebase Realtime Database
      const userRef = ref(rtdb, `users/${userId}`);
      await update(userRef, { status: newStatus });
      
      toast.success(`User ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading users...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search users by name, email, phone, or account number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper sx={{ p: 2 }}>
        {filteredUsers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {searchTerm ? 'No users found matching your search' : 'No users found'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>{getInitials(user.name)}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.name || 'No name'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user.email || 'No email'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.accountNumber || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {user.phone || 'No phone'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {formatCurrency(user.balance)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status || 'unknown'}
                        color={
                          user.status === 'active' ? 'success' : 
                          user.status === 'suspended' ? 'error' : 
                          'default'
                        }
                        size="small"
                        icon={user.status === 'active' ? <ActiveIcon /> : <BlockIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      {formatDate(user.lastLogin)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        color={user.status === 'active' ? 'error' : 'success'}
                        onClick={() => toggleUserStatus(user.id, user.status)}
                        disabled={!user.status}
                      >
                        {user.status === 'active' ? 'Suspend' : 
                         user.status === 'suspended' ? 'Activate' : 
                         'Set Status'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="caption" color="textSecondary">
            Total Users: {filteredUsers.length}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}