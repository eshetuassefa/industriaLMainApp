import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Clock, Eye, Play } from "lucide-react";
import radiologyService from "../../services/radiologist.service";
import { useToast } from "../../components/ui/use-toast";

const PendingScansList = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
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
    try {
      const response = await radiologyService.startRequest(scanId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Scan started successfully",
        });
        navigate(`/radiology/result/${scanId}`); // Match dashboard navigation
      } else {
        throw new Error(response.error?.message || "Failed to start scan");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to start scan",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (scanId) => {
    navigate(`/radiology/result/${scanId}`); // Match dashboard navigation
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
                  Patient
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
                    {req.patient?.firstName} {req.patient?.lastName}
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
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleStartScan(req.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
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
    </div>
  );
};

export default PendingScansList;
