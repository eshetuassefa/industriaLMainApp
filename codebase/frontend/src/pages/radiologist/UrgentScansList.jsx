import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import radiologyService from "../../services/radiologist.service";
import { useToast } from "../../components/ui/use-toast";

const UrgentScansList = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    try {
      const response = await radiologyService.getAllRadiologyRequests();
      if (response.success) {
        const urgentRequests = response.data.filter(
          (r) => r.urgency === "URGENT"
        );
        setRequests(urgentRequests);
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
      <h1 className="text-2xl font-bold mb-4">Urgent Scans</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        {requests.length === 0 ? (
          <p className="text-gray-500">No urgent scans available.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Radiologist Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imaging Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Body Part
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {getFullName(req.medicalRecord?.patient?.person)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {getFullName(req.medicalRecord?.doctor?.person)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {getFullName(req.report?.radiologist?.person)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {req.imagingType || "N/A"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {req.bodyPart || "N/A"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        req.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : req.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {req.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/radiologist/results/${req.id}`);
                      }}
                    >
                      {req.status === "COMPLETED"
                        ? "View Results"
                        : "Start Scan"}
                    </button>
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
    </div>
  );
};

export default UrgentScansList;
