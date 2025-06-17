import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Loader2 } from "lucide-react";

export default function PrescriptionDetails({
  prescription: selectedPrescription,
  onClose,
  onConfirmDelivery,
  loadingStates = { prescriptions: false, delivery: false },
}) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Prescription Details</CardTitle>
      </CardHeader>
      <CardContent id="prescription-details">
        {loadingStates?.prescriptions ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : selectedPrescription ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-medium text-gray-500">Patient</p>
                <p className="text-lg">
                  {selectedPrescription.patient?.name || "Unknown"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Healthcare Provider</p>
                <p className="text-lg">
                  {selectedPrescription.healthcareProviderName || "Unknown"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Drug Name</p>
                <p className="text-lg">{selectedPrescription.drugName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Dosage</p>
                <p className="text-lg">{selectedPrescription.dosage}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Frequency</p>
                <p className="text-lg">{selectedPrescription.frequency}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Duration</p>
                <p className="text-lg">{selectedPrescription.duration}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Status</p>
                <Badge
                  variant={
                    selectedPrescription.deliveryStatus === "DELIVERED"
                      ? "success"
                      : "warning"
                  }
                >
                  {selectedPrescription.deliveryStatus}
                </Badge>
              </div>
              {selectedPrescription.deliveredAt && (
                <div>
                  <p className="font-medium text-gray-500">Delivered At</p>
                  <p className="text-lg">
                    {new Date(
                      selectedPrescription.deliveredAt
                    ).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedPrescription.deliveredBy && (
                <div>
                  <p className="font-medium text-gray-500">Delivered By</p>
                  <p className="text-lg">{selectedPrescription.deliveredBy}</p>
                </div>
              )}
            </div>
            {selectedPrescription.instructions && (
              <div>
                <p className="font-medium text-gray-500">Instructions</p>
                <p className="text-lg mt-1">
                  {selectedPrescription.instructions}
                </p>
              </div>
            )}
            {selectedPrescription.deliveryStatus === "PENDING" && (
              <div className="mt-4">
                <Button
                  onClick={() => onConfirmDelivery(selectedPrescription.id)}
                  disabled={loadingStates.delivery}
                  className="w-full"
                >
                  {loadingStates.delivery ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm Delivery"
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Select a prescription to view details
          </p>
        )}
      </CardContent>
    </Card>
  );
}
