// src/pages/QRManager.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  QrCodeScanner as ScanIcon
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { rtdb } from '../services/firebase';

export default function QRManager() {
  const [stations, setStations] = useState([]);
  const [qrCodes, setQrCodes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    stationId: '',
    stationName: '',
    pumpId: '',
    fuelType: 'petrol',
    price: '',
    status: 'active'
  });
  const [generatedQR, setGeneratedQR] = useState('');

  // Load stations for dropdown
  useEffect(() => {
    const stationsRef = ref(rtdb, 'stations');
    
    const unsubscribe = onValue(stationsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const stationsArray = Object.entries(data).map(([key, stationData]) => ({
            id: key,
            name: stationData.name,
            ...stationData
          }));
          setStations(stationsArray);
        }
      } catch (err) {
        console.error('Error loading stations:', err);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load QR codes
  useEffect(() => {
    const qrRef = ref(rtdb, 'qrcodes');
    
    const unsubscribe = onValue(qrRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const qrArray = Object.entries(data).map(([key, qrData]) => ({
            id: key,
            ...qrData,
            scans: qrData.scans || 0
          }));
          
          // Sort by creation date (most recent first)
          qrArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setQrCodes(qrArray);
          setError(null);
        } else {
          setQrCodes([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading QR codes:', err);
        setError('Failed to load QR codes');
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching QR codes:', error);
      setError('Failed to connect to database');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGenerateQR = () => {
    // Validate required fields
    if (!formData.stationId) {
      toast.error('Please select a station');
      return;
    }
    if (!formData.pumpId?.trim()) {
      toast.error('Please enter pump ID');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const selectedStation = stations.find(s => s.id === formData.stationId);
    
    // Create QR code data
    const qrData = {
      stationId: formData.stationId,
      stationName: selectedStation?.name,
      pumpId: formData.pumpId.trim().toUpperCase(),
      fuelType: formData.fuelType,
      pricePerLiter: parseFloat(formData.price),
      type: 'fuel_purchase',
      status: formData.status || 'active',
      createdAt: new Date().toISOString(),
      // Add a unique identifier for the QR
      qrId: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Update form data with station name
    setFormData(prev => ({
      ...prev,
      stationName: selectedStation?.name
    }));

    setGeneratedQR(JSON.stringify(qrData, null, 2));
  };

  const handleSaveQR = async () => {
    if (!generatedQR) {
      toast.error('Please generate a QR code first');
      return;
    }

    try {
      setSaving(true);
      
      // Parse the QR data to save
      const qrData = JSON.parse(generatedQR);
      
      // Prepare data for database
      const qrRecord = {
        ...qrData,
        scans: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        qrString: generatedQR // Store the full QR string
      };

      // Save to Firebase
      const qrRef = ref(rtdb, 'qrcodes');
      await push(qrRef, qrRecord);
      
      toast.success('QR Code saved successfully');
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving QR code:', error);
      toast.error('Failed to save QR code');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQR = async (id) => {
    if (!window.confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return;
    }

    try {
      const qrRef = ref(rtdb, `qrcodes/${id}`);
      await remove(qrRef);
      toast.success('QR Code deleted successfully');
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast.error('Failed to delete QR code');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const qrRef = ref(rtdb, `qrcodes/${id}`);
      await update(qrRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(`QR Code ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating QR status:', error);
      toast.error('Failed to update QR status');
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qrcode-canvas');
    if (canvas) {
      const link = document.createElement('a');
      const selectedStation = stations.find(s => s.id === formData.stationId);
      const fileName = `qr-${selectedStation?.name?.replace(/\s+/g, '-').toLowerCase()}-${formData.pumpId}-${Date.now()}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR Code downloaded');
    }
  };

  const handleCopyQRData = () => {
    if (generatedQR) {
      navigator.clipboard.writeText(generatedQR);
      toast.success('QR data copied to clipboard');
    }
  };

  const resetForm = () => {
    setFormData({
      stationId: '',
      stationName: '',
      pumpId: '',
      fuelType: 'petrol',
      price: '',
      status: 'active'
    });
    setGeneratedQR('');
  };

  const getFuelTypeColor = (fuelType) => {
    switch (fuelType?.toLowerCase()) {
      case 'petrol':
        return '#ff9800';
      case 'diesel':
        return '#795548';
      case 'premium':
        return '#9c27b0';
      default:
        return '#757575';
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
          Loading QR codes...
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
        <Typography variant="h4">QR Code Manager</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          Generate QR
        </Button>
      </Box>

      {qrCodes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QrCodeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No QR Codes Found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Generate QR codes for your fuel pumps
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            Generate First QR
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Station / Pump</TableCell>
                  <TableCell>Fuel Type</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Scans</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qrCodes.map((qr) => (
                  <TableRow key={qr.id} sx={{ opacity: qr.status === 'inactive' ? 0.7 : 1 }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {qr.stationName}
                        </Typography>
                        <Chip 
                          label={qr.pumpId} 
                          color="primary" 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={qr.fuelType?.toUpperCase() || 'N/A'} 
                        size="small"
                        sx={{
                          bgcolor: getFuelTypeColor(qr.fuelType),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {formatCurrency(qr.pricePerLiter)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScanIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {qr.scans || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(qr.createdAt), 'dd MMM yyyy')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(qr.createdAt), 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={qr.status}
                        color={qr.status === 'active' ? 'success' : 'default'}
                        size="small"
                        onClick={() => handleToggleStatus(qr.id, qr.status)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteQR(qr.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="caption" color="textSecondary">
              Total QR Codes: {qrCodes.length} | Active: {qrCodes.filter(q => q.status === 'active').length}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Generate QR Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => { 
          setOpenDialog(false); 
          resetForm(); 
        }} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
          <Typography variant="h6">Generate QR Code for Fuel Pump</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Station *</InputLabel>
                <Select
                  value={formData.stationId}
                  onChange={(e) => {
                    const selected = stations.find(s => s.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      stationId: e.target.value,
                      stationName: selected?.name || ''
                    });
                  }}
                  label="Station *"
                  required
                >
                  {stations.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} - {s.city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Pump ID *"
                value={formData.pumpId}
                onChange={(e) => setFormData({ ...formData, pumpId: e.target.value })}
                placeholder="e.g., PUMP-01"
                required
                helperText="Unique identifier for the pump"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Fuel Type *</InputLabel>
                <Select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  label="Fuel Type *"
                  required
                >
                  <MenuItem value="petrol">Petrol (Premium Motor Spirit)</MenuItem>
                  <MenuItem value="diesel">Diesel (Automotive Gas Oil)</MenuItem>
                  <MenuItem value="premium">Premium (High Octane)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Price per Liter (₦) *"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₦</Typography>
                }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateQR}
                sx={{ mt: 3 }}
                disabled={!formData.stationId || !formData.pumpId || !formData.price}
              >
                Generate QR Code
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              {generatedQR ? (
                <Card>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        QR Code Preview
                      </Typography>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: '#f5f5f5', 
                        borderRadius: 2,
                        display: 'inline-block'
                      }}>
                        <QRCode 
                          id="qrcode-canvas"
                          value={generatedQR} 
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleDownloadQR}
                        startIcon={<DownloadIcon />}
                        fullWidth
                      >
                        Download
                      </Button>
                      <Tooltip title="Copy QR Data">
                        <IconButton onClick={handleCopyQRData} color="primary">
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: '#f5f5f5', 
                      borderRadius: 1,
                      maxHeight: '100px',
                      overflow: 'auto'
                    }}>
                      <Typography variant="caption" component="pre" sx={{ fontSize: '10px' }}>
                        {generatedQR}
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      color="success"
                      fullWidth
                      onClick={handleSaveQR}
                      disabled={saving}
                      sx={{ mt: 2 }}
                    >
                      {saving ? 'Saving...' : 'Save QR Code'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Paper sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: '#fafafa',
                  minHeight: 300
                }}>
                  <Box>
                    <QrCodeIcon sx={{ fontSize: 60, color: '#ccc' }} />
                    <Typography color="textSecondary" sx={{ mt: 1 }}>
                      Fill in the details and click<br />
                      "Generate QR Code" to preview
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}