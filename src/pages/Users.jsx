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
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Mock data
      setUsers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+2348012345678',
          accountNumber: 'ZQ100001',
          balance: 15000,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+2348023456789',
          accountNumber: 'ZQ100002',
          balance: 25000,
          status: 'active',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '+2348034567890',
          accountNumber: 'ZQ100003',
          balance: 8000,
          status: 'suspended',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    toast.success(`User ${newStatus} successfully`);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search users by name, email, or phone..."
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
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
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.accountNumber}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {user.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      ₦{user.balance.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'error'}
                      size="small"
                      icon={user.status === 'active' ? <ActiveIcon /> : <BlockIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color={user.status === 'active' ? 'error' : 'success'}
                      onClick={() => toggleUserStatus(user.id, user.status)}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}