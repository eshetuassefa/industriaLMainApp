import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data - replace with actual API calls
const mockScanDetails = {
  id: 'R001',
  patientId: 'P001',
  patientName: 'Abebe Kebede',
  scanType: 'Chest X-Ray',
  requestedBy: 'Dr. Yohannes Alemu',
  urgency: 'Routine',
  reasonForOrder: 'Patient presents with persistent cough and shortness of breath. Rule out pneumonia.',
  // Add other relevant patient and scan details here
};

const mockRadiologyResult = {
  report: '',
  impression: '',
  measurements: [], // Array to hold measurement objects { size, density, location }
  status: 'in-progress', // Add status field
  // Removed annotations: '',
};

const RadiologyResultEntry = () => {
  const { scanId } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [scanDetails, setScanDetails] = useState(null);
  const [result, setResult] = useState(mockRadiologyResult);
  const [newMeasurement, setNewMeasurement] = useState({ size: '', density: '', location: '' });
  const [selectedImage, setSelectedImage] = useState(null); // State for the selected image file
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // State for image preview URL

  useEffect(() => {
    // TODO: Fetch scan details based on scanId
    // For now, using mock data
    setScanDetails(mockScanDetails);
    // TODO: If editing an existing result, fetch its data including existing image if any
  }, [scanId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResult({ ...result, [name]: value });
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setNewMeasurement({ ...newMeasurement, [name]: value });
  };

  const addMeasurement = () => {
    if (newMeasurement.size && newMeasurement.density && newMeasurement.location) {
      setResult({ ...result, measurements: [...result.measurements, newMeasurement] });
      setNewMeasurement({ size: '', density: '', location: '' }); // Clear the input fields
    }
  };

   const removeMeasurement = (index) => {
    const updatedMeasurements = result.measurements.filter((_, i) => i !== index);
    setResult({ ...result, measurements: updatedMeasurements });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality (API call)
    console.log('Saving draft result:', { ...result, status: 'draft' });
    // After saving, maybe show a confirmation message or stay on the page
  };

  const handleSaveResult = () => {
    // TODO: Implement final save functionality (API call)
    console.log('Saving final result:', { ...result, status: 'final' });
    // After saving, maybe navigate back to a list or details page
  };

  const handleCancel = () => {
    // TODO: Implement cancel logic (e.g., confirm unsaved changes)
    console.log('Cancelling...');
    navigate(-1); // Navigate back to the previous page
  };

  if (!scanDetails) {
    return <div className="p-4">Loading scan details...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Radiology Result Entry</h1>

      {/* Patient Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
        <p><strong>Patient Name:</strong> {scanDetails.patientName}</p>
        <p><strong>Scan Type:</strong> {scanDetails.scanType}</p>
        <p><strong>Requested By:</strong> {scanDetails.requestedBy}</p>
        <p><strong>Urgency:</strong> {scanDetails.urgency}</p>
        <p><strong>Reason for Order:</strong> {scanDetails.reasonForOrder}</p>
        {/* Add other relevant patient info */}
      </div>

      {/* Radiology Image Upload */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Radiology Image</h2>
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {imagePreviewUrl && (
          <div className="mt-4 flex justify-center items-center">
            <img src={imagePreviewUrl} alt="Image Preview" className="max-h-80 max-w-full rounded-md" />
          </div>
        )}
      </div>

      {/* Radiologist's Report */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Report /Findings</h2>
        <textarea
          name="report"
          rows="6"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={result.report}
          onChange={handleInputChange}
          placeholder="Enter radiologist's report here..."
        ></textarea>
      </div>

      {/* Impression */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Impression / Conclusion</h2>
        <textarea
          name="impression"
          rows="4"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={result.impression}
          onChange={handleInputChange}
          placeholder="Enter impression/conclusions here..."
        ></textarea>
      </div>

      {/* Save Button */}
      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <div>
          <button
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold mr-2"
            onClick={handleSaveDraft}
          >
            Save as Draft
          </button>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            onClick={handleSaveResult}
          >
            Save Radiology Result
          </button>
        </div>
      </div>
    </div>
  );
};

export default RadiologyResultEntry; 