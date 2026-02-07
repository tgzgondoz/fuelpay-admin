import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  LocalGasStation as PumpIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ title, value, icon, color, change }) => (
  <Card sx={{ height: '100%', bgcolor: color, color: 'white' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">
            {typeof value === 'number' && title.includes('Revenue') ? `₦${value.toLocaleString()}` : value}
          </Typography>
          {change && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon fontSize="small" />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {change}% from last month
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ fontSize: 48, opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeStations: 0,
    totalTransactions: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      
      // Load transactions and calculate revenue
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
      let totalRevenue = 0;
      const transactions = [];
      
      transactionsSnapshot.forEach(doc => {
        const data = doc.data();
        transactions.push({ id: doc.id, ...data });
        if (data.totalPrice) {
          totalRevenue += data.totalPrice;
        }
      });
      
      // Load stations
      const stationsSnapshot = await getDocs(collection(db, 'stations'));
      const activeStations = stationsSnapshot.size;
      
      // Get recent transactions
      const recentTransQuery = query(
        collection(db, 'transactions'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const recentTransSnapshot = await getDocs(recentTransQuery);
      const recentTrans = [];
      recentTransSnapshot.forEach(doc => {
        recentTrans.push({ id: doc.id, ...doc.data() });
      });
      
      // Get recent users
      const recentUsersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsersData = [];
      recentUsersSnapshot.forEach(doc => {
        recentUsersData.push({ id: doc.id, ...doc.data() });
      });
      
      setStats({
        totalUsers,
        totalRevenue,
        activeStations,
        totalTransactions: transactions.length
      });
      
      setRecentTransactions(recentTrans);
      setRecentUsers(recentUsersData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [65000, 59000, 80000, 81000, 56000, 55000],
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Revenue Trend'
      }
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers}
            icon={<PeopleIcon fontSize="inherit" />}
            color="#1976d2"
            change={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Revenue" 
            value={stats.totalRevenue}
            icon={<MoneyIcon fontSize="inherit" />}
            color="#2e7d32"
            change={18}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Stations" 
            value={stats.activeStations}
            icon={<PumpIcon fontSize="inherit" />}
            color="#ed6c02"
            change={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Transactions" 
            value={stats.totalTransactions}
            icon={<ReceiptIcon fontSize="inherit" />}
            color="#9c27b0"
            change={23}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Revenue Chart</Typography>
              <Button startIcon={<DownloadIcon />} variant="outlined" size="small">
                Export Data
              </Button>
            </Box>
            <Line data={chartData} options={chartOptions} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" fullWidth>
                Process Deposits
              </Button>
              <Button variant="outlined" fullWidth>
                Generate Reports
              </Button>
              <Button variant="outlined" fullWidth>
                Manage Stations
              </Button>
              <Button variant="outlined" fullWidth>
                View Alerts
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {transaction.userName || transaction.userId?.substring(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.fuelType || 'Deposit'} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          ₦{transaction.totalPrice?.toLocaleString() || '0'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {transaction.timestamp ? 
                          format(new Date(transaction.timestamp), 'MMM dd, HH:mm') : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.status || 'Completed'} 
                          size="small"
                          color={transaction.status === 'completed' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Users
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          ₦{user.balance?.toLocaleString() || '0'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? 
                          format(new Date(user.createdAt), 'MMM dd') : 
                          'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}