// src/pages/Stations.jsx
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
  Chip,
  IconButton,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalGasStation as StationIcon,
  LocationOn as LocationIcon
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
    premiumPrice: ''
  });

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      
      setStations([
        {
          id: '1',
          name: 'Main Fuel Station',
          location: '123 Main Street',
          city: 'Lagos',
          petrolPrice: 180,
          dieselPrice: 160,
          premiumPrice: 200,
          status: 'active'
        },
        {
          id: '2',
          name: 'Express Fuel Depot',
          location: '456 Broad Street',
          city: 'Abuja',
          petrolPrice: 185,
          dieselPrice: 165,
          premiumPrice: 205,
          status: 'active'
        }
      ]);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (station = null) => {
    if (station) {
      setEditingStation(station);
      setFormData(station);
    } else {
      setEditingStation(null);
      setFormData({
        name: '',
        location: '',
        city: '',
        petrolPrice: '',
        dieselPrice: '',
        premiumPrice: ''
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.location || !formData.city) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingStation) {
      setStations(prev =>
        prev.map(s => s.id === editingStation.id ? { ...s, ...formData } : s)
      );
      toast.success('Station updated');
    } else {
      const newStation = {
        id: Date.now().toString(),
        ...formData,
        status: 'active'
      };
      setStations(prev => [newStation, ...prev]);
      toast.success('Station added');
    }

    setOpenDialog(false);
  };

  const deleteStation = (id) => {
    if (window.confirm('Delete this station?')) {
      setStations(prev => prev.filter(s => s.id !== id));
      toast.success('Station deleted');
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Stations</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Station
        </Button>
      </Box>

      <Grid container spacing={3}>
        {stations.map((station) => (
          <Grid item xs={12} md={4} key={station.id}>
            <Card>
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
                        color="success"
                        size="small"
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

                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="caption">Petrol</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#ff9800">
                        ₦{station.petrolPrice}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="caption">Diesel</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#795548">
                        ₦{station.dieselPrice}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="caption">Premium</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#9c27b0">
                        ₦{station.premiumPrice}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStation ? 'Edit Station' : 'Add Station'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Station Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Address"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            margin="normal"
          />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Petrol (₦)"
                type="number"
                value={formData.petrolPrice}
                onChange={(e) => setFormData({ ...formData, petrolPrice: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Diesel (₦)"
                type="number"
                value={formData.dieselPrice}
                onChange={(e) => setFormData({ ...formData, dieselPrice: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Premium (₦)"
                type="number"
                value={formData.premiumPrice}
                onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStation ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}