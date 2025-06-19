import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createRadiologyRequest, getRadiologyRequests } from '../../services/provider.service';

const radiologyTests = [
  { id: "xray", name: "X-Ray" },
  { id: "mri", name: "MRI" },
  { id: "ct", name: "CT Scan" },
  { id: "ultrasound", name: "Ultrasound" },
  { id: "mammogram", name: "Mammogram" },
];

const RadiologyRequests = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [selectedTests, setSelectedTests] = useState([]);
  const [bodyPart, setBodyPart] = useState('');
  const [reason, setReason] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRadiologyRequests();
      // Filter to only show requests for this patient
      setRequests(data.data.filter(r => r.medicalRecord?.patientId === patientId));
    } catch (err) {
      setError(err.message || 'Failed to fetch radiology requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchRequests();
  }, [patientId]);

  const handleRadiologyChange = (e) => {
    const { value, checked } = e.target;
    setSelectedTests((prev) =>
      checked ? [...prev, value] : prev.filter((test) => test !== value)
    );
  };

  const handleBodyPartChange = (e) => {
    setBodyPart(e.target.value);
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleOrderRadiology = async () => {
    if (selectedTests.length === 0) {
      toast.error('Please select at least one imaging test.');
      return;
    }
    if (!bodyPart) {
      toast.error('Please specify the body part.');
      return;
    }
    setSubmitting(true);
    try {
      for (const imagingType of selectedTests) {
        await createRadiologyRequest({
          patientId,
          imagingType,
          bodyPart,
          notes: reason,
        });
      }
      toast.success('Radiology request(s) ordered successfully!');
      setSelectedTests([]);
      setBodyPart('');
      setReason('');
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to order radiology request(s)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Radiology Requests</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Radiology Imaging</h2>
          <div className="space-y-2 mb-4">
            {radiologyTests.map((test) => (
              <div key={test.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={test.id}
                  value={test.id}
                  checked={selectedTests.includes(test.id)}
                  onChange={handleRadiologyChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={test.id} className="ml-2 block text-sm text-gray-900">
                  {test.name}
                </label>
              </div>
            ))}
          </div>
          {selectedTests.length > 0 && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Part
                </label>
                <input
                  type="text"
                  value={bodyPart}
                  onChange={handleBodyPartChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., Chest, Abdomen, Knee"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Justification
                </label>
                <textarea
                  value={reason}
                  onChange={handleReasonChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter reason for radiology request..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleOrderRadiology}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={submitting}
                >
                  {submitting ? 'Ordering...' : 'Order Imaging'}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Previous Radiology Requests</h2>
          {loading ? (
            <div>Loading requests...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : requests.length === 0 ? (
            <div className="text-gray-500">No radiology requests found for this patient.</div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">{req.imagingType}</span> <span className="text-gray-500">({req.bodyPart})</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{req.status}</span>
                  </div>
                  <div className="text-sm text-gray-700 mb-1">Notes: {req.notes}</div>
                  <div className="text-xs text-gray-400">Requested on: {new Date(req.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadiologyRequests; 