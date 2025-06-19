import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createPrescription, getPrescriptionsByPatient } from '../../services/provider.service';

const medications = [
  { id: "amoxicillin", name: "Amoxicillin" },
  { id: "paracetamol", name: "Paracetamol" },
  { id: "ibuprofen", name: "Ibuprofen" },
  { id: "omeprazole", name: "Omeprazole" },
  { id: "metformin", name: "Metformin" },
  { id: "atorvastatin", name: "Atorvastatin" },
  { id: "lisinopril", name: "Lisinopril" },
  { id: "metoprolol", name: "Metoprolol" },
];

const Prescriptions = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [existingPrescriptions, setExistingPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // Get user from localStorage (hospitalId is optional now)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('User object:', user);

  // Fetch existing prescriptions for the patient
  useEffect(() => {
    const fetchExistingPrescriptions = async () => {
      if (!patientId) return;
      
      setLoadingExisting(true);
      try {
        const response = await getPrescriptionsByPatient(patientId);
        console.log('Fetched prescriptions:', response);
        setExistingPrescriptions(response.data || []);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast.error('Failed to fetch existing prescriptions');
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchExistingPrescriptions();
  }, [patientId]);

  const handlePrescriptionAdd = () => {
    setPrescriptions((prev) => [
      ...prev,
      { medication: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const handlePrescriptionChange = (index, field, value) => {
    setPrescriptions((prev) =>
      prev.map((prescription, i) =>
        i === index ? { ...prescription, [field]: value } : prescription
      )
    );
  };

  const handlePrescriptionRemove = (index) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOrderAllPrescriptions = async () => {
    if (!patientId) {
      toast.error('Missing patient information.');
      return;
    }
    const incomplete = prescriptions.some(
      (p) => !p.medication || !p.dosage || !p.frequency || !p.duration
    );
    if (incomplete) {
      toast.error('Please fill out all fields for each prescription.');
      return;
    }
    const drugs = prescriptions.map((p) => ({
      name: p.medication,
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration,
      instructions: '',
      quantity: 1,
    }));
    const prescriptionData = {
      patientId,
      notes: '',
      drugs,
    };
    console.log('Sending prescriptionData:', prescriptionData);
    setLoading(true);
    try {
      await createPrescription(prescriptionData);
      toast.success('Prescriptions ordered successfully!');
      setPrescriptions([]);
      // Refresh the existing prescriptions list
      const response = await getPrescriptionsByPatient(patientId);
      setExistingPrescriptions(response.data || []);
    } catch (err) {
      console.error('Prescription error:', err);
      toast.error(err.message || 'Failed to order prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>

        {/* Add New Prescriptions Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Prescriptions</h2>
            <button
              type="button"
              onClick={handlePrescriptionAdd}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Medication
            </button>
          </div>
          <div className="space-y-4">
            {prescriptions.map((prescription, index) => {
              const isComplete =
                prescription.medication &&
                prescription.dosage &&
                prescription.frequency &&
                prescription.duration;
              return (
                <div key={index} className="border p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Medication {index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePrescriptionRemove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Medication
                      </label>
                      <select
                        value={prescription.medication}
                        onChange={(e) =>
                          handlePrescriptionChange(index, "medication", e.target.value)
                        }
                        className="mt-1 block w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select medication</option>
                        {medications.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={prescription.dosage}
                        onChange={(e) =>
                          handlePrescriptionChange(index, "dosage", e.target.value)
                        }
                        className="mt-1 block w-full p-2 border rounded-md"
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Frequency
                      </label>
                      <input
                        type="text"
                        value={prescription.frequency}
                        onChange={(e) =>
                          handlePrescriptionChange(index, "frequency", e.target.value)
                        }
                        className="mt-1 block w-full p-2 border rounded-md"
                        placeholder="e.g., Twice daily"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={prescription.duration}
                        onChange={(e) =>
                          handlePrescriptionChange(index, "duration", e.target.value)
                        }
                        className="mt-1 block w-full p-2 border rounded-md"
                        placeholder="e.g., 7 days"
                        required
                      />
                    </div>
                  </div>
                  {!isComplete && (
                    <p className="mt-2 text-sm text-gray-500">
                      Please fill out all fields to order this prescription
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleOrderAllPrescriptions}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={prescriptions.length === 0 || loading}
            >
              {loading ? 'Ordering...' : 'Order All Prescriptions'}
            </button>
          </div>
        </div>

        {/* Existing Prescriptions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Previous Prescriptions</h2>
          {loadingExisting ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading prescriptions...</p>
            </div>
          ) : existingPrescriptions.length > 0 ? (
            <div className="space-y-4">
              {existingPrescriptions.map((prescription, index) => (
                <div key={prescription.id || index} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{prescription.drugName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(prescription.deliveryStatus)}`}>
                      {prescription.deliveryStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Dosage:</span>
                      <span className="ml-2">{prescription.dosage || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Frequency:</span>
                      <span className="ml-2">{prescription.frequency || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Duration:</span>
                      <span className="ml-2">{prescription.duration || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Quantity:</span>
                      <span className="ml-2">{prescription.quantity || 1}</span>
                    </div>
                  </div>
                  {prescription.instructions && (
                    <div className="mt-2">
                      <span className="font-medium text-gray-600">Instructions:</span>
                      <span className="ml-2">{prescription.instructions}</span>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Prescribed on: {new Date(prescription.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No previous prescriptions found for this patient.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default Prescriptions; 
