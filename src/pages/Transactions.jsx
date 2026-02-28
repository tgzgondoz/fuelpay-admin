// src/pages/Transactions.jsx
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
  Chip,
  TextField,
  InputAdornment,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  LocalGasStation as FuelIcon,
  AccountBalance as DepositIcon,
  SwapHoriz as TransferIcon
} from '@mui/icons-material';
import { ref, onValue } from 'firebase/database';
import { format } from 'date-fns';
import { rtdb } from '../services/firebase';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up real-time listener for transactions
    const transactionsRef = ref(rtdb, 'transactions');
    
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert the object to an array and add the transaction key as id
          const transactionsArray = Object.entries(data).map(([key, transactionData]) => ({
            id: key,
            ...transactionData,
            // Ensure timestamp is handled properly
            timestamp: transactionData.timestamp || new Date().toISOString(),
            // Set default values for missing fields
            type: transactionData.fuelType ? 'fuel_purchase' : 'transaction',
            reference: `TRX-${key.slice(-6)}`
          }));
          
          // Sort by timestamp (most recent first)
          transactionsArray.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
          
          setTransactions(transactionsArray);
          setError(null);
        } else {
          setTransactions([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error processing transactions:', err);
        setError('Failed to load transactions');
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching transactions:', error);
      setError('Failed to connect to database');
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = transactions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.stationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.fuelType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => {
        if (filterType === 'fuel_purchase') return t.fuelType;
        if (filterType === 'deposit') return t.type === 'deposit';
        return true;
      });
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, filterType, filterStatus, transactions]);

  const getTransactionIcon = (transaction) => {
    if (transaction.fuelType) {
      return <FuelIcon fontSize="small" />;
    } else if (transaction.type === 'deposit') {
      return <DepositIcon fontSize="small" />;
    } else {
      return <TransferIcon fontSize="small" />;
    }
  };

  const getTransactionTypeLabel = (transaction) => {
    if (transaction.fuelType) {
      return transaction.fuelType.charAt(0).toUpperCase() + transaction.fuelType.slice(1);
    } else if (transaction.type === 'deposit') {
      return 'Deposit';
    } else {
      return 'Transaction';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
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

  const handleRefresh = () => {
    setLoading(true);
    // The onValue listener will automatically update
    setTimeout(() => setLoading(false), 500);
  };

  if (loading && transactions.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading transactions...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Transactions
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by user ID, station, fuel type..."
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
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="fuel_purchase">Fuel Purchases</MenuItem>
                <MenuItem value="deposit">Deposits</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {filteredTransactions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'No transactions match your filters' 
                : 'No transactions found'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction Details</TableCell>
                  <TableCell>Station</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Fuel Details</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32,
                            bgcolor: transaction.fuelType ? 'primary.main' : 'success.main'
                          }}
                        >
                          {getTransactionIcon(transaction)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {getTransactionTypeLabel(transaction)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            User: {transaction.userId?.slice(-6) || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Ref: {transaction.id?.slice(-8) || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.stationName || 'N/A'}
                      </Typography>
                      {transaction.pumpId && (
                        <Typography variant="caption" color="textSecondary">
                          Pump: {transaction.pumpId}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {transaction.fuelType ? (
                        <>
                          <Typography variant="body2">
                            {transaction.fuelType.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {transaction.liters}L @ ₦{transaction.pricePerLiter}/L
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status || 'unknown'}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Total Volume: {filteredTransactions.reduce((sum, t) => sum + (t.liters || 0), 0).toFixed(2)}L
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}