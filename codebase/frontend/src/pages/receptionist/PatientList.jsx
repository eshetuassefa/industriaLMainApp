import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search } from "lucide-react";

const PatientList = ({
  patients,
  selectedPatient,
  handlePatientSelect,
  searchQuery,
  handleSearchChange,
  getInitials,
}) => {
  const filteredPatients =
    patients && Array.isArray(patients)
      ? patients.filter((patient) => {
          if (!patient) return false;
          const searchLower = searchQuery.toLowerCase();
          return (
            (patient.name &&
              patient.name.toLowerCase().includes(searchLower)) ||
            (patient.nationalId && patient.nationalId.includes(searchQuery)) ||
            (patient.contact && patient.contact.includes(searchQuery)) ||
            (patient.email && patient.email.toLowerCase().includes(searchLower))
          );
        })
      : [];

  return (
    <div className="md:col-span-1 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <CardDescription>
            {filteredPatients.length} patients found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center space-x-2 mb-4 px-4">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search patients by national_id, name..."
              className="flex-1"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <div
                  key={patient?.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedPatient?.id === patient?.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(patient?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">
                        {patient?.name || "-"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        ID: {patient?.nationalId || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No patients found
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientList;
