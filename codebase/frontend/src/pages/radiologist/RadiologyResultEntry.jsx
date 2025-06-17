import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import radiologyService from "../../services/radiologist.service";
import { useToast } from "../../components/ui/use-toast";

const RadiologyResultEntry = () => {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanDetails, setScanDetails] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [result, setResult] = useState({
    findings: "",
    impression: "",
    recommendations: "",
    priority: "normal",
    additionalNotes: "",
    status: "in-progress",
    measurements: [],
    images: [],
  });
  const [newMeasurement, setNewMeasurement] = useState({
    size: "",
    density: "",
    location: "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [statusNotes, setStatusNotes] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!scanId) {
          throw new Error("Scan ID is missing");
        }
        const [scanResponse, providerResponse] = await Promise.all([
          radiologyService.getRequestDetails(scanId),
          radiologyService.getProviderDetails(scanDetails?.providerId)
        ]);

        if (scanResponse.success) {
          setScanDetails(scanResponse.data);
          setResult(prev => ({
            ...prev,
            findings: scanResponse.data.report?.findings || "",
            impression: scanResponse.data.report?.impression || "",
            recommendations: scanResponse.data.report?.recommendations || "",
            priority: scanResponse.data.report?.priority || "normal",
            additionalNotes: scanResponse.data.report?.additionalNotes || "",
            status: scanResponse.data.report?.status || "in-progress",
            measurements: scanResponse.data.report?.measurements || [],
            images: scanResponse.data.report?.images || [],
          }));
        }

        if (providerResponse.success) {
          setProviderDetails(providerResponse.data);
        }
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch details",
          variant: "destructive",
        });
      }
    };
    fetchDetails();
  }, [scanId, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResult(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await radiologyService.updateRequestStatus(
        scanId,
        newStatus,
        statusNotes
      );
      if (response.success) {
        toast({
          title: "Success",
          description: `Status updated to ${newStatus}`,
        });
        setResult(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitReport = async () => {
    try {
      const reportData = {
        ...result,
        images: selectedImages,
        status: "completed"
      };
      
      const response = await radiologyService.submitDetailedReport(scanId, reportData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Report submitted successfully",
        });
        navigate("/radiologist/dashboard");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit report",
        variant: "destructive",
      });
    }
  };

  if (!scanDetails) {
    return <div className="p-4">Loading details...</div>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Radiology Result Entry</h1>

      {/* Provider and Patient Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
            <p><strong>Name:</strong> {scanDetails.patientName}</p>
            <p><strong>ID:</strong> {scanDetails.patientId}</p>
            <p><strong>Age:</strong> {scanDetails.patientAge}</p>
            <p><strong>Gender:</strong> {scanDetails.patientGender}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Provider Information</h2>
            <p><strong>Name:</strong> {providerDetails?.name}</p>
            <p><strong>Department:</strong> {providerDetails?.department}</p>
            <p><strong>Contact:</strong> {providerDetails?.contact}</p>
          </div>
        </div>
      </div>

      {/* Scan Details */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Scan Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>Scan Type:</strong> {scanDetails.scanType}</p>
          <p><strong>Urgency:</strong> {scanDetails.urgency}</p>
          <p><strong>Reason:</strong> {scanDetails.reasonForOrder}</p>
          <p><strong>Status:</strong> {scanDetails.status}</p>
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Update Status</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => handleStatusUpdate("in-progress")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Mark In Progress
          </button>
          <button
            onClick={() => handleStatusUpdate("review")}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Send for Review
          </button>
          <button
            onClick={() => handleStatusUpdate("completed")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Mark Completed
          </button>
        </div>
        <textarea
          value={statusNotes}
          onChange={(e) => setStatusNotes(e.target.value)}
          placeholder="Add notes about the status update..."
          className="w-full p-2 border rounded"
          rows="3"
        />
      </div>

      {/* Report Entry */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Report Entry</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Priority Level</label>
          <select
            name="priority"
            value={result.priority}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Findings</label>
          <textarea
            name="findings"
            value={result.findings}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows="6"
            placeholder="Enter detailed findings..."
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Impression</label>
          <textarea
            name="impression"
            value={result.impression}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Enter impression..."
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Recommendations</label>
          <textarea
            name="recommendations"
            value={result.recommendations}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Enter recommendations..."
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Additional Notes</label>
          <textarea
            name="additionalNotes"
            value={result.additionalNotes}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Enter any additional notes..."
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Images</h2>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="grid grid-cols-3 gap-4 mt-4">
          {imagePreviewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-48 object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmitReport}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit Report
        </button>
      </div>
    </div>
  );
};

export default RadiologyResultEntry;
