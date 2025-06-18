import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { Eye } from "lucide-react";

const CompletedTestsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [testDetails, setTestDetails] = useState(null);

  // Update ref when toast changes
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    const fetchCompletedPatients = async () => {
      try {
        const response = await labTechnicianService.getAllTestRequests();
        if (response.success) {
          // Filter only completed tests
          const completedTests = response.data.filter(
            (test) => test.status === "COMPLETED"
          );
          setPatients(completedTests);
        } else {
          throw new Error(
            response.error?.message || "Failed to fetch completed tests"
          );
        }
      } catch (err) {
        setError(err.message || "Failed to load completed tests");
        toastRef.current({
          title: "Error",
          description: "Failed to load completed tests",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedPatients();
  }, []); // Empty dependency array

  const handleViewDetails = async (test) => {
    setTestDetails(test);
    setIsDetailsModalOpen(true);
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
          No Completed Tests
        </h2>
        <p className="text-gray-500 mb-4">
          There are currently no completed tests. Check back later or refresh
          the page.
        </p>
        <Button onClick={() => navigate("/lab/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => navigate("/lab/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-8">Completed Tests</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Patient
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Doctor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Test Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Notes
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Completed At
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.patient?.person?.firstName}{" "}
                  {test.patient?.person?.middleName}{" "}
                  {test.patient?.person?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Dr. {test.doctor?.person?.firstName}{" "}
                  {test.doctor?.person?.middleName}{" "}
                  {test.doctor?.person?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.testType?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.notes || "No notes"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(test.results[0]?.completedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
              View complete details of the completed test
            </DialogDescription>
          </DialogHeader>
          {testDetails && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Status
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {testDetails.status === "REQUESTED"
                      ? "PENDING"
                      : testDetails.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Patient
                  </h3>
                  <p className="text-sm">
                    {testDetails.patient?.person?.firstName}{" "}
                    {testDetails.patient?.person?.middleName}{" "}
                    {testDetails.patient?.person?.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Doctor
                  </h3>
                  <p className="text-sm">
                    Dr. {testDetails.doctor?.person?.firstName}{" "}
                    {testDetails.doctor?.person?.middleName}{" "}
                    {testDetails.doctor?.person?.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Test Type
                  </h3>
                  <p className="text-sm">{testDetails.testType?.name}</p>
                  <p className="text-xs text-gray-500">
                    Code: {testDetails.testType?.code}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Completed At
                  </h3>
                  <p className="text-sm">
                    {new Date(
                      testDetails.results[0]?.completedAt
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Specimens
                  </h3>
                  <p className="text-sm">
                    {testDetails.testType?.specimens?.join(", ")}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Duration
                  </h3>
                  <p className="text-sm">
                    {testDetails.testType?.duration} hours
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    Lab Technician
                  </h3>
                  <p className="text-sm">
                    {testDetails.results[0]?.technician?.person?.firstName
                      ? `${
                          testDetails.results[0].technician.person.firstName
                        } ${
                          testDetails.results[0].technician.person.middleName ||
                          ""
                        } ${
                          testDetails.results[0].technician.person.lastName ||
                          ""
                        }`.trim()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2">
                  Notes
                </h3>
                <p className="text-sm bg-gray-50 p-3 rounded-md">
                  {testDetails.notes || "No notes provided"}
                </p>
              </div>
              {testDetails.results[0]?.values && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">
                    Test Results
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(testDetails.results[0].values, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
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
    </>
  );
};

export default CompletedTestsList;
