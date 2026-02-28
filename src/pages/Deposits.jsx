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
  LinearProgress
} from '@mui/material';
import {
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Deposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      
      // Mock data
      setDeposits([
        {
          id: '1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          amount: 10000,
          method: 'bank_transfer',
          reference: 'TRX-123456',
          status: 'pending',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          amount: 25000,
          method: 'cash',
          reference: 'TRX-123457',
          status: 'approved',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (id, status) => {
    setDeposits(prev =>
      prev.map(d => d.id === id ? { ...d, status } : d)
    );
    toast.success(`Deposit ${status} successfully`);
    setOpenDialog(false);
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Deposit Management
      </Typography>

      <Paper sx={{ p: 2 }}>
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {deposit.userName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {deposit.userEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      ₦{deposit.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={deposit.method} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {deposit.reference}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {format(new Date(deposit.timestamp), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={deposit.status}
                      color={deposit.status === 'approved' ? 'success' : 
                             deposit.status === 'pending' ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => {
                      setSelectedDeposit(deposit);
                      setOpenDialog(true);
                    }}>
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View/Process Deposit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        {selectedDeposit && (
          <>
            <DialogTitle>Process Deposit</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>User:</strong> {selectedDeposit.userName}</Typography>
                <Typography sx={{ mt: 1 }}><strong>Email:</strong> {selectedDeposit.userEmail}</Typography>
                <Typography sx={{ mt: 1 }}><strong>Amount:</strong> ₦{selectedDeposit.amount.toLocaleString()}</Typography>
                <Typography sx={{ mt: 1 }}><strong>Method:</strong> {selectedDeposit.method}</Typography>
                <Typography sx={{ mt: 1 }}><strong>Reference:</strong> {selectedDeposit.reference}</Typography>
                <Typography sx={{ mt: 1 }}><strong>Status:</strong> {selectedDeposit.status}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              {selectedDeposit.status === 'pending' && (
                <>
                  <Button 
                    color="success" 
                    variant="contained"
                    onClick={() => handleStatusUpdate(selectedDeposit.id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button 
                    color="error" 
                    variant="contained"
                    onClick={() => handleStatusUpdate(selectedDeposit.id, 'rejected')}
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