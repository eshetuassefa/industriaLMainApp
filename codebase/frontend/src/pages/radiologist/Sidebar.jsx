import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Eye, Play, FileText, Clock } from "lucide-react";
import radiologyService from "../../services/radiologist.service";
import { useToast } from "../../components/ui/use-toast";

const Sidebar = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const status = location.pathname.split("/").pop();

  const fetchRequests = useCallback(async () => {
    try {
      const response = await radiologyService.getAllRadiologyRequests();
      if (response.success) {
        const filteredRequests = (response.data || [])
          .filter((req) => {
            if (status === "pending-scans") return req.status === "PENDING";
            if (status === "in-progress-scans") return req.status === "IN_PROGRESS";
            if (status === "completed-scans") return req.status === "COMPLETED";
            if (status === "urgent-scans") return req.urgency === "URGENT";
            return false;
          })
          .map((req) => ({
            ...req,
            requestedDate: new Date(req.createdAt).toLocaleDateString(),
          }));
        setRequests(filteredRequests);
      } else {
        throw new Error(response.error?.message || "Failed to fetch requests");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch requests");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch requests",
        variant: "destructive",
      });
    }
  }, [status, toast]);

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
      if (newStatus === "IN_PROGRESS") {
        result = await radiologyService.startRequest(requestId);
      } else if (newStatus === "COMPLETED") {
        if (!selectedRequest || selectedRequest.id !== requestId) {
          setSelectedRequest(requests.find((r) => r.id === requestId));
          return;
        }
        result = await radiologyService.submitReport(requestId, { reportText: "" }, []);
        setSelectedRequest(null);
      }
      if (result.success) {
        toast({
          title: "Success",
          description: `Status updated to ${newStatus}`,
        });
        fetchRequests();
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

  if (!status) {
    return (
      <div className="p-4 text-center text-gray-500">
        No status selected
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 capitalize">
        {status.replace(/-/g, ' ')} Requests
      </h1>
      {requests.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No requests found for this status
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Patient Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Doctor Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Radiologist Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Imaging Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Body Part</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {req.medicalRecord?.patient?.person?.firstName} {req.medicalRecord?.patient?.person?.lastName}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {req.medicalRecord?.doctor?.person?.firstName} {req.medicalRecord?.doctor?.person?.lastName}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {req.report?.radiologist?.person?.firstName} {req.report?.radiologist?.person?.lastName}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {req.imagingType}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {req.bodyPart}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className={`${
                        req.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : req.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                    {req.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleStatusUpdate(req.id, "IN_PROGRESS")}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {req.status === "IN_PROGRESS" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-900"
                        onClick={() => handleStatusUpdate(req.id, "COMPLETED")}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
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
      )}
      <Button
        onClick={() => navigate("/radiology/dashboard")}
        variant="outline"
        className="mt-4 flex items-center gap-2"
      >
        <Clock className="w-4 h-4" />
        Back to Dashboard
      </Button>
    </div>
  );
};

export default Sidebar;
