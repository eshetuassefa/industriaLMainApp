import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Clock, Eye, Play, X, Loader2 } from "lucide-react";
import radiologyService from "../../services/radiologist.service";
import { useToast } from "../../components/ui/use-toast";

const PendingScansList = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [startingScans, setStartingScans] = useState(new Set());
  const [showDetails, setShowDetails] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    try {
      const response = await radiologyService.getAllRadiologyRequests();
      if (response.success) {
        const pendingRequests = (response.data || [])
          .filter((req) => req.status === "PENDING")
          .map((req) => ({
            ...req,
            requestedDate: new Date(req.createdAt).toLocaleDateString(),
          }));
        setRequests(pendingRequests);
      } else {
        throw new Error(response.error?.message || "Failed to fetch requests");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch pending scans");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch pending scans",
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

  const handleStartScan = async (scanId) => {
    if (startingScans.has(scanId)) return; // Prevent multiple clicks

    try {
      setStartingScans((prev) => new Set(prev).add(scanId));
      const response = await radiologyService.startRequest(scanId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Scan started successfully",
        });
        await fetchRequests(); // Refresh the list to update status
      } else {
        throw new Error(response.error?.message || "Failed to start scan");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to start scan",
        variant: "destructive",
      });
    } finally {
      setStartingScans((prev) => {
        const newSet = new Set(prev);
        newSet.delete(scanId);
        return newSet;
      });
    }
  };

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Scans</h1>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imaging Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Body Part
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getFullName(req.medicalRecord?.patient?.person)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getFullName(req.medicalRecord?.doctor?.person)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.imagingType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.bodyPart}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {req.requestedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      onClick={() => handleStartScan(req.id)}
                      disabled={startingScans.has(req.id)}
                    >
                      {startingScans.has(req.id) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </>
                      )}
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

      {/* View Details Modal */}
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
                <X className="w-6 h-6" />
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
                    className="bg-yellow-100 text-yellow-800"
                  >
                    {showDetails.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">
                    Requested Date:
                  </span>
                  <span className="text-gray-900">
                    {showDetails.requestedDate}
                  </span>
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
              <Button
                onClick={() => setShowDetails(null)}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingScansList;
