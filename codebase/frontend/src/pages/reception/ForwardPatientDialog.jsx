import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const ForwardPatientDialog = ({ open, onClose, patient, onForward }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        enqueueSnackbar('Failed to fetch departments', { variant: 'error' });
      }
    };

    if (open) {
      fetchDepartments();
    }
  }, [open, enqueueSnackbar]);

  useEffect(() => {
    const fetchProviders = async () => {
      if (!selectedDepartment) {
        setProviders([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`/api/admin/healthcare-providers?department=${selectedDepartment}`);
        if (Array.isArray(response.data)) {
          setProviders(response.data);
        } else {
          console.error('Invalid response format:', response.data);
          setProviders([]);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        enqueueSnackbar('Failed to fetch healthcare providers', { variant: 'error' });
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [selectedDepartment, enqueueSnackbar]);

  const handleForward = () => {
    if (!selectedDepartment || !selectedProvider) {
      enqueueSnackbar('Please select both department and healthcare provider', { variant: 'warning' });
      return;
    }

    onForward({
      departmentId: selectedDepartment,
      providerId: selectedProvider,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Forward Patient</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              label="Department"
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Healthcare Provider</InputLabel>
            <Select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              label="Healthcare Provider"
              disabled={loading || !selectedDepartment}
            >
              {loading ? (
                <MenuItem disabled>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    Loading providers...
                  </Box>
                </MenuItem>
              ) : providers.length === 0 ? (
                <MenuItem disabled>No providers available</MenuItem>
              ) : (
                providers.map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    {provider.person.firstName} {provider.person.lastName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleForward}
          variant="contained"
          disabled={!selectedDepartment || !selectedProvider || loading}
        >
          Forward
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForwardPatientDialog; 