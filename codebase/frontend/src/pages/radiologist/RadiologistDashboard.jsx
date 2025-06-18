import React, { useState, useEffect, useCallback } from "react";
import {
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import radiologyService from "../../services/radiologist.service";
import { useToast } from "../../components/ui/use-toast";
import { Eye } from "lucide-react";

const RadiologistDashboard = () => {
  const [activeTab, setActiveTab] = useState("pendingInProgress");
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    urgent: 0,
    scanTypes: {},
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reportText, setReportText] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showDetails, setShowDetails] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchAllRadiologyRequests = useCallback(async () => {
    try {
      const response = await radiologyService.getAllRadiologyRequests();
      if (response.success) {
        const allRequests = response.data || [];
        
        // Calculate statistics
        const stats = {
          pending: allRequests.filter((r) => r.status === "PENDING").length,
          inProgress: allRequests.filter((r) => r.status === "IN_PROGRESS").length,
          completed: allRequests.filter((r) => r.status === "COMPLETED").length,
          urgent: allRequests.filter((r) => r.urgency === "URGENT").length,
          scanTypes: allRequests.reduce((acc, r) => {
            acc[r.imagingType] = (acc[r.imagingType] || 0) + 1;
            return acc;
          }, {}),
        };

        // Filter requests based on active tab
        let filteredRequests = allRequests;
        if (activeTab === "pendingInProgress") {
          filteredRequests = allRequests.filter(
            (r) => r.status === "PENDING" || r.status === "IN_PROGRESS"
          );
        } else if (activeTab === "scheduled") {
          filteredRequests = allRequests.filter(
            (r) => r.status === "SCHEDULED"
          );
        } else if (activeTab === "recentlyCompleted") {
          filteredRequests = allRequests.filter(
            (r) => r.status === "COMPLETED"
          );
        }

        // Update state in a single batch
        setStatistics(stats);
        setRequests(filteredRequests);
        setLoading(false);
      } else {
        throw new Error(response.error?.message || "Failed to fetch requests");
      }
    } catch (err) {
      setError("Failed to fetch radiology requests");
      toast({
        title: "Error",
        description: "Failed to load radiology requests",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    fetchAllRadiologyRequests();
  }, [fetchAllRadiologyRequests]);

  const handleCardClick = useCallback((status) => {
    navigate(`/radiology/dashboard/${status}`);
  }, [navigate]);

  const filteredRequests = requests.filter((request) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      request.imagingType?.toLowerCase().includes(searchLower) ||
      request.bodyPart?.toLowerCase().includes(searchLower) ||
      request.notes?.toLowerCase().includes(searchLower)
    );
  });

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      let result;
      if (newStatus === "IN_PROGRESS") {
        result = await radiologyService.startRequest(requestId);
      } else if (newStatus === "COMPLETED") {
        if (!selectedRequest || selectedRequest.id !== requestId) {
          setSelectedRequest(requests.find((r) => r.id === requestId));
          return;
        }
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
        fetchAllRadiologyRequests();
      } else {
        throw new Error(result.error.message);
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

  const handleViewDetails = async (requestId) => {
    try {
      const response = await radiologyService.getReport(requestId);
      if (response.success) {
        navigate(`/radiology/result/${requestId}`, {
          state: { report: response.data },
        });
      } else {
        throw new Error(response.error?.message || "Failed to load report");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to load report details",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (selectedRequest) {
      await handleStatusUpdate(selectedRequest.id, "COMPLETED");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Radiology Dashboard</h1>

      {error && <div className="text-red-500 py-4">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick("pending-scans")}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Pending Scans</h3>
            <ClockIcon className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">{statistics.pending}</p>
        </div>
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick("in-progress-scans")}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">In Progress</h3>
            <DocumentTextIcon className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{statistics.inProgress}</p>
        </div>
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick("completed-scans")}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Completed Today</h3>
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{statistics.completed}</p>
        </div>
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick("urgent-scans")}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Urgent Requests</h3>
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold">{statistics.urgent}</p>
        </div>
      </div>

      {/* Scan Types Distribution */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Scan Types Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statistics.scanTypes).map(([type, count]) => (
            <div key={type} className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-3">
                <BeakerIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-semibold">{type}</p>
                <p className="text-sm text-gray-600">{count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radiology Requests Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Radiology Requests</h2>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search requests..."
              className="px-4 py-2 border rounded-l-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => navigate("/radiology/schedule")}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg flex items-center hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-1" /> New Request
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            {["pendingInProgress", "scheduled", "recentlyCompleted"].map(
              (tab) => (
                <button
                  key={tab}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "pendingInProgress"
                    ? "Pending & In Progress"
                    : tab === "scheduled"
                    ? "Scheduled Scans"
                    : "Recently Completed"}
                </button>
              )
            )}
          </nav>
        </div>

        {loading && <p className="text-gray-600">Loading requests...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Radiologist Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imaging Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Body Part</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.medicalRecord?.patient?.person?.firstName} {request.medicalRecord?.patient?.person?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.medicalRecord?.doctor?.person?.firstName} {request.medicalRecord?.doctor?.person?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.report?.radiologist?.person?.firstName} {request.report?.radiologist?.person?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.imagingType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.bodyPart}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {request.notes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : request.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === "PENDING" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(request.id, "IN_PROGRESS")
                        }
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Start
                      </button>
                    )}
                    {request.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                        }}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => setShowDetails(request)}
                      className="text-indigo-600 hover:text-indigo-900 ml-3 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enhanced Report Submission Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50" onClick={() => {
            setSelectedRequest(null);
            setReportText("");
            setImages([]);
            setImagePreviews([]);
          }}>
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowDetails(null)}>
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
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
    </div>
  );
};

export default RadiologistDashboard;
