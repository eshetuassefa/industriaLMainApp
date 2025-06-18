import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NewPatientDialog = ({
  showNewPatientDialog,
  setShowNewPatientDialog,
  isEditing,
  setIsEditing,
  editingPatient,
  setEditingPatient,
  newPatient,
  setNewPatient,
  handleNewPatientSubmit,
  handleUpdatePatient,
  loading, // Added loading prop
}) => {
  return (
    <Dialog
      open={showNewPatientDialog}
      onOpenChange={(open) => {
        setShowNewPatientDialog(open);
        if (!open) {
          setIsEditing(false);
          setEditingPatient(null);
          setNewPatient({
            firstName: "",
            lastName: "",
            nationalId: "",
            dob: "",
            sex: "MALE",
            phoneNumber: "",
            email: "",
            address: "",
            insurance: "",
            emergencyContact: {
              name: "",
              relationship: "",
              phone: "",
            },
          });
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Patient" : "Register New Patient"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the patient's information."
              : "Enter the patient's information to register them in the system."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={
                  isEditing ? editingPatient.firstName : newPatient.firstName
                }
                onChange={(e) =>
                  isEditing
                    ? setEditingPatient({
                        ...editingPatient,
                        firstName: e.target.value,
                      })
                    : setNewPatient({
                        ...newPatient,
                        firstName: e.target.value,
                      })
                }
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={
                  isEditing ? editingPatient.lastName : newPatient.lastName
                }
                onChange={(e) =>
                  isEditing
                    ? setEditingPatient({
                        ...editingPatient,
                        lastName: e.target.value,
                      })
                    : setNewPatient({ ...newPatient, lastName: e.target.value })
                }
                placeholder="Doe"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID *</Label>
              <Input
                id="nationalId"
                value={
                  isEditing ? editingPatient.nationalId : newPatient.nationalId
                }
                onChange={(e) =>
                  isEditing
                    ? setEditingPatient({
                        ...editingPatient,
                        nationalId: e.target.value,
                      })
                    : setNewPatient({
                        ...newPatient,
                        nationalId: e.target.value,
                      })
                }
                placeholder="Enter national ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex *</Label>
              <Select
                value={isEditing ? editingPatient.sex : newPatient.sex}
                onValueChange={(value) =>
                  isEditing
                    ? setEditingPatient({ ...editingPatient, sex: value })
                    : setNewPatient({ ...newPatient, sex: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={isEditing ? editingPatient.dob : newPatient.dob}
                onChange={(e) =>
                  isEditing
                    ? setEditingPatient({
                        ...editingPatient,
                        dob: e.target.value,
                      })
                    : setNewPatient({ ...newPatient, dob: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={
                  isEditing
                    ? editingPatient.phoneNumber
                    : newPatient.phoneNumber
                }
                onChange={(e) =>
                  isEditing
                    ? setEditingPatient({
                        ...editingPatient,
                        phoneNumber: e.target.value,
                      })
                    : setNewPatient({
                        ...newPatient,
                        phoneNumber: e.target.value,
                      })
                }
                placeholder="555-123-4567"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={isEditing ? editingPatient.email : newPatient.email}
              onChange={(e) =>
                isEditing
                  ? setEditingPatient({
                      ...editingPatient,
                      email: e.target.value,
                    })
                  : setNewPatient({ ...newPatient, email: e.target.value })
              }
              placeholder="john.doe@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={isEditing ? editingPatient.address : newPatient.address}
              onChange={(e) =>
                isEditing
                  ? setEditingPatient({
                      ...editingPatient,
                      address: e.target.value,
                    })
                  : setNewPatient({ ...newPatient, address: e.target.value })
              }
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance Information</Label>
            <Input
              id="insurance"
              value={
                isEditing ? editingPatient.insurance : newPatient.insurance
              }
              onChange={(e) =>
                isEditing
                  ? setEditingPatient({
                      ...editingPatient,
                      insurance: e.target.value,
                    })
                  : setNewPatient({ ...newPatient, insurance: e.target.value })
              }
              placeholder="Insurance Provider & Policy Number"
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">Emergency Contact *</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Name *</Label>
                <Input
                  id="emergencyName"
                  value={
                    isEditing
                      ? editingPatient.emergencyContact.name
                      : newPatient.emergencyContact.name
                  }
                  onChange={(e) =>
                    isEditing
                      ? setEditingPatient({
                          ...editingPatient,
                          emergencyContact: {
                            ...editingPatient.emergencyContact,
                            name: e.target.value,
                          },
                        })
                      : setNewPatient({
                          ...newPatient,
                          emergencyContact: {
                            ...newPatient.emergencyContact,
                            name: e.target.value,
                          },
                        })
                  }
                  placeholder="Emergency contact name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone Number *</Label>
                <Input
                  id="emergencyPhone"
                  value={
                    isEditing
                      ? editingPatient.emergencyContact.phone
                      : newPatient.emergencyContact.phone
                  }
                  onChange={(e) =>
                    isEditing
                      ? setEditingPatient({
                          ...editingPatient,
                          emergencyContact: {
                            ...editingPatient.emergencyContact,
                            phone: e.target.value,
                          },
                        })
                      : setNewPatient({
                          ...newPatient,
                          emergencyContact: {
                            ...newPatient.emergencyContact,
                            phone: e.target.value,
                          },
                        })
                  }
                  placeholder="Emergency contact phone"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelationship">Relationship</Label>
              <Input
                id="emergencyRelationship"
                value={
                  isEditing
                    ? editingPatient.emergencyContact.relationship
                    : newPatient.emergencyContact.relationship
                }
                onChange={(e) =>
                  isEditing
                    ? setEditingPatient({
                        ...editingPatient,
                        emergencyContact: {
                          ...editingPatient.emergencyContact,
                          relationship: e.target.value,
                        },
                      })
                    : setNewPatient({
                        ...newPatient,
                        emergencyContact: {
                          ...newPatient.emergencyContact,
                          relationship: e.target.value,
                        },
                      })
                }
                placeholder="Relationship to patient"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select
                value={isEditing ? editingPatient.bloodType : newPatient.bloodType}
                onValueChange={(value) =>
                  isEditing
                    ? setEditingPatient({ ...editingPatient, bloodType: value })
                    : setNewPatient({ ...newPatient, bloodType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setShowNewPatientDialog(false);
              setIsEditing(false);
              setEditingPatient(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={isEditing ? handleUpdatePatient : handleNewPatientSubmit}
            disabled={
              loading ||
              (isEditing
                ? !editingPatient.firstName ||
                  !editingPatient.lastName ||
                  !editingPatient.nationalId ||
                  !editingPatient.phoneNumber ||
                  !editingPatient.emergencyContact.name ||
                  !editingPatient.emergencyContact.phone
                : !newPatient.firstName ||
                  !newPatient.lastName ||
                  !newPatient.nationalId ||
                  !newPatient.phoneNumber ||
                  !newPatient.emergencyContact.name ||
                  !newPatient.emergencyContact.phone)
            }
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading
              ? "Loading..."
              : isEditing
              ? "Update Patient"
              : "Register Patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewPatientDialog;
