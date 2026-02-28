// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  LocalGasStation as StationIcon,
  Receipt as TransactionIcon,
  AccountBalance as BalanceIcon,
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocalGasStation as LocalGasStationIcon, // Added this
  Receipt as ReceiptIcon // Added this
} from '@mui/icons-material';
import { ref, onValue } from 'firebase/database';
import { format } from 'date-fns';
import { rtdb } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#1a73e8',
  success: '#0f7b3a',
  warning: '#f9a825',
  error: '#d32f2f',
  info: '#0288d1',
  petrol: '#ff9800',
  diesel: '#795548',
  premium: '#9c27b0'
};

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const RecentActivityItem = ({ transaction }) => (
  <ListItem alignItems="flex-start" divider>
    <ListItemAvatar>
      <Avatar sx={{ bgcolor: '#f5f5f5' }}>
        {transaction.fuelType ? <LocalGasStationIcon /> : <ReceiptIcon />}
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={
        <Typography variant="body2" fontWeight="bold">
          {transaction.fuelType ? `${transaction.fuelType.toUpperCase()} Purchase` : 'Transaction'}
        </Typography>
      }
      secondary={
        <React.Fragment>
          <Typography variant="caption" color="textSecondary" component="span" display="block">
            {transaction.stationName || 'N/A'} • {format(new Date(transaction.timestamp), 'dd MMM yyyy HH:mm')}
          </Typography>
          <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
            ₦{transaction.amount?.toLocaleString()}
          </Typography>
        </React.Fragment>
      }
    />
    <Chip
      label={transaction.status || 'completed'}
      color={transaction.status === 'completed' ? 'success' : 'warning'}
      size="small"
      sx={{ ml: 1 }}
    />
  </ListItem>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    totalStations: 0,
    activeStations: 0,
    totalQRCodes: 0,
    pendingDeposits: 0,
    totalFuelVolume: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    console.log('Dashboard useEffect running');
    
    const fetchDashboardData = () => {
      try {
        // Users stats
        const usersRef = ref(rtdb, 'users');
        onValue(usersRef, (snapshot) => {
          console.log('Users data received');
          const data = snapshot.val();
          if (data) {
            const usersArray = Object.values(data);
            const activeUsers = usersArray.filter(u => u.status === 'active').length;
            
            setStats(prev => ({
              ...prev,
              totalUsers: usersArray.length,
              activeUsers: activeUsers
            }));
          }
        });

        // Transactions stats
        const transactionsRef = ref(rtdb, 'transactions');
        onValue(transactionsRef, (snapshot) => {
          console.log('Transactions data received');
          const data = snapshot.val();
          if (data) {
            const transactionsArray = Object.values(data);
            const completedTransactions = transactionsArray.filter(t => t.status === 'completed');
            
            const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
            const totalVolume = completedTransactions.reduce((sum, t) => sum + (t.liters || 0), 0);

            setStats(prev => ({
              ...prev,
              totalTransactions: transactionsArray.length,
              totalRevenue,
              totalFuelVolume: totalVolume
            }));

            const recent = transactionsArray
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 5);
            setRecentTransactions(recent);
          }
        });

        // Stations stats
        const stationsRef = ref(rtdb, 'stations');
        onValue(stationsRef, (snapshot) => {
          console.log('Stations data received');
          const data = snapshot.val();
          if (data) {
            const stationsArray = Object.values(data);
            const activeStations = stationsArray.filter(s => s.status === 'active').length;
            
            setStats(prev => ({
              ...prev,
              totalStations: stationsArray.length,
              activeStations: activeStations
            }));
          }
        });

        // QR Codes stats
        const qrRef = ref(rtdb, 'qrcodes');
        onValue(qrRef, (snapshot) => {
          console.log('QR data received');
          const data = snapshot.val();
          if (data) {
            const qrArray = Object.values(data);
            setStats(prev => ({
              ...prev,
              totalQRCodes: qrArray.length
            }));
          }
        });

        // Deposits stats
        const depositsRef = ref(rtdb, 'deposits');
        onValue(depositsRef, (snapshot) => {
          console.log('Deposits data received');
          const data = snapshot.val();
          if (data) {
            const depositsArray = Object.values(data);
            const pendingDeposits = depositsArray.filter(d => d.status === 'pending').length;
            
            setStats(prev => ({
              ...prev,
              pendingDeposits
            }));
          }
        });

        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading dashboard...
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Welcome back! Here's what's happening with your platform today.
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={<PeopleIcon />}
            color={COLORS.primary}
            subtitle={`${stats.activeUsers} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={`₦${stats.totalRevenue.toLocaleString()}`}
            icon={<BalanceIcon />}
            color={COLORS.success}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Transactions"
            value={stats.totalTransactions.toLocaleString()}
            icon={<TransactionIcon />}
            color={COLORS.warning}
            subtitle={`${stats.totalFuelVolume.toFixed(0)}L fuel sold`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Stations"
            value={stats.totalStations}
            icon={<StationIcon />}
            color={COLORS.info}
            subtitle={`${stats.activeStations} active`}
          />
        </Grid>
      </Grid>

      {/* Second Row Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="QR Codes"
            value={stats.totalQRCodes}
            icon={<QrCodeIcon />}
            color={COLORS.premium}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Deposits"
            value={stats.pendingDeposits}
            icon={<WarningIcon />}
            color={COLORS.warning}
            subtitle="Awaiting approval"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Fuel Volume"
            value={`${stats.totalFuelVolume.toFixed(0)}L`}
            icon={<TrendingUpIcon />}
            color={COLORS.petrol}
          />
        </Grid>
      </Grid>

      {/* Recent Activity and Quick Actions */}
      <Grid container spacing={3}>
        {/* Recent Transactions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Transactions
              </Typography>
              <Button size="small" onClick={() => navigate('/transactions')}>
                View All
              </Button>
            </Box>
            <Divider />
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <RecentActivityItem key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  No recent transactions
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions & System Status */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {/* Quick Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/deposits')}
                      sx={{ py: 1.5 }}
                    >
                      Process Deposits
                      {stats.pendingDeposits > 0 && (
                        <Chip 
                          size="small" 
                          label={stats.pendingDeposits} 
                          color="warning" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/users')}
                      sx={{ py: 1.5 }}
                    >
                      Manage Users
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/qr-manager')}
                      sx={{ py: 1.5 }}
                    >
                      Generate QR
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/stations')}
                      sx={{ py: 1.5 }}
                    >
                      Add Station
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* System Status */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  System Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Box>
                        <Typography variant="body2">Database</Typography>
                        <Typography variant="caption" color="success">Connected</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Box>
                        <Typography variant="body2">Authentication</Typography>
                        <Typography variant="caption" color="success">Active</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}