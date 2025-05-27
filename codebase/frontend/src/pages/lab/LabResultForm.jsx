import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data - In a real app, this would come from an API call based on testId
const mockTestRequestDetails = {
  TR001: {
    id: 'TR001',
    patient: 'Abebe Kebede',
    patientId: 'P12345', // Assuming a patient ID
    test: 'Complete Blood Count',
    requestedBy: 'Dr. Yohannes Alemu',
    urgency: 'Routine',
    status: 'Pending',
    results: [
      { parameter: 'Hemoglobin', value: '', unit: 'g/dL', flag: '', referenceRange: '', remark: '' },
      { parameter: 'White Blood Cell Count', value: '', unit: '/uL', flag: '', referenceRange: '', remark: '' },
    ],
    interpretation: '',
  },
  TR003: {
    id: 'TR003',
    patient: 'Dawit Bekele',
    patientId: 'P12347', // Assuming a patient ID
    test: 'Malaria Test',
    requestedBy: 'Dr. Selam Haile',
    urgency: 'Urgent',
    status: 'Pending',
    results: [
      { parameter: 'Malaria Parasite', value: '', unit: '', flag: '', referenceRange: 'Negative', remark: '' },
    ],
    interpretation: '',
  },
  TR002: {
    id: 'TR002',
    patient: 'Tigist Hailu',
    patientId: 'P12346',
    test: 'Blood Chemistry',
    requestedBy: 'Dr. Yohannes Alemu',
    urgency: 'Urgent',
    status: 'In Progress',
    results: [
      { parameter: 'Glucose', value: '', unit: 'mg/dL', flag: '', referenceRange: '', remark: '' },
      { parameter: 'Creatinine', value: '', unit: 'mg/dL', flag: '', referenceRange: '', remark: '' },
    ],
    interpretation: '',
  },
  TR005: {
    id: 'TR005',
    patient: 'Solomon Tadesse',
    patientId: 'P12348',
    test: 'Urinalysis',
    requestedBy: 'Dr. Selam Haile',
    urgency: 'Emergency',
    status: 'In Progress',
    results: [
      { parameter: 'Specific Gravity', value: '', unit: '', flag: '', referenceRange: '', remark: '' },
      { parameter: 'pH', value: '', unit: '', flag: '', referenceRange: '', remark: '' },
      { parameter: 'Protein', value: '', unit: '', flag: '', referenceRange: '', remark: '' },
    ],
    interpretation: '',
  },
};

const availableTestNames = [
  'TSH', 'FT4', 'FT3', 'Folate', 'iCa', 'TCa', 'Rheumatoid factor', 'Glucose', 'Creatinine', 'Specific Gravity', 'pH', 'Protein'
];

const LabResultForm = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const data = mockTestRequestDetails[testId];
    if (data) {
      // Initialize new fields for existing results
      const initialFormData = {
        ...data,
        results: data.results.map(result => ({
          ...result,
          flag: result.flag || '',
          referenceRange: result.referenceRange || '',
          remark: result.remark || '',
          isNewParameter: false, // Flag to indicate if it's a new parameter
          newParameterName: '', // Store new parameter name if isNewParameter is true
        })),
      };
      setFormData(initialFormData);
      setLoading(false);
    } else {
      setError('Test request not found');
      setLoading(false);
    }
  }, [testId]);

  const handleInputChange = (e, index, field) => {
    const { value } = e.target;
    if (field === 'interpretation') {
      setFormData({
        ...formData,
        interpretation: value,
      });
    } else if (['value', 'unit', 'flag', 'referenceRange', 'remark'].includes(field)) {
      const newResults = [...formData.results];
      newResults[index][field] = value;
      setFormData({
        ...formData,
        results: newResults,
      });
    } else if (field === 'parameter') {
        const newResults = [...formData.results];
        if (value === 'addNew') {
            newResults[index].isNewParameter = true;
            newResults[index].parameter = ''; // Clear selected value
        } else {
            newResults[index].isNewParameter = false;
            newResults[index].parameter = value;
            newResults[index].newParameterName = ''; // Clear new parameter name
        }
         setFormData({
            ...formData,
            results: newResults,
          });
    } else if (field === 'newParameterName') {
         const newResults = [...formData.results];
         newResults[index].newParameterName = value;
          setFormData({
            ...formData,
            results: newResults,
          });
    }
  };

  const handleAddParameter = () => {
    setFormData({
      ...formData,
      results: [
        ...formData.results,
        { parameter: '', value: '', unit: '', flag: '', referenceRange: '', remark: '', isNewParameter: false, newParameterName: '' },
      ],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, send formData to an API with status 'Completed' or similar
    console.log('Submitting Lab Result:', formData);
    alert('Lab result submitted! (Check console for data)');
    // navigate('/lab/dashboard'); // Redirect after submission
  };

  const handleSaveDraft = () => {
    // In a real app, send formData to an API with status 'In Progress'
    console.log('Saving draft:', { ...formData, status: 'In Progress' });
    //alert('Lab result saved as draft! (Check console for data)');
    // Optionally update local state to reflect the status change immediately
    setFormData(prevFormData => ({ ...prevFormData, status: 'In Progress' }));
  };

  if (loading) {
    return <div className="p-8 text-center">Loading form...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!formData) {
      return null; // Should not happen if error is handled, but for safety
  }

  return (
    <>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Enter Lab Results for Test: {formData.test}</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Patient Information</h2>
          <p><strong>Name:</strong> {formData.patient}</p>
          <p><strong>Patient ID:</strong> {formData.patientId}</p>
          <p><strong>Requested By:</strong> {formData.requestedBy}</p>
          <p><strong>Urgency:</strong> {formData.urgency}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Results</h2>
            <div className="grid grid-cols-6 gap-4 mb-2 text-sm font-bold text-gray-700">
                <span>Test Name</span>
                <span>Result</span>
                <span>Unit</span>
                <span>Flag</span>
                <span>Reference Range</span>
                <span>Remark</span>
            </div>
            {formData.results.map((result, index) => (
              <div key={index} className="grid grid-cols-6 gap-4 items-center mb-4">
                <div>
                   {result.isNewParameter ? (
                      <input
                         type="text"
                         value={result.newParameterName}
                         onChange={(e) => handleInputChange(e, index, 'newParameterName')}
                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                         placeholder="New Test Name"
                         required
                       />
                   ) : (
                      <select
                         value={result.parameter}
                         onChange={(e) => handleInputChange(e, index, 'parameter')}
                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                         required
                       >
                         <option value="">Select Test</option>
                         {availableTestNames.map(name => <option key={name} value={name}>{name}</option>)}
                         <option value="addNew">+ Add New Test</option>
                       </select>
                   )}
                </div>
                <div>
                  <input
                    type="text"
                    value={result.value}
                    onChange={(e) => handleInputChange(e, index, 'value')}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                 <div>
                  <input
                    type="text"
                    value={result.unit}
                    onChange={(e) => handleInputChange(e, index, 'unit')}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={result.flag}
                    onChange={(e) => handleInputChange(e, index, 'flag')}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={result.referenceRange}
                    onChange={(e) => handleInputChange(e, index, 'referenceRange')}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={result.remark}
                    onChange={(e) => handleInputChange(e, index, 'remark')}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddParameter}
              className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              + Add Another Parameter
            </button>
          </div>

          <div className="mb-6">
            <label htmlFor="interpretation" className="block text-gray-700 text-sm font-bold mb-2">Interpretation</label>
            <textarea
              id="interpretation"
              rows="5"
              value={formData.interpretation}
              onChange={(e) => handleInputChange(e, null, 'interpretation')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>

          {/* Combined button section with Cancel on the left */}
          <div className="flex justify-between items-center mt-6">
            {/* Cancel button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>

            {/* Save and Submit buttons */}
            <div className="flex">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Submit Result
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default LabResultForm; 