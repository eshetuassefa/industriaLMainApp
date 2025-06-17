// src/components/pharmacist/Dispensing.js
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2 } from "lucide-react";

export default function Dispensing({
  prescriptions = [],
  onConfirmDelivery,
  loading = false,
}) {
  const pendingPrescriptions = prescriptions.filter(
    (p) => p.deliveryStatus === "PENDING"
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Medication Dispensing</h2>
      <Card>
        <CardHeader>
          <CardTitle>Pending Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : pendingPrescriptions.length === 0 ? (
            <p className="text-center text-gray-500">
              No pending prescriptions
            </p>
          ) : (
            pendingPrescriptions.map((prescription) => (
              <div key={prescription.id} className="p-3 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      #{prescription.id} -{" "}
                      {prescription.patient?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {prescription.drugName} - {prescription.dosage}
                    </p>
                  </div>
                  <Button
                    onClick={() => onConfirmDelivery(prescription.id)}
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
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
