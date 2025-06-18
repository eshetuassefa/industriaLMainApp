import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button"; // Assuming Button is available
import { Eye } from "lucide-react"; // Importing Eye icon for consistency
import radiologyService from "../../services/radiologist.service";
import { useToast } from "../../components/ui/use-toast";
import { Badge } from "../../components/ui/badge";

const CompletedScansList = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await radiologyService.getAllRadiologyRequests();
      if (response.success) {
        const completedRequests = (response.data || []).filter(
          (r) => r.status === "COMPLETED"
        );
        setRequests(completedRequests);
      } else {
        throw new Error(response.error?.message || "Failed to fetch requests");
      }
    } catch (err) {
      setError(err.message || "Failed to load requests");
      toast({
        title: "Error",
        description: err.message || "Failed to load requests",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      if (!isMounted) return;
      await fetchRequests();
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchRequests]);

  const handleViewDetails = (reqId) => {
    setShowDetails(requests.find((r) => r.id === reqId));
  };

  // Helper function to get full name safely
  const getFullName = (person) => {
    if (!person) return "N/A";
    const { firstName, middleName, lastName } = person;
    return [firstName, middleName, lastName].filter(Boolean).join(" ") || "N/A";
  };

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Completed Scans</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        {requests.length === 0 ? (
          <p className="text-gray-500">No completed scans available.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Radiologist Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imaging Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Body Part
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getFullName(req.medicalRecord?.patient?.person)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getFullName(req.medicalRecord?.doctor?.person)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getFullName(req.report?.radiologist?.person)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.imagingType || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.bodyPart || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(req.id);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <button
        onClick={() => navigate("/radiology/dashboard")}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Dashboard
      </button>
      {/* Modal for View Details */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Scan Details</h2>
              <button
                onClick={() => setShowDetails(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Patient:</span>
                  <span className="text-gray-900">
                    {getFullName(showDetails.medicalRecord?.patient?.person)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Doctor:</span>
                  <span className="text-gray-900">
                    {getFullName(showDetails.medicalRecord?.doctor?.person)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">
                    Radiologist:
                  </span>
                  <span className="text-gray-900">
                    {getFullName(showDetails.report?.radiologist?.person)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">
                    Imaging Type:
                  </span>
                  <span className="text-gray-900">
                    {showDetails.imagingType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Body Part:</span>
                  <span className="text-gray-900">{showDetails.bodyPart}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {showDetails.status}
                  </Badge>
                </div>
                {showDetails.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-600 font-medium block mb-2">
                      Notes:
                    </span>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {showDetails.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetails(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedScansList;
