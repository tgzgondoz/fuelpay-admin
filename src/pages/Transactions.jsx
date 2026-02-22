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
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(t =>
        t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference?.includes(searchTerm)
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      setTransactions([
        {
          id: '1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          type: 'fuel_purchase',
          amount: 4500,
          fuelType: 'petrol',
          status: 'completed',
          timestamp: new Date().toISOString(),
          reference: 'TRX-001'
        },
        {
          id: '2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          type: 'deposit',
          amount: 10000,
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          reference: 'DEP-001'
        }
      ]);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search transactions..."
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
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {t.userName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {t.userEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.type}
                      color={t.type === 'deposit' ? 'success' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      ₦{t.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {t.reference}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {format(new Date(t.timestamp), 'dd MMM yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.status}
                      color="success"
                      size="small"
                    />
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