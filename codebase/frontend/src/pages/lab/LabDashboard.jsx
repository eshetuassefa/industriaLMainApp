import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import labTechnicianService from "../../services/labTechnician.service";
import { useToast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Eye, Play, FileText, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";

const LabDashboard = () => {
  const [activeTab, setActiveTab] = useState("pendingInProgress");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    pendingTests: 0,
    inProgress: 0,
    completedToday: 0,
    urgentTests: 0,
    testTypes: {},
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reportValues, setReportValues] = useState(""); // Changed from reportText to values
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const [allRequests, setAllRequests] = useState([]); // Add this state for storing all requests
  const [resultRows, setResultRows] = useState([
    {
      parameter: "",
      value: "",
      unit: "",
      flag: "",
      referenceRange: "",
      remark: "",
    },
  ]);

  // Update ref when toast changes
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // Helper to reset resultRows when opening modal for a new test
  useEffect(() => {
    if (isCompleteModalOpen && selectedRequest) {
      setResultRows([
        {
          parameter: "",
          value: "",
          unit: "",
          flag: "",
          referenceRange: "",
          remark: "",
        },
      ]);
    }
  }, [isCompleteModalOpen, selectedRequest]);

  const handleResultRowChange = (idx, field, value) => {
    setResultRows((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleAddParameter = () => {
    setResultRows((prev) => [
      ...prev,
      {
        parameter: "",
        value: "",
        unit: "",
        flag: "",
        referenceRange: "",
        remark: "",
      },
    ]);
  };

  const handleRemoveParameter = (idx) => {
    setResultRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const fetchAllTestRequests = useCallback(async () => {
    try {
      const response = await labTechnicianService.getAllTestRequests();
      if (response.success) {
        const fetchedRequests = response.data || [];

        // Calculate statistics
        const stats = {
          pendingTests: fetchedRequests.filter((r) => r.status === "REQUESTED")
            .length,
          inProgress: fetchedRequests.filter((r) => r.status === "IN_PROGRESS")
            .length,
          completedToday: fetchedRequests.filter(
            (r) => r.status === "COMPLETED"
          ).length,
          urgentTests: fetchedRequests.filter((r) => r.urgency === "URGENT")
            .length,
          testTypes: fetchedRequests.reduce((acc, r) => {
            acc[r.testType?.name || "Unknown"] =
              (acc[r.testType?.name || "Unknown"] || 0) + 1;
            return acc;
          }, {}),
        };

        // Store all requests
        setAllRequests(fetchedRequests);

        // Filter requests based on active tab
        let filteredRequests = fetchedRequests;
        if (activeTab === "pendingInProgress") {
          filteredRequests = fetchedRequests.filter(
            (r) => r.status === "REQUESTED" || r.status === "IN_PROGRESS"
          );
        } else if (activeTab === "recentlyCompleted") {
          filteredRequests = fetchedRequests.filter(
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
      setError("Failed to fetch test requests");
      toastRef.current({
        title: "Error",
        description: "Failed to load test requests",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [activeTab]); // Removed toast dependency

  useEffect(() => {
    fetchAllTestRequests();
  }, [fetchAllTestRequests]);

  const handleCardClick = useCallback(
    (status) => {
      switch (status) {
        case "pending-tests":
          navigate("/lab/pending-tests");
          break;
        case "in-progress-tests":
          navigate("/lab/in-progress-tests");
          break;
        case "completed-tests":
          navigate("/lab/completed-tests");
          break;
        case "urgent-tests":
          navigate("/lab/urgent-tests");
          break;
        default:
          navigate("/lab/dashboard");
      }
    },
    [navigate]
  );

  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      if (tab === "pendingInProgress") {
        setRequests(
          allRequests.filter(
            (r) => r.status === "REQUESTED" || r.status === "IN_PROGRESS"
          )
        );
      } else if (tab === "recentlyCompleted") {
        setRequests(allRequests.filter((r) => r.status === "COMPLETED"));
      }
    },
    [allRequests]
  );

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      let result;
      if (newStatus === "IN_PROGRESS") {
        result = await labTechnicianService.startRequest(requestId);
      } else if (newStatus === "COMPLETED") {
        // Convert resultRows to values object
        const values = {};
        resultRows.forEach((row) => {
          if (row.parameter) values[row.parameter] = row.value;
        });

        result = await labTechnicianService.submitReport(requestId, {
          values,
        });
        setResultRows([
          {
            parameter: "",
            value: "",
            unit: "",
            flag: "",
            referenceRange: "",
            remark: "",
          },
        ]);
        setSelectedRequest(null);
      }
      if (result.success) {
        toastRef.current({
          title: "Success",
          description: `Status updated to ${newStatus}`,
        });
        fetchAllTestRequests();
      } else {
        throw new Error(result.error.message);
      }
    } catch (err) {
      toastRef.current({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (requestId) => {
    try {
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        setSelectedReport(request);
        setIsDetailsModalOpen(true);
      } else {
        throw new Error("Request not found");
      }
    } catch (err) {
      toastRef.current({
        title: "Error",
        description: err.message || "Failed to load request details",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (selectedRequest) {
      setIsSubmitting(true);
      await handleStatusUpdate(selectedRequest.id, "COMPLETED");
      setIsCompleteModalOpen(false);
      setIsSubmitting(false);
    }
  };

  const handleStartTest = async (requestId) => {
    try {
      const result = await labTechnicianService.startRequest(requestId);
      if (result.success) {
        toastRef.current({
          title: "Success",
          description: "Test started successfully",
        });
        fetchAllTestRequests();
      } else {
        throw new Error(result.error?.message || "Failed to start test");
      }
    } catch (err) {
      toastRef.current({
        title: "Error",
        description: err.message || "Failed to start test",
        variant: "destructive",
      });
    }
  };

  const handleCompleteClick = async (requestId) => {
    try {
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        setSelectedRequest(request);
        setIsCompleteModalOpen(true);
      } else {
        throw new Error("Request not found");
      }
    } catch (err) {
      toastRef.current({
        title: "Error",
        description: err.message || "Failed to load request details",
        variant: "destructive",
      });
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
      <h1 className="text-3xl font-bold mb-8">Laboratory Dashboard</h1>

      {error && <div className="text-red-500 py-4">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick("pending-tests")}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Pending Tests</h3>
            <ClockIcon className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">{statistics.pendingTests}</p>
        </div>
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick("in-progress-tests")}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">In Progress</h3>
            <DocumentTextIcon className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{statistics.inProgress}</p>
        </div>
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick("completed-tests")}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Completed Today</h3>
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{statistics.completedToday}</p>
        </div>
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick("urgent-tests")}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Urgent Tests</h3>
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold">{statistics.urgentTests}</p>
        </div>
      </div>

      {/* Test Types Distribution */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Types Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statistics.testTypes).map(([type, count]) => (
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

      {/* Test Requests Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            {["pendingInProgress", "recentlyCompleted"].map((tab) => (
              <button
                key={tab}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => handleTabChange(tab)}
              >
                {tab === "pendingInProgress"
                  ? "Pending & In Progress"
                  : "Recently Completed"}
              </button>
            ))}
          </nav>
        </div>

        {loading && <p className="text-gray-600">Loading requests...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Requests Table */}
        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
              <svg
                width="64"
                height="64"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-gray-300 mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No Test Requests
              </h2>
              <p className="text-gray-500 mb-4">
                There are currently no test requests. Check back later or
                refresh the page.
              </p>
              <Button onClick={() => navigate("/lab/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested At
                  </th>
                  {activeTab === "recentlyCompleted" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lab Technician
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.testType?.name || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.patient?.person?.firstName}{" "}
                        {request.patient?.person?.middleName}{" "}
                        {request.patient?.person?.lastName}
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
                        {request.status === "REQUESTED"
                          ? "PENDING"
                          : request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </td>
                    {activeTab === "recentlyCompleted" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.results &&
                        request.results[0]?.technician?.person?.firstName
                          ? `${
                              request.results[0].technician.person.firstName
                            } ${
                              request.results[0].technician.person.middleName ||
                              ""
                            } ${
                              request.results[0].technician.person.lastName ||
                              ""
                            }`.trim()
                          : request.results && request.results[0]?.technicianId
                          ? request.results[0].technicianId
                          : "N/A"}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === "REQUESTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleStartTest(request.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {request.status === "IN_PROGRESS" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-900 mr-3"
                          onClick={() => handleCompleteClick(request.id)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handleViewDetails(request.id)}
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
      </div>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Test Request Details</DialogTitle>
            <DialogDescription>
              View the complete details of this test request
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Request ID
                  </h3>
                  <p className="text-sm">{selectedReport.id}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Status
                  </h3>
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
                    {selectedReport.status === "REQUESTED"
                      ? "PENDING"
                      : selectedReport.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Test Type
                  </h3>
                  <p className="text-sm">
                    {selectedReport.testType?.name || "Unknown"}
                  </p>
                  {selectedReport.testType?.code && (
                    <p className="text-xs text-gray-500">
                      Code: {selectedReport.testType.code}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Patient
                  </h3>
                  <p className="text-sm">
                    {selectedReport.patient?.person?.firstName}{" "}
                    {selectedReport.patient?.person?.middleName}{" "}
                    {selectedReport.patient?.person?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {selectedReport.patient?.id}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Requested By
                  </h3>
                  <p className="text-sm">
                    Dr. {selectedReport.doctor?.person?.firstName}{" "}
                    {selectedReport.doctor?.person?.middleName}{" "}
                    {selectedReport.doctor?.person?.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Requested Date
                  </h3>
                  <p className="text-sm">
                    {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Urgency
                  </h3>
                  <Badge
                    variant="secondary"
                    className={
                      selectedReport.urgency === "URGENT"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {selectedReport.urgency || "Routine"}
                  </Badge>
                </div>
                {selectedReport.testType?.specimens && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">
                      Specimens
                    </h3>
                    <p className="text-sm">
                      {selectedReport.testType.specimens.join(", ")}
                    </p>
                  </div>
                )}
                {selectedReport.testType?.duration && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">
                      Duration
                    </h3>
                    <p className="text-sm">
                      {selectedReport.testType.duration} hours
                    </p>
                  </div>
                )}
              </div>

              {selectedReport.notes && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">
                    Notes
                  </h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">
                    {selectedReport.notes}
                  </p>
                </div>
              )}

              {/* Show results if completed */}
              {selectedReport.status === "COMPLETED" &&
                selectedReport.results &&
                selectedReport.results[0] && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500 mb-2">
                      Test Results
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="mb-2">
                        <strong>Completed by:</strong>{" "}
                        {
                          selectedReport.results[0].technician?.person
                            ?.firstName
                        }{" "}
                        {
                          selectedReport.results[0].technician?.person
                            ?.middleName
                        }{" "}
                        {selectedReport.results[0].technician?.person?.lastName}
                      </div>
                      <div className="mb-2">
                        <strong>Completed at:</strong>{" "}
                        {new Date(
                          selectedReport.results[0].completedAt
                        ).toLocaleDateString()}
                      </div>
                      {selectedReport.results[0].values && (
                        <div>
                          <strong>Values:</strong>
                          <pre className="text-sm whitespace-pre-wrap mt-1">
                            {JSON.stringify(
                              selectedReport.results[0].values,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      )}
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

      {/* Complete Modal */}
      <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>
              Enter Lab Results for Test: {selectedRequest?.testType?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4 space-y-6">
              {/* Patient Info */}
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Patient Information
                </h2>
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedRequest.patient?.person?.firstName}{" "}
                  {selectedRequest.patient?.person?.middleName}{" "}
                  {selectedRequest.patient?.person?.lastName}
                </p>
                <p>
                  <strong>Patient ID:</strong> {selectedRequest.patient?.id}
                </p>
                <p>
                  <strong>Requested By:</strong> Dr.{" "}
                  {selectedRequest.doctor?.person?.firstName}{" "}
                  {selectedRequest.doctor?.person?.middleName}{" "}
                  {selectedRequest.doctor?.person?.lastName}
                </p>
                <p>
                  <strong>Urgency:</strong>{" "}
                  {selectedRequest.urgency || "Routine"}
                </p>
              </div>
              {/* Results Table */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Results</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 border">Test Name</th>
                        <th className="px-2 py-1 border">Result</th>
                        <th className="px-2 py-1 border">Unit</th>
                        <th className="px-2 py-1 border">Flag</th>
                        <th className="px-2 py-1 border">Reference Range</th>
                        <th className="px-2 py-1 border">Remark</th>
                        <th className="px-2 py-1 border"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="border px-2 py-1">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row.parameter}
                              onChange={(e) =>
                                handleResultRowChange(
                                  idx,
                                  "parameter",
                                  e.target.value
                                )
                              }
                              placeholder="Test Name"
                              required
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row.value}
                              onChange={(e) =>
                                handleResultRowChange(
                                  idx,
                                  "value",
                                  e.target.value
                                )
                              }
                              placeholder="Result"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row.unit}
                              onChange={(e) =>
                                handleResultRowChange(
                                  idx,
                                  "unit",
                                  e.target.value
                                )
                              }
                              placeholder="Unit"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row.flag}
                              onChange={(e) =>
                                handleResultRowChange(
                                  idx,
                                  "flag",
                                  e.target.value
                                )
                              }
                              placeholder="Flag"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row.referenceRange}
                              onChange={(e) =>
                                handleResultRowChange(
                                  idx,
                                  "referenceRange",
                                  e.target.value
                                )
                              }
                              placeholder="Reference Range"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row.remark}
                              onChange={(e) =>
                                handleResultRowChange(
                                  idx,
                                  "remark",
                                  e.target.value
                                )
                              }
                              placeholder="Remark"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            {resultRows.length > 1 && (
                              <button
                                type="button"
                                className="text-red-500 font-bold px-2"
                                onClick={() => handleRemoveParameter(idx)}
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={handleAddParameter}
                  className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  + Add Another Parameter
                </button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCompleteModalOpen(false);
                setResultRows([
                  {
                    parameter: "",
                    value: "",
                    unit: "",
                    flag: "",
                    referenceRange: "",
                    remark: "",
                  },
                ]);
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={
                isSubmitting ||
                resultRows.length === 0 ||
                resultRows.some((row) => !row.parameter)
              }
            >
              {isSubmitting ? "Submitting..." : "Submit Result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabDashboard;
