// src/pages/Deposits.jsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  LinearProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Search as SearchIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  AccountBalance as BankIcon,
  Payments as CashIcon
} from '@mui/icons-material';
import { ref, onValue, update, get, runTransaction } from 'firebase/database';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { rtdb } from '../services/firebase';

export default function Deposits() {
  const [deposits, setDeposits] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Set up real-time listener for deposits
    const depositsRef = ref(rtdb, 'deposits');
    
    const unsubscribe = onValue(depositsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert the object to an array and add the deposit key as id
          const depositsArray = Object.entries(data).map(([key, depositData]) => ({
            id: key,
            ...depositData,
            // Ensure timestamp is handled properly
            timestamp: depositData.timestamp || new Date().toISOString(),
            // Set default values for missing fields
            method: depositData.method || 'bank_transfer',
            status: depositData.status || 'pending'
          }));
          
          // Sort by timestamp (most recent first)
          depositsArray.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
          
          setDeposits(depositsArray);
          setError(null);
        } else {
          setDeposits([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error processing deposits:', err);
        setError('Failed to load deposits');
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching deposits:', error);
      setError('Failed to connect to database');
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = deposits;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.method?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    setFilteredDeposits(filtered);
  }, [searchTerm, statusFilter, deposits]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setProcessing(true);
      
      // Get the deposit data
      const deposit = deposits.find(d => d.id === id);
      if (!deposit) {
        throw new Error('Deposit not found');
      }

      // Update deposit status in Firebase
      const depositRef = ref(rtdb, `deposits/${id}`);
      await update(depositRef, { 
        status: newStatus,
        processedAt: new Date().toISOString(),
        processedBy: 'admin' // You can add actual admin user ID here
      });

      // If deposit is approved, update user's balance
      if (newStatus === 'approved' && deposit.userId) {
        const userRef = ref(rtdb, `users/${deposit.userId}`);
        
        // Use a transaction to safely update balance
        await runTransaction(userRef, (currentUserData) => {
          if (currentUserData) {
            // Update the balance
            const newBalance = (currentUserData.balance || 0) + deposit.amount;
            return {
              ...currentUserData,
              balance: newBalance
            };
          }
          return currentUserData;
        });
      }
      
      toast.success(`Deposit ${newStatus} successfully`);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating deposit:', error);
      toast.error('Failed to update deposit status');
    } finally {
      setProcessing(false);
    }
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'bank_transfer':
      case 'bank':
        return <BankIcon />;
      case 'cash':
        return <CashIcon />;
      default:
        return <BankIcon />;
    }
  };

  const getMethodLabel = (method) => {
    switch (method?.toLowerCase()) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      default:
        return method || 'Bank Transfer';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return format(new Date(timestamp), 'dd MMM yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  if (loading && deposits.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading deposits...
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
        Deposit Management
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by user, email, reference..."
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
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {filteredDeposits.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {searchTerm || statusFilter !== 'all' 
                ? 'No deposits match your filters' 
                : 'No deposits found'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDeposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {deposit.userName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {deposit.userName || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {deposit.userEmail || deposit.userId?.slice(-6) || 'No email'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {formatCurrency(deposit.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={getMethodIcon(deposit.method)}
                        label={getMethodLabel(deposit.method)} 
                        size="small" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {deposit.reference || deposit.id?.slice(-8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(deposit.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={deposit.status}
                        color={getStatusColor(deposit.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setSelectedDeposit(deposit);
                          setOpenDialog(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Showing {filteredDeposits.length} of {deposits.length} deposits
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Total Pending: {filteredDeposits.filter(d => d.status === 'pending').length}
          </Typography>
        </Box>
      </Paper>

      {/* View/Process Deposit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedDeposit && (
          <>
            <DialogTitle>
              Process Deposit
              {selectedDeposit.status === 'pending' && (
                <Chip 
                  label="Pending" 
                  color="warning" 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              )}
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ py: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      User
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedDeposit.userName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      User ID
                    </Typography>
                    <Typography variant="body2">
                      {selectedDeposit.userId || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body2">
                      {selectedDeposit.userEmail || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Amount
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(selectedDeposit.amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Method
                    </Typography>
                    <Typography variant="body2">
                      {getMethodLabel(selectedDeposit.method)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Reference
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {selectedDeposit.reference || selectedDeposit.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Date Submitted
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(selectedDeposit.timestamp)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Current Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={selectedDeposit.status}
                        color={getStatusColor(selectedDeposit.status)}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  {selectedDeposit.processedAt && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">
                        Processed At
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(selectedDeposit.processedAt)}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>
                Close
              </Button>
              {selectedDeposit.status === 'pending' && (
                <>
                  <Button 
                    color="success" 
                    variant="contained"
                    onClick={() => handleStatusUpdate(selectedDeposit.id, 'approved')}
                    disabled={processing}
                    startIcon={<ApproveIcon />}
                  >
                    Approve
                  </Button>
                  <Button 
                    color="error" 
                    variant="contained"
                    onClick={() => handleStatusUpdate(selectedDeposit.id, 'rejected')}
                    disabled={processing}
                    startIcon={<RejectIcon />}
                  >
                    Reject
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}