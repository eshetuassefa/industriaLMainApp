import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import labTechnicianService from "../../services/labTechnician.service";
import { useToast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Eye, Play, FileText } from "lucide-react";

const PendingTestsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [testResult, setTestResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testDetails, setTestDetails] = useState(null);

  useEffect(() => {
    const fetchPendingPatients = async () => {
      try {
        const response = await labTechnicianService.getAllTestRequests();
        if (response.success) {
          // Filter only pending tests
          const pendingTests = response.data.filter(test => test.status === "PENDING");
          setPatients(pendingTests);
        } else {
          throw new Error(response.error?.message || "Failed to fetch pending tests");
        }
      } catch (err) {
        setError(err.message || "Failed to load pending tests");
        toast({
          title: "Error",
          description: "Failed to load pending tests",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPatients();
  }, [toast]);

  const handleViewDetails = async (test) => {
    setSelectedTest(test);
    setIsDetailsModalOpen(true);
    setTestDetails(test);
  };

  const handleSubmitResult = async () => {
    if (!selectedTest || !testResult.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await labTechnicianService.submitReport(selectedTest.id, {
        values: testResult,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Test result submitted successfully",
        });
        setIsSubmitModalOpen(false);
        setTestResult("");
        setSelectedTest(null);
        // Refresh the list
        const updatedResponse = await labTechnicianService.getAllTestRequests();
        if (updatedResponse.success) {
          const pendingTests = updatedResponse.data.filter(test => test.status === "PENDING");
          setPatients(pendingTests);
        }
      } else {
        throw new Error(response.error?.message || "Failed to submit test result");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit test result",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartTest = async (testId) => {
    try {
      const response = await labTechnicianService.startRequest(testId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Test started successfully",
        });
        // Refresh the list
        const updatedResponse = await labTechnicianService.getAllTestRequests();
        if (updatedResponse.success) {
          const pendingTests = updatedResponse.data.filter(test => test.status === "PENDING");
          setPatients(pendingTests);
        }
      } else {
        throw new Error(response.error?.message || "Failed to start test");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to start test",
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

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 py-4">{error}</div>
      </div>
    );
  }

  // Empty state
  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-300 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Pending Tests</h2>
        <p className="text-gray-500 mb-4">There are currently no pending tests. Check back later or refresh the page.</p>
        <Button onClick={() => navigate('/lab/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => navigate('/lab/dashboard')}>Back to Dashboard</Button>
      </div>
      <h1 className="text-3xl font-bold mb-8">Pending Tests</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested At</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.patient?.person?.firstName} {test.patient?.person?.middleName} {test.patient?.person?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Dr. {test.doctor?.person?.firstName} {test.doctor?.person?.middleName} {test.doctor?.person?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.testType?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.notes || "No notes"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(test.requestedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => handleStartTest(test.id)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-900"
                    onClick={() => {
                      setSelectedTest(test);
                      setIsSubmitModalOpen(true);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Submit Result
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={() => handleViewDetails(test)}
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

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Test Request Details</DialogTitle>
            <DialogDescription>
              View complete details of the test request
            </DialogDescription>
          </DialogHeader>
          {testDetails && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Status</h3>
                  <Badge
                    variant="secondary"
                    className={
                      testDetails.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : testDetails.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {testDetails.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Patient</h3>
                  <p className="text-sm">
                    {testDetails.patient?.person?.firstName} {testDetails.patient?.person?.middleName} {testDetails.patient?.person?.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Doctor</h3>
                  <p className="text-sm">
                    Dr. {testDetails.doctor?.person?.firstName} {testDetails.doctor?.person?.middleName} {testDetails.doctor?.person?.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Test Type</h3>
                  <p className="text-sm">{testDetails.testType?.name}</p>
                  <p className="text-xs text-gray-500">Code: {testDetails.testType?.code}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Requested At</h3>
                  <p className="text-sm">{new Date(testDetails.requestedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Specimens</h3>
                  <p className="text-sm">{testDetails.testType?.specimens?.join(", ")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Duration</h3>
                  <p className="text-sm">{testDetails.testType?.duration} hours</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2">Notes</h3>
                <p className="text-sm bg-gray-50 p-3 rounded-md">{testDetails.notes || "No notes provided"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailsModalOpen(false);
                setTestDetails(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Result Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Submit Test Result</DialogTitle>
            <DialogDescription>
              Enter the test results for {selectedTest?.patient?.person?.firstName} {selectedTest?.patient?.person?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Test Type</h3>
                  <p className="text-sm">{selectedTest.testType?.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Doctor</h3>
                  <p className="text-sm">
                    Dr. {selectedTest.doctor?.person?.firstName} {selectedTest.doctor?.person?.lastName}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Results (JSON)
                </label>
                <Textarea
                  placeholder='Enter test results in JSON format, e.g. {"hemoglobin": 14.5, "glucose": 90}'
                  value={testResult}
                  onChange={(e) => setTestResult(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitModalOpen(false);
                setTestResult("");
                setSelectedTest(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResult}
              disabled={isSubmitting || !testResult.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingTestsList; 