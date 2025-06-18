"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Clock,
  Search,
  UserPlus,
  Users,
  CalendarPlus2Icon as CalendarIcon2,
  ClipboardList,
  Bell,
  Building2,
  CalendarDays,
  UserCircle,
  UsersRound,
  Pencil,
  ArrowRight,
} from "lucide-react";
import Header from "@/pages/receptionist/Header";
import Sidebar from "@/pages/receptionist/Sidebar";
import PatientDetails from "@/pages/receptionist/PatientDetails";
import PatientList from "@/pages/receptionist/PatientList";
import NewPatientDialog from "@/pages/receptionist/NewPatientDialog";
import ForwardPatientDialog from "@/pages/receptionist/ForwardPatientDialog";
import receptionistService from "@/services/receptionist.service";
import adminService from "@/services/admin.service";

export default function ReceptionistPage() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("patients");
  const [isEditing, setIsEditing] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    dob: "",
    sex: "MALE",
    bloodType: "",
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
  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || "Receptionist",
    role: "Receptionist",
    avatar: localStorage.getItem("userAvatar") || null,
    email: localStorage.getItem("userEmail") || "",
  });
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [forwardDetails, setForwardDetails] = useState({
    patientId: "",
    providerId: "",
    department: "",
    reason: "",
    priority: "normal",
  });
  const [providers, setProviders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const response = await receptionistService.fetchPatients();
      if (response.success && Array.isArray(response.data)) {
        const formattedPatients = response.data.map((patient) => ({
          id: patient.id,
          name: `${patient.person.firstName} ${
            patient.person.middleName ? patient.person.middleName + " " : ""
          }${patient.person.lastName}`,
          nationalId: patient.nationalId,
          birthCertificate: patient.birthCertificate,
          dob: patient.person.dob,
          sex: patient.person.sex,
          contact: patient.person.phoneNumber,
          email: patient.person.email || "",
          address: patient.person.address || "",
          insurance: patient.insurance || "",
          emergencyContact: {
            name: patient.emergencyContact?.name || "",
            phone: patient.emergencyContact?.phone || "",
            relationship: patient.emergencyContact?.relationship || "",
          },
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
        }));
        setPatients(formattedPatients);
      } else {
        console.error(
          "Failed to fetch patients:",
          response.error?.message || "Unknown error"
        );
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  };

  // Handle patient selection
  const handlePatientSelect = async (patient) => {
    try {
      if (!patient || !patient.id) {
        console.error("Invalid patient data");
        return;
      }
      const formattedPatient = {
        id: patient.id,
        name: patient.name,
        nationalId: patient.nationalId,
        dob: patient.dob,
        contact: patient.contact,
        email: patient.email || "",
        address: patient.address || "",
        insurance: patient.insurance || "",
        sex: patient.sex,
        emergencyContact: {
          name: patient.emergencyContact?.name || "",
          relationship: patient.emergencyContact?.relationship || "",
          phone: patient.emergencyContact?.phone || "",
        },
      };
      setSelectedPatient(formattedPatient);
    } catch (error) {
      console.error("Error selecting patient:", error);
    }
  };

  // Handle patient edit
  const handleEditPatient = async (patient) => {
    try {
      if (!patient || !patient.name) {
        console.error("Invalid patient data");
        return;
      }
      const nameParts = patient.name.split(" ");
      const editingData = {
        id: patient.id,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        nationalId: patient.nationalId || "",
        dob: patient.dob || "",
        sex: patient.sex || "MALE",
        phoneNumber: patient.contact || "",
        email: patient.email || "",
        address: patient.address || "",
        insurance: patient.insurance || "",
        emergencyContact: patient.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
        },
      };
      setEditingPatient(editingData);
      setIsEditing(true);
      setShowNewPatientDialog(true);
    } catch (error) {
      console.error("Error editing patient:", error);
    }
  };

  // Handle patient update
  const handleUpdatePatient = async () => {
    try {
      if (!editingPatient) return;

      setLoading(true);
      console.log("Starting update for patient ID:", editingPatient.id);

      // Extract id separately and create update payload without id
      const { id, ...updatePayload } = editingPatient;
      console.log("Update payload:", updatePayload);

      const response = await receptionistService.updatePatient(
        id,
        updatePayload
      );
      console.log("Update response:", response);

      if (response.success && response.data) {
        const updatedPatientData = response.data;
        const formattedPatient = {
          id: updatedPatientData.id,
          name: `${updatedPatientData.person.firstName} ${updatedPatientData.person.lastName}`,
          nationalId: updatedPatientData.nationalId,
          dob: updatedPatientData.person.dob,
          contact: updatedPatientData.person.phoneNumber,
          email: updatedPatientData.person.email || "",
          address: updatedPatientData.person.address || "",
          insurance: updatedPatientData.insurance || "",
          sex: updatedPatientData.person.sex,
          emergencyContact: {
            name: updatedPatientData.emergencyContact?.name || "",
            relationship:
              updatedPatientData.emergencyContact?.relationship || "",
            phone: updatedPatientData.emergencyContact?.phone || "",
          },
          createdAt: updatedPatientData.createdAt,
          updatedAt: updatedPatientData.updatedAt,
        };

        setPatients((prevPatients) =>
          prevPatients.map((patient) =>
            patient.id === id ? formattedPatient : patient
          )
        );
        setSelectedPatient(formattedPatient);
        setIsEditing(false);
        setEditingPatient(null);
        setShowNewPatientDialog(false); // Ensure dialog closes
        await addNotification(`Updated successfully`);
        setActiveTab("patients"); // Force tab switch
        console.log("Update successful, switching to patients tab");
      } else {
        console.error(
          "Failed to update patient:",
          response.error?.message || "No success or data in response"
        );
        await addNotification(`update successfully`);
        setShowNewPatientDialog(false); // Ensure dialog closes on failure
        setActiveTab("patients"); // Force tab switch on failure
        console.log("Update failed, switching to patients tab");
      }
    } catch (error) {
      console.error("Error updating patient:", error);
      await addNotification(`Not updated`);
      setShowNewPatientDialog(false); // Ensure dialog closes on error
      setActiveTab("patients"); // Force tab switch on error
      console.log("Update error, switching to patients tab");
    } finally {
      setLoading(false);
      console.log("Loading state reset");
    }
  };

  // Handle new patient submission
  const handleNewPatientSubmit = async () => {
    try {
      if (
        !newPatient.firstName ||
        !newPatient.lastName ||
        !newPatient.nationalId ||
        !newPatient.phoneNumber ||
        !newPatient.emergencyContact.name ||
        !newPatient.emergencyContact.phone
      ) {
        console.error("Required fields are missing");
        return;
      }
      setLoading(true);
      const response = await receptionistService.addPatient(newPatient);
      if (response.success && response.data) {
        const formattedPatient = {
          id: response.data.id,
          name: `${response.data.person.firstName} ${response.data.person.lastName}`,
          nationalId: response.data.nationalId,
          dob: response.data.person.dob,
          contact: response.data.person.phoneNumber,
          email: response.data.person.email || "",
          address: response.data.person.address || "",
          insurance: response.data.insurance || "",
          sex: response.data.person.sex,
          emergencyContact: {
            name: response.data.emergencyContact?.name || "",
            relationship: response.data.emergencyContact?.relationship || "",
            phone: response.data.emergencyContact?.phone || "",
          },
        };
        setPatients((prevPatients) => [...prevPatients, formattedPatient]);
        setSelectedPatient(formattedPatient);
        setNewPatient({
          firstName: "",
          lastName: "",
          nationalId: "",
          dob: "",
          sex: "MALE",
          bloodType: "",
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
        setShowNewPatientDialog(false);
        await addNotification(
          `New patient ${formattedPatient.name} has been registered`
        );
        await fetchPatients();
      } else {
        console.error(
          "Failed to add patient:",
          response.error?.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error adding new patient:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    const query = e.target.value.trim();
    setSearchQuery(query);
    if (query.length >= 2) {
      handleSearch(query);
    } else if (query.length === 0) {
      fetchPatients();
    }
  };

  const handleSearch = async (query) => {
    try {
      if (!query || query.trim().length < 2) {
        await fetchPatients();
        return;
      }
      const response = await receptionistService.searchPatients(query);
      if (response.success && Array.isArray(response.data)) {
        const formattedPatients = response.data.map((patient) => ({
          id: patient.id,
          name: `${patient.person.firstName} ${patient.person.lastName}`,
          nationalId: patient.nationalId,
          dob: patient.person.dob,
          contact: patient.person.phoneNumber,
          email: patient.person.email || "",
          address: patient.person.address || "",
          insurance: patient.insurance || "",
          lastVisit: patient.lastVisit || null,
        }));
        setPatients(formattedPatients);
      } else {
        console.error(
          "Failed to search patients:",
          response.error?.message || "Unknown error"
        );
        setPatients([]);
      }
    } catch (error) {
      console.error("Error searching patients:", error);
      setPatients([]);
    }
  };

  // Handle forward patient
  const handleForwardSubmit = async () => {
    try {
      if (
        !selectedPatient ||
        !forwardDetails.providerId ||
        !forwardDetails.department ||
        !forwardDetails.reason
      ) {
        console.error("Missing required forward details");
        return;
      }
      setLoading(true);
      const forwardData = {
        patientId: selectedPatient.id,
        doctorId: forwardDetails.providerId,
        notes: forwardDetails.reason,
        priority: forwardDetails.priority,
        department: forwardDetails.department
      };
      console.log("Forwarding patient with data:", forwardData);
      const response = await receptionistService.forwardPatient(forwardData);
      if (response.success) {
        await addNotification(
          `Patient ${selectedPatient.name} has been forwarded to ${forwardDetails.department}`
        );
        setShowForwardDialog(false);
        setForwardDetails({
          patientId: "",
          providerId: "",
          department: "",
          reason: "",
          priority: "normal",
        });
      } else {
        console.error(
          "Failed to forward patient:",
          response.error?.message || "Unknown error"
        );
        await addNotification("Failed to forward patient. Please try again.");
      }
    } catch (error) {
      console.error("Error forwarding patient:", error);
      await addNotification("Error forwarding patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add notification
  const addNotification = async (message) => {
    try {
      console.log("Adding notification:", message);
      const newNotification = {
        id:
          notifications.length > 0
            ? Math.max(...notifications.map((n) => n.id)) + 1
            : 1,
        message,
        time: "Just now",
      };
      setNotifications([newNotification, ...notifications]);
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Fetch providers on mount
  useEffect(() => {
    const fetchProviders = async () => {
      const response = await adminService.getAllStaff();
      if (response.success && Array.isArray(response.data)) {
        setProviders(
          response.data.filter((s) => s.role === "HEALTHCARE_PROVIDER")
        );
      }
    };
    fetchProviders();
  }, []);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await adminService.getAllDepartments();
        if (response.success && Array.isArray(response.data)) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch user details on mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await receptionistService.getCurrentUser();
        if (response.success && response.data) {
          setUser({
            name: `${response.data.person.firstName} ${response.data.person.lastName}`,
            role: response.data.role,
            avatar: response.data.person.avatar || null,
            email: response.data.person.email || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-2 shadow-md"
          >
            {notification.message} ({notification.time})
          </div>
        ))}
      </div>
      <div className="flex pt-20 bg-[#fdf9f5]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 ml-60 px-6 pb-6">
          {activeTab === "dashboard" && (
            <div className="space-y-4">
              {/* Placeholder for dashboard content */}
            </div>
          )}
          {activeTab === "patients" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Patient Management</h2>
                <Button
                  onClick={() => setShowNewPatientDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Register New Patient
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PatientList
                  patients={patients}
                  selectedPatient={selectedPatient}
                  handlePatientSelect={handlePatientSelect}
                  searchQuery={searchQuery}
                  handleSearchChange={handleSearchChange}
                  getInitials={getInitials}
                />
                <PatientDetails
                  selectedPatient={selectedPatient}
                  setShowNewPatientDialog={setShowNewPatientDialog}
                  setIsEditing={setIsEditing}
                  setEditingPatient={setEditingPatient}
                  setShowForwardDialog={setShowForwardDialog}
                  setForwardDetails={setForwardDetails}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <NewPatientDialog
        showNewPatientDialog={showNewPatientDialog}
        setShowNewPatientDialog={setShowNewPatientDialog}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editingPatient={editingPatient}
        setEditingPatient={setEditingPatient}
        newPatient={newPatient}
        setNewPatient={setNewPatient}
        handleNewPatientSubmit={handleNewPatientSubmit}
        handleUpdatePatient={handleUpdatePatient}
        loading={loading}
      />
      <ForwardPatientDialog
        showForwardDialog={showForwardDialog}
        setShowForwardDialog={setShowForwardDialog}
        forwardDetails={forwardDetails}
        setForwardDetails={setForwardDetails}
        handleForwardSubmit={handleForwardSubmit}
        providers={providers}
        departments={departments}
        loading={loading}
      />
    </div>
  );
}
