import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button"; // Assuming Button is available
import { Eye } from "lucide-react"; // Importing Eye icon for consistency
import radiologyService from "../../services/radiologist.service";
import { useToast } from "../../components/ui/use-toast";

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
                    {req.medicalRecord?.patient?.person?.firstName}{" "}
                    {req.medicalRecord?.patient?.person?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.medicalRecord?.doctor?.person?.firstName}{" "}
                    {req.medicalRecord?.doctor?.person?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.report?.radiologist?.person?.firstName}{" "}
                    {req.report?.radiologist?.person?.lastName}
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
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowDetails(null)}
        >
          <div
            className="bg-gray-200 p-8 rounded-lg shadow-xl w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Scan Details
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                <strong>Patient:</strong>{" "}
                {showDetails.medicalRecord?.patient?.person?.firstName}{" "}
                {showDetails.medicalRecord?.patient?.person?.lastName}
              </p>
              <p className="text-lg">
                <strong>Doctor:</strong>{" "}
                {showDetails.medicalRecord?.doctor?.person?.firstName}{" "}
                {showDetails.medicalRecord?.doctor?.person?.lastName}
              </p>
              <p className="text-lg">
                <strong>Radiologist:</strong>{" "}
                {showDetails.report?.radiologist?.person?.firstName}{" "}
                {showDetails.report?.radiologist?.person?.lastName}
              </p>
              <p className="text-lg">
                <strong>Imaging Type:</strong> {showDetails.imagingType}
              </p>
              <p className="text-lg">
                <strong>Body Part:</strong> {showDetails.bodyPart}
              </p>
              <p className="text-lg">
                <strong>Status:</strong> {showDetails.status}
              </p>
              <p className="text-lg">
                <strong>Notes:</strong> {showDetails.notes}
              </p>
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

export default CompletedScansList;
