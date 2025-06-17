import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Eye, Play, FileText, Clock, X } from "lucide-react";
import radiologyService from "../../services/radiologist.service";
import { useToast } from "../../components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";

const Sidebar = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportText, setReportText] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
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
        if (result.success) {
          toast({
            title: "Success",
            description: "Scan started successfully",
          });
          navigate(`/radiology/result/${requestId}`);
        }
      } else if (newStatus === "COMPLETED") {
        setSelectedRequest(requests.find((r) => r.id === requestId));
        setIsReportModalOpen(true);
        return;
      }
      
      if (result?.success) {
        fetchRequests();
      } else {
        throw new Error(result?.error?.message || "Failed to update status");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      const result = await radiologyService.submitReport(
        selectedRequest.id,
        { reportText },
        []
      );
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Report submitted successfully",
        });
        setIsReportModalOpen(false);
        setReportText("");
        setSelectedRequest(null);
        navigate(`/radiology/result/${selectedRequest.id}`);
      } else {
        throw new Error(result.error?.message || "Failed to submit report");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (requestId) => {
    try {
      const response = await radiologyService.getReport(requestId);
      if (response.success) {
        setSelectedReport(response.data);
        setIsDetailsModalOpen(true);
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Imaging Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Body Part
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {req.id}
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
                        Submit Report
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

      {/* Report Submission Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Submit Report</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your report details..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReportModalOpen(false);
                setReportText("");
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={isSubmitting || !reportText.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              View the complete details of this radiology request
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Request ID</h3>
                  <p className="text-sm">{selectedReport.id}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Status</h3>
                  <Badge
                    variant="secondary"
                    className={`${
                      selectedReport.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : selectedReport.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedReport.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Imaging Type</h3>
                  <p className="text-sm">{selectedReport.imagingType}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Body Part</h3>
                  <p className="text-sm">{selectedReport.bodyPart}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Requested Date</h3>
                  <p className="text-sm">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Urgency</h3>
                  <Badge
                    variant="secondary"
                    className={selectedReport.urgency === "URGENT" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}
                  >
                    {selectedReport.urgency}
                  </Badge>
                </div>
              </div>
              {selectedReport.reportText && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">Report</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{selectedReport.reportText}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sidebar;
