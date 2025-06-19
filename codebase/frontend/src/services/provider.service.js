import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw error.response.data || error.message;
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw error.message;
  }
};

export const getForwardedPatient = async (patientId, doctorId) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    if (!doctorId) {
      throw new Error('Doctor ID not found. Please log in again.');
    }

    const response = await axios.get(`${API_URL}/reception/forwarded-patient/${patientId}/${doctorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const addMedicalRecord = async (recordData) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await axios.post(`${API_URL}/doctor/medical-records`, recordData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Appointment endpoints
export const getAppointments = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await axios.get(`${API_URL}/doctor/appointments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getAppointmentById = async (appointmentId) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await axios.get(`${API_URL}/doctor/appointments/${appointmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await axios.post(`${API_URL}/doctor/appointments`, appointmentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createRadiologyRequest = async (requestData) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    const response = await axios.post(`${API_URL}/radiology/create-request`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getRadiologyRequests = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    const response = await axios.get(`${API_URL}/radiology/all-requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createLabTestRequest = async (requestData) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    const response = await axios.post(`${API_URL}/lab-results/create-request`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getLabTestRequests = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    const response = await axios.get(`${API_URL}/lab-results/get-all-requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getLabTestTypes = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No authentication token found. Please log in again.');
  const response = await axios.get(`${API_URL}/lab-results/test-types`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createPrescription = async (prescriptionData) => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No authentication token found. Please log in again.');
  const response = await axios.post(`${API_URL}/pharmacy/prescriptions`, prescriptionData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getPrescriptionsByPatient = async (patientId) => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No authentication token found. Please log in again.');
  if (!patientId) throw new Error('Patient ID is required.');
  const response = await axios.get(`${API_URL}/pharmacy/patients/${patientId}/prescriptions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Dashboard statistics endpoint
export const getDashboardStats = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await axios.get(`${API_URL}/doctor/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}; 