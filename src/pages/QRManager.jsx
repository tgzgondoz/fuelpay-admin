import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  LocalGasStation as StationIcon
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function QRManager() {
  const [stations, setStations] = useState([
    { id: 'station1', name: 'Main Fuel Station', location: '123 Main St, Lagos' },
    { id: 'station2', name: 'Express Fuel Depot', location: '456 Broad St, Abuja' },
    { id: 'station3', name: 'Premium Gas Station', location: '789 High St, Port Harcourt' }
  ]);
  const [selectedStation, setSelectedStation] = useState('');
  const [pumpId, setPumpId] = useState('');
  const [fuelType, setFuelType] = useState('petrol');
  const [price, setPrice] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [qrCodes, setQrCodes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQR, setEditingQR] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQRCodes();
    if (stations.length > 0 && !selectedStation) {
      setSelectedStation(stations[0].id);
    }
  }, []);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      
      // Mock QR codes data
      const mockQRCodes = [
        {
          id: '1',
          stationId: 'station1',
          stationName: 'Main Fuel Station',
          pumpId: 'PUMP-01',
          fuelType: 'petrol',
          pricePerLiter: 180,
          status: 'active',
          createdAt: new Date().toISOString(),
          scans: 45,
          lastScan: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          stationId: 'station1',
          stationName: 'Main Fuel Station',
          pumpId: 'PUMP-02',
          fuelType: 'diesel',
          pricePerLiter: 160,
          status: 'active',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          scans: 32,
          lastScan: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '3',
          stationId: 'station2',
          stationName: 'Express Fuel Depot',
          pumpId: 'PUMP-01',
          fuelType: 'petrol',
          pricePerLiter: 185,
          status: 'inactive',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          scans: 21,
          lastScan: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '4',
          stationId: 'station3',
          stationName: 'Premium Gas Station',
          pumpId: 'PUMP-01',
          fuelType: 'premium',
          pricePerLiter: 200,
          status: 'active',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          scans: 18,
          lastScan: new Date(Date.now() - 14400000).toISOString()
        }
      ];
      
      setQrCodes(mockQRCodes);
      
    } catch (error) {
      console.error('Error loading QR codes:', error);
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = () => {
    if (!selectedStation || !pumpId || !price) {
      toast.error('Please fill all required fields');
      return;
    }

    const station = stations.find(s => s.id === selectedStation);
    
    const qrData = JSON.stringify({
      stationId: selectedStation,
      stationName: station?.name || 'Unknown Station',
      pumpId: pumpId,
      fuelType: fuelType,
      pricePerLiter: parseFloat(price),
      timestamp: new Date().toISOString(),
      type: 'fuel_purchase'
    });

    setGeneratedQR(qrData);
  };

  const saveQRCode = async () => {
    if (!generatedQR) {
      toast.error('Please generate a QR code first');
      return;
    }

    try {
      const station = stations.find(s => s.id === selectedStation);
      
      const qrData = {
        stationId: selectedStation,
        stationName: station?.name || 'Unknown Station',
        pumpId: pumpId,
        fuelType: fuelType,
        pricePerLiter: parseFloat(price),
        qrData: generatedQR,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        scans: 0,
        lastScan: null
      };

      if (editingQR) {
        // Update existing QR code
        setQrCodes(prev => prev.map(qr => 
          qr.id === editingQR.id ? { ...qr, ...qrData } : qr
        ));
        toast.success('QR Code updated successfully');
      } else {
        // Add new QR code
        const newQR = {
          id: Date.now().toString(),
          ...qrData
        };
        setQrCodes(prev => [newQR, ...prev]);
        toast.success('QR Code saved successfully');
      }

      setGeneratedQR('');
      setPumpId('');
      setPrice('');
      setEditingQR(null);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving QR code:', error);
      toast.error('Failed to save QR code');
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qrcode-canvas');
    if (canvas) {
      html2canvas(canvas).then(canvas => {
        const link = document.createElement('a');
        link.download = `zadzaqr-${selectedStation}-${pumpId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const editQRCode = (qrCode) => {
    setEditingQR(qrCode);
    setSelectedStation(qrCode.stationId);
    setPumpId(qrCode.pumpId);
    setFuelType(qrCode.fuelType);
    setPrice(qrCode.pricePerLiter.toString());
    
    // Regenerate QR data
    const qrData = JSON.stringify({
      stationId: qrCode.stationId,
      stationName: qrCode.stationName,
      pumpId: qrCode.pumpId,
      fuelType: qrCode.fuelType,
      pricePerLiter: qrCode.pricePerLiter,
      timestamp: new Date().toISOString(),
      type: 'fuel_purchase'
    });
    
    setGeneratedQR(qrData);
    setOpenDialog(true);
  };

  const deleteQRCode = (id) => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      try {
        setQrCodes(prev => prev.filter(qr => qr.id !== id));
        toast.success('QR Code deleted successfully');
      } catch (error) {
        console.error('Error deleting QR code:', error);
        toast.error('Failed to delete QR code');
      }
    }
  };

  const getFuelTypeColor = (type) => {
    switch (type) {
      case 'petrol': return '#ff9800';
      case 'diesel': return '#795548';
      case 'premium': return '#9c27b0';
      default: return '#666';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          QR Code Manager
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<QrCodeIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Generate New QR
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {/* Existing QR Codes */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Active QR Codes
                </Typography>
                <Button startIcon={<RefreshIcon />} onClick={loadQRCodes}>
                  Refresh
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Station</TableCell>
                      <TableCell>Pump ID</TableCell>
                      <TableCell>Fuel Type</TableCell>
                      <TableCell>Price/L</TableCell>
                      <TableCell>Scans</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {qrCodes.map((qrCode) => (
                      <TableRow key={qrCode.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StationIcon sx={{ color: '#666' }} />
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {qrCode.stationName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                ID: {qrCode.stationId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={qrCode.pumpId} color="primary" size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={qrCode.fuelType.toUpperCase()} 
                            size="small"
                            sx={{
                              backgroundColor: getFuelTypeColor(qrCode.fuelType),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            ₦{qrCode.pricePerLiter?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {qrCode.scans}
                            </Typography>
                            {qrCode.lastScan && (
                              <Typography variant="caption" color="textSecondary">
                                Last: {format(new Date(qrCode.lastScan), 'MMM dd, HH:mm')}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {format(new Date(qrCode.createdAt), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={qrCode.status}
                            color={qrCode.status === 'active' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => editQRCode(qrCode)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => deleteQRCode(qrCode.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Generate QR Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setEditingQR(null);
          setGeneratedQR('');
          setPumpId('');
          setPrice('');
        }} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingQR ? 'Edit QR Code' : 'Generate New QR Code'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Station</InputLabel>
                <Select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  label="Select Station"
                >
                  {stations.map((station) => (
                    <MenuItem key={station.id} value={station.id}>
                      <Box>
                        <Typography>{station.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {station.location}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Pump ID"
                value={pumpId}
                onChange={(e) => setPumpId(e.target.value)}
                placeholder="e.g., PUMP-01, PUMP-02"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 180"
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ mr: 1 }}>₦</Typography>
                  ),
                }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={generateQRCode}
                sx={{ mt: 2 }}
                disabled={!selectedStation || !pumpId || !price}
              >
                {generatedQR ? 'Regenerate QR Code' : 'Generate QR Code'}
              </Button>

              {generatedQR && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={saveQRCode}
                  sx={{ mt: 2 }}
                  startIcon={<DownloadIcon />}
                >
                  {editingQR ? 'Update QR Code' : 'Save QR Code to Database'}
                </Button>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {generatedQR ? (
                <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      {stations.find(s => s.id === selectedStation)?.name || 'Station'} - Pump {pumpId}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      my: 3,
                      p: 2,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      <div id="qrcode-canvas">
                        <QRCode 
                          value={generatedQR} 
                          size={200}
                          level="H"
                          includeMargin={true}
                          fgColor="#1a73e8"
                        />
                      </div>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Fuel: {fuelType.toUpperCase()} | Price: ₦{parseFloat(price).toLocaleString()}/L
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Button
                      variant="contained"
                      onClick={downloadQRCode}
                      startIcon={<DownloadIcon />}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Download QR Code
                    </Button>
                    
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                      Scan this QR code with the ZadzaQR mobile app to purchase fuel
                    </Typography>
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
                  flexDirection: 'column',
                  borderRadius: 2,
                  backgroundColor: '#fafafa'
                }}>
                  <QrCodeIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                  <Typography color="textSecondary" variant="body1">
                    Generate a QR code to display it here
                  </Typography>
                  <Typography color="textSecondary" variant="caption" sx={{ mt: 1 }}>
                    Fill the form and click "Generate QR Code"
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditingQR(null);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}