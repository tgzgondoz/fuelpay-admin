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
  LinearProgress
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function QRManager() {
  const [stations] = useState([
    { id: 'station1', name: 'Main Fuel Station' },
    { id: 'station2', name: 'Express Fuel Depot' }
  ]);
  const [qrCodes, setQrCodes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    stationId: '',
    pumpId: '',
    fuelType: 'petrol',
    price: ''
  });
  const [generatedQR, setGeneratedQR] = useState('');

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      
      setQrCodes([
        {
          id: '1',
          stationName: 'Main Fuel Station',
          pumpId: 'PUMP-01',
          fuelType: 'petrol',
          price: 180,
          status: 'active',
          createdAt: new Date().toISOString(),
          scans: 45
        },
        {
          id: '2',
          stationName: 'Express Fuel Depot',
          pumpId: 'PUMP-01',
          fuelType: 'diesel',
          price: 160,
          status: 'active',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          scans: 32
        }
      ]);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = () => {
    if (!formData.stationId || !formData.pumpId || !formData.price) {
      toast.error('Please fill all fields');
      return;
    }

    const station = stations.find(s => s.id === formData.stationId);
    
    const qrData = JSON.stringify({
      stationId: formData.stationId,
      stationName: station?.name,
      pumpId: formData.pumpId,
      fuelType: formData.fuelType,
      pricePerLiter: parseFloat(formData.price),
      type: 'fuel_purchase'
    });

    setGeneratedQR(qrData);
  };

  const saveQR = () => {
    const station = stations.find(s => s.id === formData.stationId);
    
    const newQR = {
      id: Date.now().toString(),
      stationName: station?.name,
      pumpId: formData.pumpId,
      fuelType: formData.fuelType,
      price: formData.price,
      status: 'active',
      createdAt: new Date().toISOString(),
      scans: 0
    };

    setQrCodes(prev => [newQR, ...prev]);
    toast.success('QR Code saved');
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      stationId: '',
      pumpId: '',
      fuelType: 'petrol',
      price: ''
    });
    setGeneratedQR('');
  };

  const deleteQR = (id) => {
    if (window.confirm('Delete this QR code?')) {
      setQrCodes(prev => prev.filter(qr => qr.id !== id));
      toast.success('QR Code deleted');
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qrcode-canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qrcode-${formData.pumpId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR Code downloaded');
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">QR Code Manager</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Generate QR
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Station</TableCell>
                <TableCell>Pump</TableCell>
                <TableCell>Fuel</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Scans</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {qrCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell>{qr.stationName}</TableCell>
                  <TableCell>
                    <Chip label={qr.pumpId} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={qr.fuelType.toUpperCase()} 
                      size="small"
                      sx={{
                        bgcolor: qr.fuelType === 'petrol' ? '#ff9800' :
                                qr.fuelType === 'diesel' ? '#795548' : '#9c27b0',
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>₦{qr.price}</TableCell>
                  <TableCell>{qr.scans}</TableCell>
                  <TableCell>{format(new Date(qr.createdAt), 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <Chip label={qr.status} color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => deleteQR(qr.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Generate QR Dialog */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); resetForm(); }} maxWidth="md" fullWidth>
        <DialogTitle>Generate QR Code</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Station</InputLabel>
                <Select
                  value={formData.stationId}
                  onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                  label="Station"
                >
                  {stations.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Pump ID"
                value={formData.pumpId}
                onChange={(e) => setFormData({ ...formData, pumpId: e.target.value })}
                placeholder="e.g., PUMP-01"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  label="Fuel Type"
                >
                  <MenuItem value="petrol">Petrol</MenuItem>
                  <MenuItem value="diesel">Diesel</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Price per Liter (₦)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={generateQR}
                sx={{ mt: 2 }}
              >
                Generate QR
              </Button>

              {generatedQR && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={saveQR}
                  sx={{ mt: 2 }}
                >
                  Save QR Code
                </Button>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {generatedQR ? (
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                      <div id="qrcode-canvas">
                        <QRCode value={generatedQR} size={200} />
                      </div>
                    </Box>
                    
                    <Button
                      variant="contained"
                      onClick={downloadQR}
                      startIcon={<DownloadIcon />}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box>
                    <QrCodeIcon sx={{ fontSize: 60, color: '#ccc' }} />
                    <Typography color="textSecondary">Generate QR code to preview</Typography>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}