// src/components/pharmacist/NewPrescriptionDialog.js
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

export default function NewPrescriptionDialog({
  open,
  onOpenChange,
  newPrescription,
  setNewPrescription,
  medicationToAdd,
  setMedicationToAdd,
  patients,
  drugs,
  handleAddMedicationToPrescription,
  handleRemoveMedicationFromPrescription,
  handleNewPrescriptionSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Prescription</DialogTitle>
          <DialogDescription>
            Create a new prescription for a patient.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Patient</Label>
            <Select
              value={newPrescription.patientId}
              onValueChange={(value) =>
                setNewPrescription({ ...newPrescription, patientId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={newPrescription.notes}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  notes: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Add Medication</Label>
            <div className="grid gap-2">
              <Select
                value={medicationToAdd.name}
                onValueChange={(value) =>
                  setMedicationToAdd({ ...medicationToAdd, name: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select drug" />
                </SelectTrigger>
                <SelectContent>
                  {drugs.map((drug) => (
                    <SelectItem key={drug.id} value={drug.name}>
                      {drug.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Dosage"
                value={medicationToAdd.dosage}
                onChange={(e) =>
                  setMedicationToAdd({
                    ...medicationToAdd,
                    dosage: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Frequency"
                value={medicationToAdd.frequency}
                onChange={(e) =>
                  setMedicationToAdd({
                    ...medicationToAdd,
                    frequency: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Duration"
                value={medicationToAdd.duration}
                onChange={(e) =>
                  setMedicationToAdd({
                    ...medicationToAdd,
                    duration: e.target.value,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={medicationToAdd.quantity}
                onChange={(e) =>
                  setMedicationToAdd({
                    ...medicationToAdd,
                    quantity: Number(e.target.value),
                  })
                }
              />
              <Textarea
                placeholder="Instructions"
                value={medicationToAdd.instructions}
                onChange={(e) =>
                  setMedicationToAdd({
                    ...medicationToAdd,
                    instructions: e.target.value,
                  })
                }
              />
              <Button onClick={handleAddMedicationToPrescription}>
                Add Medication
              </Button>
            </div>
          </div>
          {newPrescription.drugs.map((drug, index) => (
            <div key={index} className="border p-2 rounded">
              <p>
                {drug.name} - {drug.dosage}
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveMedicationFromPrescription(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleNewPrescriptionSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
