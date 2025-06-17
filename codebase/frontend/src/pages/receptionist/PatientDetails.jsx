import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Pencil, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const PatientDetails = ({
  selectedPatient,
  setShowNewPatientDialog,
  setIsEditing,
  setEditingPatient,
  setShowForwardDialog,
  setForwardDetails,
}) => {
  return (
    <div className="md:col-span-2">
      {selectedPatient ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedPatient.name}</CardTitle>
                <CardDescription>Patient Details</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setEditingPatient({
                      id: selectedPatient.id,
                      firstName: selectedPatient.name.split(" ")[0] || "",
                      lastName:
                        selectedPatient.name.split(" ").slice(1).join(" ") ||
                        "",
                      nationalId: selectedPatient.nationalId || "",
                      dob: selectedPatient.dob || "",
                      sex: selectedPatient.sex || "MALE",
                      phoneNumber: selectedPatient.contact || "",
                      email: selectedPatient.email || "",
                      address: selectedPatient.address || "",
                      insurance: selectedPatient.insurance || "",
                      emergencyContact: selectedPatient.emergencyContact || {
                        name: "",
                        relationship: "",
                        phone: "",
                      },
                    });
                    setShowNewPatientDialog(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setForwardDetails({
                      patientId: selectedPatient.id.toString(),
                      providerId: "",
                      department: "",
                      reason: "",
                      priority: "normal",
                    });
                    setShowForwardDialog(true);
                  }}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Forward to Provider
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Personal Information
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">
                        National ID:
                      </span>
                      <p>{selectedPatient.nationalId || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        Date of Birth:
                      </span>
                      <p>
                        {selectedPatient.dob
                          ? format(new Date(selectedPatient.dob), "yyyy-MM-dd")
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Sex:</span>
                      <p>{selectedPatient.sex || "Not provided"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Contact Information
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Phone:</span>
                      <p className="text-sm">
                        {selectedPatient?.contact || "Not provided"}
                      </p>
                    </div>
                    <div>
                      {/* <span className="text-sm text-gray-500">Email:</span>  */}
                      <p className="text-sm">{selectedPatient?.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Address:</span>
                      <p className="text-sm">
                        {selectedPatient?.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  {/* <h3 className="text-sm font-medium text-gray-500">
                    Insurance Information
                  </h3> */}
                  <div className="mt-2">
                    <p className="text-sm">{selectedPatient?.insurance}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Emergency Contact
                  </h3>
                  <div className="mt-2 space-y-2">
                    {selectedPatient?.emergencyContact ? (
                      <>
                        <div>
                          <span className="text-sm text-gray-500">Name:</span>
                          <p className="text-sm">
                            {selectedPatient.emergencyContact.name ||
                              "Not provided"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Phone:</span>
                          <p className="text-sm">
                            {selectedPatient.emergencyContact.phone ||
                              "Not provided"}
                          </p>
                        </div>
                        <div>
                          {/* <span className="text-sm text-gray-500">
                            Relationship:
                          </span> */}
                          <p className="text-sm">
                            {selectedPatient.emergencyContact.relationship}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Select a patient to view details</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientDetails;
