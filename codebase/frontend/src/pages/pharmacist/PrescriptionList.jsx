// src/components/pharmacist/PrescriptionList.js
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card"; // Import Card components
import { Input } from "../../components/ui/input"; // Import Input component
import { Badge } from "../../components/ui/badge"; // Import Badge component
import { Button } from "../../components/ui/button"; // Import Button component
import { Loader2 } from "lucide-react"; // Import loading icon
import { useState } from "react"; // Import useState hook

export default function PrescriptionList({
  prescriptions = [], // Default empty array for prescriptions
  onViewPrescription, // Callback to view prescription details
  onConfirmDelivery, // Callback to confirm delivery
  loading = false, // Loading state
}) {
  const [searchQuery, setSearchQuery] = useState(""); // State for search input

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    // Filter prescriptions based on search
    const searchLower = searchQuery.toLowerCase();
    return (
      prescription.id.toString().includes(searchLower) ||
      (prescription.patient?.name || "").toLowerCase().includes(searchLower) ||
      (prescription.prescribedBy?.firstName || "")
        .toLowerCase()
        .includes(searchLower) ||
      (prescription.prescribedBy?.lastName || "")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  return (
    <Card className="md:col-span-1">
      {" "}
      {/* Card container for the list */}
      <CardHeader>
        {" "}
        {/* Card header */}
        <CardTitle>Prescription List</CardTitle> {/* Title of the list */}
        <div className="mt-2">
          {" "}
          {/* Container for search input */}
          <Input
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />{" "}
          {/* Search input field */}
        </div>
      </CardHeader>
      <CardContent>
        {" "}
        {/* Card content */}
        {loading ? (
          <div className="flex items-center justify-center p-4">
            {" "}
            {/* Loading state */}
            <Loader2 className="h-6 w-6 animate-spin" /> {/* Loading spinner */}
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <p className="text-center text-gray-500">No prescriptions found</p>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="p-3 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onViewPrescription(prescription)} // Trigger view on click
              style={{
                color: COLORS[prescription.deliveryStatus] || COLORS.default,
              }} // Apply color based on status
            >
              <p className="font-medium">
                Patient name: {prescription.patient?.name || "Unknown"}
              </p>{" "}
              {/* Prescription ID and patient name */}
              <p className="text-sm text-gray-500">
                Prescribed by: {prescription.prescribedBy?.firstName}{" "}
                {prescription.prescribedBy?.lastName}
              </p>{" "}
              {/* Prescribed by name */}
              <div className="flex justify-between items-center mt-2">
                {" "}
                {/* Status and action buttons */}
                <Badge
                  variant={
                    prescription.deliveryStatus === "DELIVERED"
                      ? "success"
                      : "warning"
                  }
                >
                  {prescription.deliveryStatus}
                </Badge>{" "}
                {/* Status badge */}
                {prescription.deliveryStatus === "PENDING" && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering onViewPrescription
                      onConfirmDelivery(prescription.id);
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      "Confirm Delivery"
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// Import COLORS from PharmacistPage (assumed to be passed via props or context)
const COLORS = {
  PENDING: "#eab308", // Yellow for pending
  DELIVERED: "#22c55e", // Green for delivered
  default: "#ef4444", // Red for other statuses
};
