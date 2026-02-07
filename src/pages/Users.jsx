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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  InputAdornment,
  Alert,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  AccountBalance as BalanceIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    loadUsers();
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

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Mock data for development
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+2348012345678',
          accountNumber: 'ZQ100001',
          balance: 15000,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+2348023456789',
          accountNumber: 'ZQ100002',
          balance: 25000,
          status: 'active',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastLogin: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '+2348034567890',
          accountNumber: 'ZQ100003',
          balance: 8000,
          status: 'suspended',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          lastLogin: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '4',
          name: 'Sarah Williams',
          email: 'sarah@example.com',
          phone: '+2348045678901',
          accountNumber: 'ZQ100004',
          balance: 35000,
          status: 'active',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          lastLogin: new Date().toISOString()
        },
        {
          id: '5',
          name: 'David Brown',
          email: 'david@example.com',
          phone: '+2348056789012',
          accountNumber: 'ZQ100005',
          balance: 12000,
          status: 'active',
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          lastLogin: new Date().toISOString()
        }
      ];
      
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleDeposit = (user) => {
    setSelectedUser(user);
    setDepositAmount('');
    setOpenDialog(true);
    handleMenuClose();
  };

  const processDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const amount = parseFloat(depositAmount);
      
      // Update user balance in state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === selectedUser.id
            ? { ...user, balance: user.balance + amount }
            : user
        )
      );

      toast.success(`Successfully deposited ₦${amount.toLocaleString()} to ${selectedUser.name}`);
      setOpenDialog(false);
      setSelectedUser(null);
      
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error('Failed to process deposit');
    }
  };

  const toggleUserStatus = (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: newStatus }
            : user
        )
      );

      toast.success(`User status updated to ${newStatus}`);
      handleMenuClose();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          User Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <TextField
          fullWidth
          placeholder="Search users by name, email, phone, or account number..."
          variant="outlined"
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

      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>User Details</TableCell>
                <TableCell>Account Info</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#1a73e8' }}>
                        {getInitials(user.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {user.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            {user.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      <strong>Account:</strong> {user.accountNumber}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>Last Login:</strong> {format(new Date(user.lastLogin), 'dd MMM yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ₦{user.balance?.toLocaleString()}
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
                    <IconButton onClick={(e) => handleMenuClick(e, user.id)} size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDeposit(users.find(u => u.id === selectedUserId))}>
          <BalanceIcon fontSize="small" sx={{ mr: 1 }} />
          Make Deposit
        </MenuItem>
        <MenuItem onClick={() => toggleUserStatus(selectedUserId, 
          users.find(u => u.id === selectedUserId)?.status)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Toggle Status
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* Deposit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? `Deposit to ${selectedUser.name}` : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          {selectedUser ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Current Balance: ₦{selectedUser.balance?.toLocaleString()}
              </Alert>
              <TextField
                autoFocus
                margin="dense"
                label="Deposit Amount (₦)"
                type="number"
                fullWidth
                variant="outlined"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₦</InputAdornment>
                  ),
                }}
              />
            </>
          ) : (
            <Box>
              <Typography>Add new user form here...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={processDeposit} 
            variant="contained"
            disabled={!depositAmount}
          >
            Confirm Deposit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}