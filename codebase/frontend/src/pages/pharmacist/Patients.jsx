// "use client"; // Directive to indicate this is a client-side component

import { useState, useEffect } from "react"; // Import React hooks for state and effects
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card"; // Import Card components for UI
import { Badge } from "../../components/ui/badge";
import { Loader2 } from "lucide-react"; // Import Loader2 icon for loading state
import pharmacyService from "../../services/pharmacist.service"; // Import pharmacy service for API calls

export default function Patients({
  patients = [],
  onViewPatient,
  selectedPatient,
  loading,
}) {
  // Main Patients component with props
  const [latestPrescriptionDates, setLatestPrescriptionDates] = useState({}); // State for latest prescription dates per patient
  const [patientPrescriptions, setPatientPrescriptions] = useState([]); // State for selected patient's prescriptions
  const [sortedPatients, setSortedPatients] = useState([]);

  // Effect to fetch latest prescription dates for all patients
  useEffect(() => {
    const fetchPrescriptionDates = async () => {
      const dates = {};
      for (const patient of patients) {
        try {
          const presResponse = await pharmacyService.getPrescriptionsByPatient(patient.id);
          if (presResponse.success && presResponse.data?.data?.length > 0) {
            const latestPres = presResponse.data.data.reduce((latest, current) =>
              new Date(current.deliveredAt || current.createdAt) >
              new Date(latest.deliveredAt || latest.createdAt)
                ? current
                : latest
            );
            dates[patient.id] = new Date(
              latestPres.deliveredAt || latestPres.createdAt
            ).toLocaleDateString();
          } else {
            dates[patient.id] = "N/A";
          }
        } catch (err) {
          console.error("Error fetching prescriptions for patient:", patient.id, err);
          dates[patient.id] = "N/A";
        }
      }
      setLatestPrescriptionDates(dates);

      // Sort patients by their latest prescription date
      const sorted = [...patients].sort((a, b) => {
        const dateA = dates[a.id] === "N/A" ? new Date(0) : new Date(dates[a.id]);
        const dateB = dates[b.id] === "N/A" ? new Date(0) : new Date(dates[b.id]);
        return dateB - dateA; // Most recent first
      });
      setSortedPatients(sorted);
    };
    fetchPrescriptionDates();
  }, [patients]);

  // Effect to fetch prescriptions for the selected patient
  useEffect(() => {
    let isMounted = true;
    const fetchSelectedPatientPrescriptions = async () => {
      if (selectedPatient) {
        try {
          const presResponse = await pharmacyService.getPrescriptionsByPatient(
            selectedPatient.id
          );
          if (isMounted && presResponse.success && presResponse.data?.data) {
            // Sort prescriptions by date (most recent first)
            const sortedPrescriptions = presResponse.data.data.sort((a, b) => {
              const dateA = new Date(a.deliveredAt || a.createdAt);
              const dateB = new Date(b.deliveredAt || b.createdAt);
              return dateB - dateA;
            });
            setPatientPrescriptions(sortedPrescriptions);
          }
        } catch (err) {
          console.error("Error fetching prescriptions for selected patient:", err);
          if (isMounted) setPatientPrescriptions([]);
        }
      }
    };
    fetchSelectedPatientPrescriptions();
    return () => {
      isMounted = false;
    }; // Cleanup to prevent state updates on unmounted component
  }, [selectedPatient]);

  return (
    // Main return statement for the component's JSX
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Patients</h2>{" "}
      {/* Heading for the patients section */}
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <CardTitle className="text-2xl font-semibold">Patient List</CardTitle>{" "}
          {/* Title for the patient list card */}
        </CardHeader>
        <CardContent className="p-6">
          {loading ? ( // Show loading spinner if data is loading
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : sortedPatients.length === 0 ? ( // Show no patients message if list is empty
            <p className="text-center text-gray-500 py-10">No patients found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-sm font-medium text-gray-700">
                      No.
                    </th>{" "}
                    {/* Table header for number */}
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Patient Name
                    </th>{" "}
                    {/* Table header for patient name */}
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Latest Prescription Date
                    </th>{" "}
                    {/* Table header for prescription date */}
                  </tr>
                </thead>
                <tbody>
                  {sortedPatients.map((patient, index) => {
                    // Map through sorted patients
                    const prescriptionDate =
                      latestPrescriptionDates[patient.id] || "N/A";

                    return (
                      <tr
                        key={patient.id}
                        className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => onViewPatient(patient.id)} // Trigger onViewPatient when clicked
                      >
                        <td className="p-3 text-gray-600">{index + 1}</td>{" "}
                        {/* Display patient number */}
                        <td className="p-3 text-gray-800 font-medium">
                          {patient.name}
                        </td>{" "}
                        {/* Display patient name */}
                        <td className="p-3 text-gray-600">
                          {prescriptionDate}
                        </td>{" "}
                        {/* Display latest prescription date */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* Patient Details (shown when selected) */}
          {selectedPatient && ( // Show details if a patient is selected
            <div className="mt-6 p-4 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedPatient.name}'s Details
              </h3>{" "}
              {/* Heading for patient details */}
              <p className="text-gray-600">
                <strong>ID:</strong> {selectedPatient.id}
              </p>{" "}
              {/* Display patient ID */}
              <p className="text-gray-600">
                <strong>Added Date:</strong>{" "}
                {new Date(
                  selectedPatient.addedDate ||
                    selectedPatient.createdAt ||
                    "1970-01-01"
                ).toLocaleDateString()}
              </p>{" "}
              {/* Display patient added date */}
              <p className="text-gray-600">
                <strong>Email:</strong> {selectedPatient.email || "N/A"}
              </p>{" "}
              {/* Display patient email */}
              <p className="text-gray-600">
                <strong>Phone:</strong> {selectedPatient.phone || "N/A"}
              </p>{" "}
              {/* Display patient phone */}
              <p className="text-gray-600">
                <strong>Address:</strong> {selectedPatient.address || "N/A"}
              </p>{" "}
              {/* Display patient address */}
              <p className="text-gray-600">
                <strong>Prescriptions:</strong> {patientPrescriptions.length}
              </p>{" "}
              {/* Display number of prescriptions */}
              {patientPrescriptions.length > 0 && ( // Show all prescriptions if available
                <div className="mt-2">
                  <strong className="text-gray-700">
                    Prescription History:
                  </strong>
                  <ul className="list-disc pl-5 mt-1">
                    {patientPrescriptions
                      .sort(
                        (a, b) =>
                          new Date(b.deliveredAt || b.createdAt) -
                          new Date(a.deliveredAt || a.createdAt)
                      )
                      .map((p) => (
                        <li key={p.id} className="text-gray-600">
                          {p.drugName} -{" "}
                          {new Date(p.deliveredAt || p.createdAt).toLocaleDateString()} -{" "}
                          {p.dosage || "N/A"}
                        </li> // Display each prescription with drug name, date, and dosage
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
