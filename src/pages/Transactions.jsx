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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;
    
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference?.includes(searchTerm)
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }
    
    setFilteredTransactions(filtered);
  }, [searchTerm, filterType, transactions]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Mock transactions data
      const mockTransactions = [
        {
          id: '1',
          userId: '1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          type: 'fuel_purchase',
          fuelType: 'petrol',
          amount: 4500,
          totalPrice: 4500,
          reference: 'TRX-001',
          status: 'completed',
          timestamp: new Date().toISOString(),
          stationName: 'Main Fuel Station',
          pumpId: 'PUMP-01'
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          type: 'deposit',
          amount: 10000,
          totalPrice: 10000,
          reference: 'DEP-001',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          userId: '3',
          userName: 'Mike Johnson',
          userEmail: 'mike@example.com',
          type: 'fuel_purchase',
          fuelType: 'diesel',
          amount: 6800,
          totalPrice: 6800,
          reference: 'TRX-002',
          status: 'completed',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          stationName: 'Express Fuel Depot',
          pumpId: 'PUMP-02'
        },
        {
          id: '4',
          userId: '4',
          userName: 'Sarah Williams',
          userEmail: 'sarah@example.com',
          type: 'fuel_purchase',
          fuelType: 'premium',
          amount: 3200,
          totalPrice: 3200,
          reference: 'TRX-003',
          status: 'failed',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          stationName: 'Premium Gas Station',
          pumpId: 'PUMP-01'
        },
        {
          id: '5',
          userId: '5',
          userName: 'David Brown',
          userEmail: 'david@example.com',
          type: 'deposit',
          amount: 25000,
          totalPrice: 25000,
          reference: 'DEP-002',
          status: 'completed',
          timestamp: new Date(Date.now() - 14400000).toISOString()
        }
      ];
      
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = () => {
    toast.success('Transactions exported successfully');
    // Implement actual export logic
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'fuel_purchase': return '#1a73e8';
      case 'deposit': return '#34a853';
      case 'withdrawal': return '#ea4335';
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Transaction History
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={exportTransactions}
        >
          Export
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search transactions by user, email, or reference..."
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
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter by Type"
                startAdornment={<FilterIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="fuel_purchase">Fuel Purchases</MenuItem>
                <MenuItem value="deposit">Deposits</MenuItem>
                <MenuItem value="withdrawal">Withdrawals</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={loadTransactions}
              disabled={loading}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Transaction Details</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: getTypeColor(transaction.type) }}>
                        {transaction.type === 'fuel_purchase' ? 'Fuel Purchase' : 
                         transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                      </Typography>
                      {transaction.fuelType && (
                        <Chip
                          label={transaction.fuelType.toUpperCase()}
                          size="small"
                          sx={{ 
                            mt: 0.5,
                            backgroundColor: transaction.fuelType === 'petrol' ? '#ff9800' :
                                           transaction.fuelType === 'diesel' ? '#795548' : '#9c27b0',
                            color: 'white'
                          }}
                        />
                      )}
                      {transaction.stationName && (
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                          {transaction.stationName} - {transaction.pumpId}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {transaction.userName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {transaction.userEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      ₦{transaction.totalPrice?.toLocaleString()}
                    </Typography>
                    {transaction.amount && (
                      <Typography variant="caption" color="textSecondary">
                        {transaction.type === 'fuel_purchase' ? `${transaction.amount}L` : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(transaction.timestamp), 'dd MMM yyyy')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(transaction.timestamp), 'HH:mm:ss')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      color={getStatusColor(transaction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {transaction.reference}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}