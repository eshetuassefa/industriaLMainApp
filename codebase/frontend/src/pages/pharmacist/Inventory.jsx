// src/components/pharmacist/Inventory.js
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Dialog, DialogTrigger } from "../../components/ui/dialog";

export default function Inventory({
  drugs,
  searchQuery,
  setSearchQuery,
  userRole,
  setShowAddDrugDialog,
  setShowAddInventoryDialog,
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Medication Inventory</h2>
        <div className="flex space-x-2">
          {["PHARMACIST", "SUPERADMIN"].includes(userRole) && (
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setShowAddDrugDialog(true)}>
                  Add Drug
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
          <Button onClick={() => setShowAddInventoryDialog(true)}>
            Add Inventory
          </Button>
        </div>
      </div>
      <Input
        placeholder="Search drugs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Card>
        <CardHeader>
          <CardTitle>Drug List</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Dosage Form</th>
                <th className="text-left">Strength</th>
                <th className="text-left">Stock</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map((drug) => (
                <tr key={drug.id}>
                  <td>{drug.name}</td>
                  <td>{drug.dosageForm}</td>
                  <td>{drug.strength}</td>
                  <td>
                    {drug.inventory.reduce((sum, i) => sum + i.quantity, 0)}
                  </td>
                  <td>{drug.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
