import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
  Avatar,
  MenuItem  // ADD THIS IMPORT
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalGasStation as StationIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: '',
    petrolPrice: '',
    dieselPrice: '',
    premiumPrice: '',
    status: 'active'
  });

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      
      // Mock stations data
      const mockStations = [
        {
          id: '1',
          name: 'Main Fuel Station',
          location: '123 Main Street',
          city: 'Lagos',
          petrolPrice: 180,
          dieselPrice: 160,
          premiumPrice: 200,
          status: 'active',
          pumps: 8,
          inventory: {
            petrol: 5000,
            diesel: 3000,
            premium: 1500
          },
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Express Fuel Depot',
          location: '456 Broad Street',
          city: 'Abuja',
          petrolPrice: 185,
          dieselPrice: 165,
          premiumPrice: 205,
          status: 'active',
          pumps: 6,
          inventory: {
            petrol: 4500,
            diesel: 2500,
            premium: 1200
          },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          name: 'Premium Gas Station',
          location: '789 High Street',
          city: 'Port Harcourt',
          petrolPrice: 182,
          dieselPrice: 162,
          premiumPrice: 202,
          status: 'maintenance',
          pumps: 4,
          inventory: {
            petrol: 3000,
            diesel: 2000,
            premium: 800
          },
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      
      setStations(mockStations);
      
    } catch (error) {
      console.error('Error loading stations:', error);
      toast.error('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (station = null) => {
    if (station) {
      setEditingStation(station);
      setFormData({
        name: station.name,
        location: station.location,
        city: station.city,
        petrolPrice: station.petrolPrice,
        dieselPrice: station.dieselPrice,
        premiumPrice: station.premiumPrice,
        status: station.status
      });
    } else {
      setEditingStation(null);
      setFormData({
        name: '',
        location: '',
        city: '',
        petrolPrice: '',
        dieselPrice: '',
        premiumPrice: '',
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStation(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    try {
      if (!formData.name || !formData.location || !formData.city) {
        toast.error('Please fill all required fields');
        return;
      }

      if (editingStation) {
        // Update station
        setStations(prev => prev.map(station =>
          station.id === editingStation.id
            ? { ...station, ...formData }
            : station
        ));
        toast.success('Station updated successfully');
      } else {
        // Add new station
        const newStation = {
          id: Date.now().toString(),
          ...formData,
          pumps: 4,
          inventory: {
            petrol: 0,
            diesel: 0,
            premium: 0
          },
          createdAt: new Date().toISOString()
        };
        setStations(prev => [newStation, ...prev]);
        toast.success('Station added successfully');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving station:', error);
      toast.error('Failed to save station');
    }
  };

  const deleteStation = (id) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        setStations(prev => prev.filter(station => station.id !== id));
        toast.success('Station deleted successfully');
      } catch (error) {
        console.error('Error deleting station:', error);
        toast.error('Failed to delete station');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Station Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Station
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {/* Station Cards */}
          {stations.map((station) => (
            <Grid item xs={12} md={4} key={station.id}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#1a73e8' }}>
                        <StationIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {station.name}
                        </Typography>
                        <Chip
                          label={station.status}
                          color={getStatusColor(station.status)}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(station)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => deleteStation(station.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                    <Typography variant="body2" color="textSecondary">
                      {station.location}, {station.city}
                    </Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary">Petrol</Typography>
                        <Typography variant="body2" fontWeight="bold" color="#ff9800">
                          ₦{station.petrolPrice}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary">Diesel</Typography>
                        <Typography variant="body2" fontWeight="bold" color="#795548">
                          ₦{station.dieselPrice}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary">Premium</Typography>
                        <Typography variant="body2" fontWeight="bold" color="#9c27b0">
                          ₦{station.premiumPrice}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Pumps: <strong>{station.pumps}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Inventory: <strong>{(station.inventory.petrol + station.inventory.diesel + station.inventory.premium).toLocaleString()}L</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Station Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStation ? 'Edit Station' : 'Add New Station'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Station Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Petrol Price (₦)"
                name="petrolPrice"
                type="number"
                value={formData.petrolPrice}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Diesel Price (₦)"
                name="dieselPrice"
                type="number"
                value={formData.dieselPrice}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Premium Price (₦)"
                name="premiumPrice"
                type="number"
                value={formData.premiumPrice}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStation ? 'Update' : 'Add'} Station
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}