import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tab,
  Tabs,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Block as RejectedIcon,
  Receipt as ReceiptIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function Deposits() {
  const [deposits, setDeposits] = useState([]);
  const [users, setUsers] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewingDeposit, setViewingDeposit] = useState(null);

  useEffect(() => {
    loadDeposits();
    loadUsers();
  }, []);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      
      // Mock deposits data
      const mockDeposits = [
        {
          id: '1',
          userId: '1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          userAccountNumber: 'ZQ100001',
          amount: 10000,
          method: 'bank_transfer',
          reference: 'TRX-123456',
          status: 'approved',
          timestamp: new Date().toISOString(),
          processedAt: new Date().toISOString(),
          processorNotes: 'Deposit approved'
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          userAccountNumber: 'ZQ100002',
          amount: 25000,
          method: 'cash',
          reference: 'TRX-123457',
          status: 'pending',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          processedAt: null,
          processorNotes: ''
        },
        {
          id: '3',
          userId: '3',
          userName: 'Mike Johnson',
          userEmail: 'mike@example.com',
          userAccountNumber: 'ZQ100003',
          amount: 15000,
          method: 'card',
          reference: 'TRX-123458',
          status: 'rejected',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          processedAt: new Date(Date.now() - 172800000).toISOString(),
          processorNotes: 'Insufficient proof'
        },
        {
          id: '4',
          userId: '4',
          userName: 'Sarah Williams',
          userEmail: 'sarah@example.com',
          userAccountNumber: 'ZQ100004',
          amount: 30000,
          method: 'online',
          reference: 'TRX-123459',
          status: 'approved',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          processedAt: new Date(Date.now() - 259200000).toISOString(),
          processorNotes: 'Deposit approved'
        },
        {
          id: '5',
          userId: '5',
          userName: 'David Brown',
          userEmail: 'david@example.com',
          userAccountNumber: 'ZQ100005',
          amount: 20000,
          method: 'bank_transfer',
          reference: 'TRX-123460',
          status: 'pending',
          timestamp: new Date(Date.now() - 345600000).toISOString(),
          processedAt: null,
          processorNotes: ''
        }
      ];
      
      setDeposits(mockDeposits);
      
    } catch (error) {
      console.error('Error loading deposits:', error);
      toast.error('Failed to load deposits');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Mock users data
      const mockUsers = [
        { id: '1', name: 'John Doe', accountNumber: 'ZQ100001', balance: 15000 },
        { id: '2', name: 'Jane Smith', accountNumber: 'ZQ100002', balance: 25000 },
        { id: '3', name: 'Mike Johnson', accountNumber: 'ZQ100003', balance: 8000 },
        { id: '4', name: 'Sarah Williams', accountNumber: 'ZQ100004', balance: 35000 },
        { id: '5', name: 'David Brown', accountNumber: 'ZQ100005', balance: 12000 }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const processDeposit = async () => {
    if (!selectedUser || !depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const amount = parseFloat(depositAmount);
      const user = users.find(u => u.id === selectedUser);
      
      // Create deposit record
      const depositData = {
        id: Date.now().toString(),
        userId: selectedUser,
        userName: user.name,
        userEmail: user.email,
        userAccountNumber: user.accountNumber,
        amount: amount,
        method: depositMethod,
        reference: reference || `DEP-${Date.now()}`,
        status: 'pending',
        timestamp: new Date().toISOString(),
        processedBy: 'admin',
        notes: ''
      };

      // Add to deposits
      setDeposits(prev => [depositData, ...prev]);

      toast.success(`Deposit request of ₦${amount.toLocaleString()} created successfully`);
      setOpenDialog(false);
      resetForm();
      
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error('Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };

  const updateDepositStatus = (depositId, status) => {
    try {
      setDeposits(prev =>
        prev.map(deposit =>
          deposit.id === depositId
            ? { 
                ...deposit, 
                status: status,
                processedAt: new Date().toISOString(),
                processorNotes: status === 'approved' ? 'Deposit approved' : 'Deposit rejected'
              }
            : deposit
        )
      );

      toast.success(`Deposit ${status} successfully`);
    } catch (error) {
      console.error('Error updating deposit status:', error);
      toast.error('Failed to update deposit status');
    }
  };

  const resetForm = () => {
    setSelectedUser('');
    setDepositAmount('');
    setDepositMethod('bank_transfer');
    setReference('');
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip icon={<ApprovedIcon />} label="Approved" color="success" size="small" />;
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" color="warning" size="small" />;
      case 'rejected':
        return <Chip icon={<RejectedIcon />} label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const filteredDeposits = deposits.filter(deposit => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return deposit.status === 'pending';
    if (tabValue === 2) return deposit.status === 'approved';
    if (tabValue === 3) return deposit.status === 'rejected';
    return true;
  });

  const exportDeposits = () => {
    toast.success('Deposits data exported successfully');
    // Implement actual export logic
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Deposit Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            New Deposit
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={exportDeposits}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Deposits" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
        
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <DepositTable 
                deposits={filteredDeposits} 
                onUpdateStatus={updateDepositStatus}
                onView={(deposit) => setViewingDeposit(deposit)}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <DepositTable 
                deposits={filteredDeposits} 
                onUpdateStatus={updateDepositStatus}
                onView={(deposit) => setViewingDeposit(deposit)}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <DepositTable 
                deposits={filteredDeposits} 
                onUpdateStatus={updateDepositStatus}
                onView={(deposit) => setViewingDeposit(deposit)}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <DepositTable 
                deposits={filteredDeposits} 
                onUpdateStatus={updateDepositStatus}
                onView={(deposit) => setViewingDeposit(deposit)}
              />
            </TabPanel>
          </>
        )}
      </Paper>

      {/* New Deposit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Deposit</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  label="Select User"
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} - {user.accountNumber} (₦{user.balance?.toLocaleString()})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Amount (₦)"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ mr: 1 }}>₦</Typography>
                  ),
                }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                  label="Payment Method"
                >
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card Payment</MenuItem>
                  <MenuItem value="online">Online Payment</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Reference Number"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., TRX-123456"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Deposit Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Make sure to verify the deposit details before submission.
                  </Typography>
                  
                  {selectedUser && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                      <Typography variant="body2">
                        <strong>User:</strong> {users.find(u => u.id === selectedUser)?.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Account:</strong> {users.find(u => u.id === selectedUser)?.accountNumber}
                      </Typography>
                      {depositAmount && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>New Balance:</strong> ₦{(users.find(u => u.id === selectedUser)?.balance + parseFloat(depositAmount || 0)).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={processDeposit} 
            variant="contained"
            disabled={!selectedUser || !depositAmount || loading}
          >
            {loading ? 'Processing...' : 'Create Deposit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Deposit Dialog */}
      <Dialog open={!!viewingDeposit} onClose={() => setViewingDeposit(null)} maxWidth="sm" fullWidth>
        {viewingDeposit && (
          <>
            <DialogTitle>Deposit Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">User</Typography>
                  <Typography variant="body1">{viewingDeposit.userName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Amount</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    ₦{viewingDeposit.amount?.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Status</Typography>
                  <Box sx={{ mt: 1 }}>{getStatusChip(viewingDeposit.status)}</Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Method</Typography>
                  <Typography variant="body1">{viewingDeposit.method}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Reference</Typography>
                  <Typography variant="body1">{viewingDeposit.reference}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Date</Typography>
                  <Typography variant="body1">
                    {viewingDeposit.timestamp ? 
                      format(new Date(viewingDeposit.timestamp), 'PPP pp') : 
                      'N/A'}
                  </Typography>
                </Grid>
                {viewingDeposit.processorNotes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Notes</Typography>
                    <Typography variant="body1">{viewingDeposit.processorNotes}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {viewingDeposit.status === 'pending' && (
                <>
                  <Button 
                    onClick={() => updateDepositStatus(viewingDeposit.id, 'approved')}
                    color="success"
                    variant="contained"
                  >
                    Approve
                  </Button>
                  <Button 
                    onClick={() => updateDepositStatus(viewingDeposit.id, 'rejected')}
                    color="error"
                    variant="outlined"
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button onClick={() => setViewingDeposit(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

function DepositTable({ deposits, onUpdateStatus, onView }) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
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
            <TableRow key={deposit.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {deposit.userName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {deposit.userAccountNumber}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body1" fontWeight="bold" color="primary">
                  ₦{deposit.amount?.toLocaleString()}
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
                {deposit.timestamp ? 
                  format(new Date(deposit.timestamp), 'dd MMM yyyy') : 
                  'N/A'}
              </TableCell>
              <TableCell>
                {getStatusChip(deposit.status)}
              </TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => onView(deposit)}>
                  <ViewIcon />
                </IconButton>
                {deposit.status === 'pending' && (
                  <>
                    <Button 
                      size="small" 
                      color="success"
                      onClick={() => onUpdateStatus(deposit.id, 'approved')}
                      sx={{ ml: 1 }}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => onUpdateStatus(deposit.id, 'rejected')}
                      sx={{ ml: 1 }}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  function getStatusChip(status) {
    switch (status) {
      case 'approved':
        return <Chip icon={<ApprovedIcon />} label="Approved" color="success" size="small" />;
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" color="warning" size="small" />;
      case 'rejected':
        return <Chip icon={<RejectedIcon />} label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  }
}