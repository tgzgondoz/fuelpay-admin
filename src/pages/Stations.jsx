// src/pages/Stations.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Chip,
  IconButton,
  Avatar,
  LinearProgress,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
  Paper // Added missing Paper import
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalGasStation as StationIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { ref, onValue, push, update, remove } from 'firebase/database';
import toast from 'react-hot-toast';
import { rtdb } from '../services/firebase';

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: '',
    petrolPrice: '',
    dieselPrice: '',
    premiumPrice: '',
    status: 'active',
    phone: '',
    manager: '',
    operatingHours: '24/7'
  });

  useEffect(() => {
    // Set up real-time listener for stations
    const stationsRef = ref(rtdb, 'stations');
    
    const unsubscribe = onValue(stationsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert the object to an array and add the station key as id
          const stationsArray = Object.entries(data).map(([key, stationData]) => ({
            id: key,
            ...stationData,
            // Ensure prices are numbers
            petrolPrice: Number(stationData.petrolPrice) || 0,
            dieselPrice: Number(stationData.dieselPrice) || 0,
            premiumPrice: Number(stationData.premiumPrice) || 0
          }));
          
          // Sort by name
          stationsArray.sort((a, b) => a.name?.localeCompare(b.name));
          
          setStations(stationsArray);
          setError(null);
        } else {
          setStations([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error processing stations:', err);
        setError('Failed to load stations');
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching stations:', error);
      setError('Failed to connect to database');
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (station = null) => {
    if (station) {
      setEditingStation(station);
      setFormData({
        name: station.name || '',
        location: station.location || '',
        city: station.city || '',
        petrolPrice: station.petrolPrice || '',
        dieselPrice: station.dieselPrice || '',
        premiumPrice: station.premiumPrice || '',
        status: station.status || 'active',
        phone: station.phone || '',
        manager: station.manager || '',
        operatingHours: station.operatingHours || '24/7'
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
        status: 'active',
        phone: '',
        manager: '',
        operatingHours: '24/7'
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error('Station name is required');
      return;
    }
    if (!formData.location?.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!formData.city?.trim()) {
      toast.error('City is required');
      return;
    }

    // Validate prices
    const prices = ['petrolPrice', 'dieselPrice', 'premiumPrice'];
    for (const price of prices) {
      if (formData[price] && (isNaN(formData[price]) || Number(formData[price]) < 0)) {
        toast.error('Please enter valid prices');
        return;
      }
    }

    try {
      setSaving(true);
      
      // Prepare data for saving
      const stationData = {
        ...formData,
        petrolPrice: Number(formData.petrolPrice) || 0,
        dieselPrice: Number(formData.dieselPrice) || 0,
        premiumPrice: Number(formData.premiumPrice) || 0,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin' // You can add actual admin user ID here
      };

      if (editingStation) {
        // Update existing station
        const stationRef = ref(rtdb, `stations/${editingStation.id}`);
        await update(stationRef, stationData);
        toast.success('Station updated successfully');
      } else {
        // Add new station
        const stationsRef = ref(rtdb, 'stations');
        const newStationRef = await push(stationsRef, {
          ...stationData,
          createdAt: new Date().toISOString(),
          createdBy: 'admin'
        });
        toast.success('Station added successfully');
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving station:', error);
      toast.error('Failed to save station');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this station? This action cannot be undone.')) {
      return;
    }

    try {
      const stationRef = ref(rtdb, `stations/${id}`);
      await remove(stationRef);
      toast.success('Station deleted successfully');
    } catch (error) {
      console.error('Error deleting station:', error);
      toast.error('Failed to delete station');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const stationRef = ref(rtdb, `stations/${id}`);
      await update(stationRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Station ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling station status:', error);
      toast.error('Failed to update station status');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading stations...
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Fuel Stations</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Station
        </Button>
      </Box>

      {stations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <StationIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Stations Found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Get started by adding your first fuel station
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Station
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {stations.map((station) => (
            <Grid item xs={12} md={6} lg={4} key={station.id}>
              <Card sx={{ 
                position: 'relative',
                opacity: station.status === 'inactive' ? 0.7 : 1,
                '&:hover': {
                  boxShadow: 6
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: station.status === 'active' ? '#1a73e8' : '#9e9e9e' }}>
                        <StationIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {station.name}
                        </Typography>
                        <Chip
                          label={station.status}
                          color={station.status === 'active' ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(station)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteStation(station.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                    <Typography variant="body2" color="textSecondary">
                      {station.location}, {station.city}
                    </Typography>
                  </Box>

                  {station.phone && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      📞 {station.phone}
                    </Typography>
                  )}

                  {station.manager && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      👤 Manager: {station.manager}
                    </Typography>
                  )}

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Fuel Prices
                  </Typography>

                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 1, 
                        bgcolor: '#fff3e0', 
                        borderRadius: 1,
                        border: '1px solid #ffe0b2'
                      }}>
                        <Typography variant="caption" color="#e65100">Petrol</Typography>
                        <Typography variant="body2" fontWeight="bold" color="#e65100">
                          {formatCurrency(station.petrolPrice)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 1, 
                        bgcolor: '#efebe9', 
                        borderRadius: 1,
                        border: '1px solid #d7ccc8'
                      }}>
                        <Typography variant="caption" color="#5d4037">Diesel</Typography>
                        <Typography variant="body2" fontWeight="bold" color="#5d4037">
                          {formatCurrency(station.dieselPrice)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 1, 
                        bgcolor: '#f3e5f5', 
                        borderRadius: 1,
                        border: '1px solid #e1bee7'
                      }}>
                        <Typography variant="caption" color="#6a1b9a">Premium</Typography>
                        <Typography variant="body2" fontWeight="bold" color="#6a1b9a">
                          {formatCurrency(station.premiumPrice)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      ⏰ {station.operatingHours}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={station.status === 'active'}
                          onChange={() => handleToggleStatus(station.id, station.status)}
                          color="success"
                        />
                      }
                      label={station.status === 'active' ? 'Active' : 'Inactive'}
                      labelPlacement="start"
                      sx={{ m: 0 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}>
          <Typography variant="h6">
            {editingStation ? 'Edit Station' : 'Add New Station'}
          </Typography>
          <IconButton onClick={() => setOpenDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Station Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                margin="normal"
                select
                variant="outlined"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address *"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                margin="normal"
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City *"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                margin="normal"
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Manager Name"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Fuel Prices (₦ per liter)
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Petrol Price"
                type="number"
                value={formData.petrolPrice}
                onChange={(e) => setFormData({ ...formData, petrolPrice: e.target.value })}
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₦</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Diesel Price"
                type="number"
                value={formData.dieselPrice}
                onChange={(e) => setFormData({ ...formData, dieselPrice: e.target.value })}
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₦</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Premium Price"
                type="number"
                value={formData.premiumPrice}
                onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₦</Typography>
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Operating Hours"
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                margin="normal"
                variant="outlined"
                placeholder="e.g., 24/7, 6AM-10PM"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={saving}
            startIcon={saving ? null : <SaveIcon />}
          >
            {saving ? 'Saving...' : (editingStation ? 'Update Station' : 'Add Station')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}