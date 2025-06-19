import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createLabTestRequest, getLabTestRequests, getLabTestTypes } from '../../services/provider.service';

const LabTests = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [selectedTests, setSelectedTests] = useState([]);
  const [urgency, setUrgency] = useState('normal');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [labTests, setLabTests] = useState([]);
  const [testTypeMap, setTestTypeMap] = useState({});

  // Get hospitalId from user in localStorage (optional now)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('User object:', user);

  // Fetch test types from backend
  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        const data = await getLabTestTypes();
        setLabTests(data.data);
        // Map code (or name) to id for easy lookup
        const map = {};
        data.data.forEach(t => {
          // Use code as the value for checkbox, map code to id
          map[t.code.toLowerCase()] = t.id;
        });
        setTestTypeMap(map);
      } catch (err) {
        toast.error('Failed to fetch lab test types');
      }
    };
    fetchTestTypes();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLabTestRequests();
      // Filter to only show requests for this patient
      setRequests(data.data.filter(r => r.patientId === patientId));
    } catch (err) {
      setError(err.message || 'Failed to fetch lab test requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchRequests();
  }, [patientId]);

  const handleLabTestChange = (e) => {
    const { value, checked } = e.target;
    setSelectedTests((prev) =>
      checked ? [...prev, value] : prev.filter((test) => test !== value)
    );
  };

  const handleUrgencyChange = (e) => {
    setUrgency(e.target.value);
  };

  const handleOrderSelectedLabTests = async () => {
    console.log('Button clicked!');
    console.log('Selected tests:', selectedTests);
    console.log('Patient ID:', patientId);
    
    if (selectedTests.length === 0) {
      toast.error('Please select at least one test.');
      return;
    }
    setSubmitting(true);
    try {
      console.log('Starting to order tests...');
      for (const code of selectedTests) {
        const testTypeId = testTypeMap[code];
        console.log(`Processing test code: ${code}, testTypeId: ${testTypeId}`);
        if (!testTypeId) {
          console.log(`Skipping ${code} - no testTypeId found`);
          continue; // skip if not found
        }
        const requestData = {
          patientId,
          testTypeId,
          notes: urgency,
        };
        console.log('Sending request data:', requestData);
        await createLabTestRequest(requestData);
      }
      toast.success('Lab tests ordered successfully!');
      setSelectedTests([]);
      setUrgency('normal');
      fetchRequests();
    } catch (err) {
      console.error('Error ordering lab tests:', err);
      toast.error(err.message || 'Failed to order lab tests');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Lab Tests</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Lab Tests</h2>
          <div className="space-y-2 mb-4">
            {labTests.length === 0 ? (
              <div>Loading test types...</div>
            ) : (
              labTests.map((test) => (
                <div key={test.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={test.code.toLowerCase()}
                    value={test.code.toLowerCase()}
                    checked={selectedTests.includes(test.code.toLowerCase())}
                    onChange={handleLabTestChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={test.code.toLowerCase()} className="ml-2 block text-sm text-gray-900">
                    {test.name}
                  </label>
                </div>
              ))
            )}
          </div>
          {selectedTests.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Urgency Level:
                  </label>
                  <select
                    value={urgency}
                    onChange={handleUrgencyChange}
                    className="p-2 border rounded-md"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => console.log('Test button clicked!')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Test Button
                  </button>
                  <button
                    type="button"
                    onClick={handleOrderSelectedLabTests}
                    className={`px-4 py-2 text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      submitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    disabled={submitting}
                  >
                    {submitting ? 'Ordering...' : 'Order Selected Tests'}
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Debug: Selected tests: {selectedTests.length}, Patient ID: {patientId || 'Not found'}
              </div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Previous Lab Test Requests</h2>
          {loading ? (
            <div>Loading requests...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : requests.length === 0 ? (
            <div className="text-gray-500">No lab test requests found for this patient.</div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">{req.testType?.name || req.testTypeId}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${req.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' : req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{req.status}</span>
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

export default LabTests; 