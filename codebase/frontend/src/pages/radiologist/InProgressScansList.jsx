import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Eye, Play, Clock, FileText } from "lucide-react";
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

const InProgressScansList = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportText, setReportText] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        throw new Error(response.error?.message || "Failed to fetch in-progress scans");
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

  const handleContinueScan = async (requestId) => {
    try {
      const result = await radiologyService.continueRequest(requestId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Continuing scan...",
        });
        navigate(`/radiology/result/${requestId}`);
      } else {
        throw new Error(result.error?.message || "Failed to continue scan");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to continue scan",
        variant: "destructive",
      });
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmitReport = async (requestId) => {
    setSelectedReport(requests.find((r) => r.id === requestId));
    setIsReportModalOpen(true);
  };

  const handleSubmitReportConfirm = async () => {
    if (!selectedReport) return;
    
    setIsSubmitting(true);
    try {
      const result = await radiologyService.submitReport(
        selectedReport.id,
        { reportText },
        images
      );
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Report submitted successfully",
        });
        setIsReportModalOpen(false);
        setReportText("");
        setImages([]);
        setImagePreviews([]);
        setSelectedReport(null);
        fetchRequests();
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

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">In Progress Scans</h1>
        <Button
          onClick={() => navigate("/radiology/dashboard")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <FileText className="w-16 h-16 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">No In-Progress Scans</h3>
            <p className="text-sm text-gray-500">
              There are currently no scans in progress.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imaging Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Body Part
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {req.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {req.imagingType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {req.bodyPart}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {req.startedDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleContinueScan(req.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Continue Scan
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-900"
                        onClick={() => handleSubmitReport(req.id)}
                      >
                        Submit Report
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
      )}

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              View the complete details of this in-progress radiology request
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
                    className="bg-blue-100 text-blue-800"
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
                  <h3 className="font-semibold text-sm text-gray-500">Started Date</h3>
                  <p className="text-sm">{new Date(selectedReport.updatedAt).toLocaleDateString()}</p>
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

      {/* Report Submission Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Submit Report</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Text
              </label>
              <Textarea
                placeholder="Enter your report details..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Images
              </label>
              <input
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReportModalOpen(false);
                setReportText("");
                setImages([]);
                setImagePreviews([]);
                setSelectedReport(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReportConfirm}
              disabled={isSubmitting || !reportText.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InProgressScansList;
