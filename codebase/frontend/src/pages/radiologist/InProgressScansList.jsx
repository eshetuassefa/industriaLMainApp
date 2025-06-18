import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Clock, Eye, Play, FileText } from "lucide-react";
import radiologyService from "../../services/radiologist.service";
import { useToast } from "../../components/ui/use-toast";

const InProgressScansList = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reportText, setReportText] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showDetails, setShowDetails] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    try {
      const response = await radiologyService.getAllRadiologyRequests();
      if (response.success) {
        const inProgressRequests = (response.data || [])
          .filter((req) => req.status === "IN_PROGRESS")
          .map((req) => ({
            ...req,
            startedDate: new Date(req.updatedAt).toLocaleDateString(),
          }));
        setRequests(inProgressRequests);
      } else {
        throw new Error(response.error?.message || "Failed to fetch requests");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch in-progress scans");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch in-progress scans",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      try {
        await fetchRequests();
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchRequests]);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      let result;
      if (newStatus === "COMPLETED") {
        result = await radiologyService.submitReport(
          requestId,
          { reportText },
          images
        );
        setReportText("");
        setImages([]);
        setImagePreviews([]);
        setSelectedRequest(null);
      }
      if (result.success) {
        toast({
          title: "Success",
          description: `Status updated to ${newStatus}`,
        });
        navigate(`/radiology/result/${requestId}`);
      } else {
        throw new Error(result.error?.message || "Failed to update status");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleViewDetails = (reqId) => {
    setShowDetails(requests.find((r) => r.id === reqId));
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (selectedRequest) {
      handleStatusUpdate(selectedRequest.id, "COMPLETED");
    }
  };

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">In Progress Scans</h1>
        <Button
          onClick={() => navigate("/radiology/dashboard")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Radiologist Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imaging Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Body Part</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.medicalRecord?.patient?.person?.firstName} {req.medicalRecord?.patient?.person?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.medicalRecord?.doctor?.person?.firstName} {req.medicalRecord?.doctor?.person?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.report?.radiologist?.person?.firstName} {req.report?.radiologist?.person?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.imagingType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.bodyPart}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {req.startedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-900"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleViewDetails(req.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Submission Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => {
          setSelectedRequest(null);
          setReportText("");
          setImages([]);
          setImagePreviews([]);
        }}>
          <div className="bg-gray-200 p-8 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Submit Report for Request #{selectedRequest.id}
            </h2>
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label
                  htmlFor="reportText"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Report Text
                </label>
                <textarea
                  id="reportText"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Enter detailed report text..."
                  rows={4}
                />
              </div>
              <div>
                <label
                  htmlFor="images"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Upload Images
                </label>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full p-2 border border-gray-300 rounded-lg file:bg-blue-50 file:text-blue-700 file:font-medium file:px-4 file:py-2 file:rounded file:border-0 hover:file:bg-blue-100"
                />
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    setSelectedRequest(null);
                    setReportText("");
                    setImages([]);
                    setImagePreviews([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  disabled={!reportText}
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => setShowDetails(null)}>
          <div className="bg-gray-200 p-8 rounded-lg shadow-xl w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Scan Details</h2>
            <div className="space-y-4">
              <p className="text-lg"><strong>Patient:</strong> {showDetails.medicalRecord?.patient?.person?.firstName} {showDetails.medicalRecord?.patient?.person?.lastName}</p>
              <p className="text-lg"><strong>Doctor:</strong> {showDetails.medicalRecord?.doctor?.person?.firstName} {showDetails.medicalRecord?.doctor?.person?.lastName}</p>
              <p className="text-lg"><strong>Radiologist:</strong> {showDetails.report?.radiologist?.person?.firstName} {showDetails.report?.radiologist?.person?.lastName}</p>
              <p className="text-lg"><strong>Imaging Type:</strong> {showDetails.imagingType}</p>
              <p className="text-lg"><strong>Body Part:</strong> {showDetails.bodyPart}</p>
              <p className="text-lg"><strong>Status:</strong> {showDetails.status}</p>
              <p className="text-lg"><strong>Notes:</strong> {showDetails.notes}</p>
            </div>
            <button
              onClick={() => setShowDetails(null)}
              className="mt-6 px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InProgressScansList;
