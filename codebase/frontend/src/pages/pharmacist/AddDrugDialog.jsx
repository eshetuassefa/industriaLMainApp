// src/components/pharmacist/AddDrugDialog.js
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
import { Button } from "../../components/ui/button";

export default function AddDrugDialog({
  open,
  onOpenChange,
  newDrug,
  setNewDrug,
  handleNewDrugSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Drug</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new drug to the inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Name</Label>
            <Input
              value={newDrug.name}
              onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Generic Name</Label>
            <Input
              value={newDrug.genericName}
              onChange={(e) =>
                setNewDrug({ ...newDrug, genericName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Dosage Form</Label>
            <Select
              value={newDrug.dosageForm}
              onValueChange={(value) =>
                setNewDrug({ ...newDrug, dosageForm: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "TABLET",
                  "CAPSULE",
                  "LIQUID",
                  "INJECTION",
                  "TOPICAL",
                  "SUPPOSITORY",
                  "POWDER",
                  "OTHER",
                ].map((form) => (
                  <SelectItem key={form} value={form}>
                    {form}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Strength</Label>
            <Input
              value={newDrug.strength}
              onChange={(e) =>
                setNewDrug({ ...newDrug, strength: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Manufacturer</Label>
            <Input
              value={newDrug.manufacturer}
              onChange={(e) =>
                setNewDrug({ ...newDrug, manufacturer: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Reorder Level</Label>
            <Input
              type="number"
              value={newDrug.reorderLevel}
              onChange={(e) =>
                setNewDrug({ ...newDrug, reorderLevel: Number(e.target.value) })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleNewDrugSubmit}>Add Drug</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
