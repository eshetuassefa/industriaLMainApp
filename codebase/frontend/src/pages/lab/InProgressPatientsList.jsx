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
import { Eye, FileText } from "lucide-react";

const InProgressTestsList = () => {
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
  const [resultRows, setResultRows] = useState([
    { parameter: '', value: '', unit: '', flag: '', referenceRange: '', remark: '' },
  ]);

  useEffect(() => {
    const fetchInProgressPatients = async () => {
      try {
        const response = await labTechnicianService.getAllTestRequests();
        if (response.success) {
          // Filter only in-progress tests
          const inProgressTests = response.data.filter(test => test.status === "IN_PROGRESS");
          setPatients(inProgressTests);
        } else {
          throw new Error(response.error?.message || "Failed to fetch in-progress tests");
        }
      } catch (err) {
        setError(err.message || "Failed to load in-progress tests");
        toast({
          title: "Error",
          description: "Failed to load in-progress tests",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInProgressPatients();
  }, [toast]);

  // Helper to reset resultRows when opening modal for a new test
  useEffect(() => {
    if (isSubmitModalOpen && selectedTest) {
      setResultRows([
        { parameter: '', value: '', unit: '', flag: '', referenceRange: '', remark: '' },
      ]);
    }
  }, [isSubmitModalOpen, selectedTest]);

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
      { parameter: '', value: '', unit: '', flag: '', referenceRange: '', remark: '' },
    ]);
  };

  const handleRemoveParameter = (idx) => {
    setResultRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleViewDetails = async (test) => {
    setSelectedTest(test);
    setIsDetailsModalOpen(true);
    setTestDetails(test);
  };

  const handleSubmitResult = async () => {
    if (!selectedTest) return;
    setIsSubmitting(true);
    try {
      const values = {};
      resultRows.forEach(row => {
        if (row.parameter) values[row.parameter] = row.value;
      });
      const response = await labTechnicianService.submitReport(selectedTest.id, {
        values,
      });
      if (response.success) {
        toast({
          title: "Success",
          description: "Test result submitted successfully",
        });
        setIsSubmitModalOpen(false);
        setResultRows([{ parameter: '', value: '', unit: '', flag: '', referenceRange: '', remark: '' }]);
        setSelectedTest(null);
        // Refresh the list
        const updatedResponse = await labTechnicianService.getAllTestRequests();
        if (updatedResponse.success) {
          const inProgressTests = updatedResponse.data.filter(test => test.status === "IN_PROGRESS");
          setPatients(inProgressTests);
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
        <div className="flex justify-end w-full mb-4 pr-8">
          <Button onClick={() => navigate('/lab/dashboard')}>Back to Dashboard</Button>
        </div>
        <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-300 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No In Progress Tests</h2>
        <p className="text-gray-500">There are currently no tests in progress. Check back later or refresh the page.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => navigate('/lab/dashboard')}>Back to Dashboard</Button>
      </div>
      <h1 className="text-3xl font-bold mb-8">In Progress Tests</h1>

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
                    className="bg-blue-100 text-blue-800"
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
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Enter Lab Results for Test: {selectedTest?.testType?.name}</DialogTitle>
          </DialogHeader>
          {selectedTest && (
            <div className="py-4 space-y-6">
              {/* Patient Info */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Patient Information</h2>
                <p><strong>Name:</strong> {selectedTest.patient?.person?.firstName} {selectedTest.patient?.person?.middleName} {selectedTest.patient?.person?.lastName}</p>
                <p><strong>Patient ID:</strong> {selectedTest.patient?.id}</p>
                <p><strong>Requested By:</strong> Dr. {selectedTest.doctor?.person?.firstName} {selectedTest.doctor?.person?.middleName} {selectedTest.doctor?.person?.lastName}</p>
                <p><strong>Urgency:</strong> {selectedTest.urgency || 'Routine'}</p>
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
                              onChange={e => handleResultRowChange(idx, 'parameter', e.target.value)}
                              placeholder="Test Name"
                              required
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row.value}
                              onChange={e => handleResultRowChange(idx, 'value', e.target.value)}
                              placeholder="Result"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row.unit}
                              onChange={e => handleResultRowChange(idx, 'unit', e.target.value)}
                              placeholder="Unit"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row.flag}
                              onChange={e => handleResultRowChange(idx, 'flag', e.target.value)}
                              placeholder="Flag"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row.referenceRange}
                              onChange={e => handleResultRowChange(idx, 'referenceRange', e.target.value)}
                              placeholder="Reference Range"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              value={row.remark}
                              onChange={e => handleResultRowChange(idx, 'remark', e.target.value)}
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
                setIsSubmitModalOpen(false);
                setResultRows([{ parameter: '', value: '', unit: '', flag: '', referenceRange: '', remark: '' }]);
                setSelectedTest(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResult}
              disabled={isSubmitting || resultRows.length === 0 || resultRows.some(row => !row.parameter)}
            >
              {isSubmitting ? "Submitting..." : "Submit Result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InProgressTestsList; 