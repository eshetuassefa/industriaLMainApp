// src/components/pharmacist/AddInventoryDialog.js
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

export default function AddInventoryDialog({
  open,
  onOpenChange,
  newInventory,
  setNewInventory,
  drugs,
  handleNewInventorySubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Inventory</DialogTitle>
          <DialogDescription>
            Add new inventory for an existing drug.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Drug</Label>
            <Select
              value={newInventory.drugId}
              onValueChange={(value) =>
                setNewInventory({ ...newInventory, drugId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select drug" />
              </SelectTrigger>
              <SelectContent>
                {drugs.map((drug) => (
                  <SelectItem key={drug.id} value={drug.id}>
                    {drug.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Batch Number</Label>
            <Input
              value={newInventory.batchNumber}
              onChange={(e) =>
                setNewInventory({
                  ...newInventory,
                  batchNumber: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Expiration Date</Label>
            <Input
              type="date"
              value={newInventory.expirationDate}
              onChange={(e) =>
                setNewInventory({
                  ...newInventory,
                  expirationDate: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              value={newInventory.quantity}
              onChange={(e) =>
                setNewInventory({
                  ...newInventory,
                  quantity: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label>Supplier</Label>
            <Input
              value={newInventory.supplier}
              onChange={(e) =>
                setNewInventory({ ...newInventory, supplier: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Purchase Date</Label>
            <Input
              type="date"
              value={newInventory.purchaseDate}
              onChange={(e) =>
                setNewInventory({
                  ...newInventory,
                  purchaseDate: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Purchase Price</Label>
            <Input
              type="number"
              value={newInventory.purchasePrice}
              onChange={(e) =>
                setNewInventory({
                  ...newInventory,
                  purchasePrice: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label>Selling Price</Label>
            <Input
              type="number"
              value={newInventory.sellingPrice}
              onChange={(e) =>
                setNewInventory({
                  ...newInventory,
                  sellingPrice: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleNewInventorySubmit}>Add Inventory</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
