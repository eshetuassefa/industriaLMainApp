// "use client"; // Directive to indicate this is a client-side component

import { useState, useEffect, useCallback, useRef } from "react"; // Import React hooks for state, effects, callbacks, and refs
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { Tabs, TabsContent } from "../../components/ui/tabs"; // Import Tabs components for UI
import { format } from "date-fns"; // Import date-fns for date formatting
import {
  Search,
  Pill,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Bell,
  Clipboard,
  FileText,
  User,
  Building2,
  CalendarDays,
  UserCircle,
  Users,
  FileDown,
  ClipboardList,
  Package,
  Clock,
  Loader2,
} from "lucide-react"; // Import Lucide icons for UI elements
import {
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BellIcon,
} from "@heroicons/react/24/outline"; // Import Heroicons for additional icons
import { useToast } from "../../components/ui/use-toast"; // Import toast for notifications
import pharmacyService from "../../services/pharmacist.service"; // Import pharmacy service for API calls
import authService from "../../services/auth.service"; // Import auth service for user authentication

import Sidebar from "@/pages/pharmacist/Sidebar"; // Import Sidebar component
import Dashboard from "@/pages/pharmacist/Dashboard"; // Import Dashboard component
import PrescriptionList from "@/pages/pharmacist/PrescriptionList"; // Import PrescriptionList component
import PrescriptionDetails from "@/pages/pharmacist/PrescriptionDetails"; // Import PrescriptionDetails component
import Dispensing from "@/pages/pharmacist/Dispensing"; // Import Dispensing component
import Inventory from "@/pages/pharmacist/Inventory"; // Import Inventory component
import Reports from "@/pages/pharmacist/Reports"; // Import Reports component
import Patients from "@/pages/pharmacist/Patients"; // Import Patients component
import NewPrescriptionDialog from "@/pages/pharmacist/NewPrescriptionDialog"; // Import NewPrescriptionDialog component
import AddDrugDialog from "@/pages/pharmacist/AddDrugDialog"; // Import AddDrugDialog component
import AddInventoryDialog from "@/pages/pharmacist/AddInventoryDialog"; // Import AddInventoryDialog component
import ConfirmDialog from "@/pages/pharmacist/ConfirmDialog"; // Import ConfirmDialog component
import Header from "@/pages/pharmacist/Header"; // Import Header component

// src/pages/pharmacist/PharmacistPage.js

const COLORS = {
  // Define color constants for different statuses
  PENDING: "#eab308",
  DELIVERED: "#22c55e",
  default: "#ef4444",
};

export default function PharmacistPage() {
  // Main component function for the pharmacist page
  const navigate = useNavigate(); // Initialize navigation hook
  const { toast } = useToast(); // Initialize toast for notifications
  const isInitialMount = useRef(true); // Ref to track initial mount
  const [patients, setPatients] = useState([]); // State for patient list
  const [prescriptions, setPrescriptions] = useState([]); // State for prescription list
  const [drugs, setDrugs] = useState([]); // State for drug list
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [selectedPrescription, setSelectedPrescription] = useState(null); // State for selected prescription
  const [selectedPatient, setSelectedPatient] = useState(null); // State for selected patient
  const [showNewPrescriptionDialog, setShowNewPrescriptionDialog] =
    useState(false); // State for new prescription dialog visibility
  const [showAddDrugDialog, setShowAddDrugDialog] = useState(false); // State for add drug dialog visibility
  const [showAddInventoryDialog, setShowAddInventoryDialog] = useState(false); // State for add inventory dialog visibility
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // State for confirm dialog visibility
  const [confirmAction, setConfirmAction] = useState(null); // State for confirm action details
  const [newPrescription, setNewPrescription] = useState({
    // Initial state for new prescription form
    patientId: "",
    hospitalId: "1",
    notes: "",
    drugs: [],
  });
  const [newDrug, setNewDrug] = useState({
    // Initial state for new drug form
    name: "",
    genericName: "",
    dosageForm: "TABLET",
    strength: "",
    manufacturer: "",
    reorderLevel: 0,
  });
  const [newInventory, setNewInventory] = useState({
    // Initial state for new inventory form
    drugId: "",
    batchNumber: "",
    expirationDate: "",
    quantity: 0,
    supplier: "",
    purchaseDate: "",
    purchasePrice: 0,
    sellingPrice: 0,
  });
  const [medicationToAdd, setMedicationToAdd] = useState({
    // Initial state for medication to add
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: 0,
    instructions: "",
  });
  const [notifications, setNotifications] = useState([]); // State for notifications
  const [activeTab, setActiveTab] = useState("dashboard"); // State for active tab
  const [activityLog, setActivityLog] = useState([]); // State for activity log
  const [isLoading, setIsLoading] = useState(false); // State for overall loading status
  const [loadingStates, setLoadingStates] = useState({
    // State for specific loading states
    drugs: false,
    prescriptions: false,
    patients: false,
    delivery: false,
  });
  const [error, setError] = useState(null); // State for error messages
  const [user, setUser] = useState({
    // Initial state for user details
    name: localStorage.getItem("userName") || "Pharmacist",
    role: localStorage.getItem("userRole") || "PHARMACIST",
    avatar: localStorage.getItem("userAvatar") || null,
  });
  const [formErrors, setFormErrors] = useState({}); // State for form validation errors

  const navigation = [
    // Define navigation menu items with names, values, and icons
    { name: "Dashboard", value: "dashboard", icon: Pill },
    { name: "Prescriptions", value: "prescriptions", icon: ClipboardList },
    { name: "Dispensing", value: "dispensing", icon: Package },
    { name: "Inventory", value: "inventory", icon: ArchiveBoxIcon },
    { name: "Reports", value: "reports", icon: BarChart3 },
    { name: "Patients", value: "patients", icon: UserGroupIcon },
  ];

  const getFirstNameFromEmail = (email) => {
    // Function to extract first name from email
    if (!email) return "";
    const namePart = email.split("@")[0];
    return namePart
      .replace(/[0-9]/g, "")
      .replace(/[^a-zA-Z]/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    // Effect to handle user authentication on mount
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please login to access this page",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    if (
      currentUser.role !== "PHARMACIST" &&
      currentUser.role !== "SUPERADMIN"
    ) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    const displayName =
      currentUser.firstName && currentUser.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : getFirstNameFromEmail(currentUser.email);
    setUser({
      name: displayName,
      role: currentUser.role,
      avatar: currentUser.avatar || null,
    });
  }, []);

  const fetchData = useCallback(async () => {
    // Callback to fetch data based on active tab
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "inventory" || activeTab === "dashboard") {
        setLoadingStates((prev) => ({ ...prev, drugs: true }));
        const drugResponse = await pharmacyService.fetchDrugs();
        if (drugResponse.success) {
          setDrugs(drugResponse.data || []);
        } else {
          throw new Error(
            drugResponse.error?.message || "Failed to fetch drugs"
          );
        }
        setLoadingStates((prev) => ({ ...prev, drugs: false }));
      }
      if (
        activeTab === "prescriptions" ||
        activeTab === "dispensing" ||
        activeTab === "dashboard"
      ) {
        setLoadingStates((prev) => ({ ...prev, prescriptions: true }));
        const response = await pharmacyService.getPrescriptions();
        if (response.success) {
          const transformedPrescriptions = (response.data || []).map((p) => ({
            ...p,
            patient: p.patient || { name: "Unknown" },
            prescribedBy: p.prescribedBy || {
              firstName: "Unknown",
              lastName: "",
            },
            deliveryStatus: p.deliveryStatus || "PENDING",
            drugName: p.drugName || "Unknown",
            dosage: p.dosage || "Not specified",
            frequency: p.frequency || "Not specified",
            duration: p.duration || "Not specified",
            instructions: p.instructions || "No special instructions",
            deliveredAt: p.deliveredAt,
            deliveredBy: p.deliveredBy
              ? `${p.deliveredBy.firstName} ${
                  p.deliveredBy.lastName || ""
                }`.trim()
              : "Unknown",
            healthcareProviderName: p.prescribedBy
              ? `${p.prescribedBy.firstName} ${
                  p.prescribedBy.lastName || ""
                }`.trim()
              : "Unknown",
          }));
          setPrescriptions(transformedPrescriptions);
        } else {
          throw new Error(
            response.error?.message || "Failed to fetch prescriptions"
          );
        }
        setLoadingStates((prev) => ({ ...prev, prescriptions: false }));
      }
      if (
        activeTab === "patients" ||
        activeTab === "prescriptions" ||
        activeTab === "dashboard"
      ) {
        setLoadingStates((prev) => ({ ...prev, patients: true }));
        const patientResponse = await pharmacyService.getPatients();
        if (patientResponse.success) {
          // Sort patients by addedDate or createdAt in descending order (most recent first)
          const sortedPatients = (patientResponse.data || []).sort(
            (a, b) =>
              new Date(b.addedDate || b.createdAt) -
              new Date(a.addedDate || a.createdAt)
          );
          setPatients(sortedPatients);
        } else {
          throw new Error(
            patientResponse.error?.message || "Failed to fetch patients"
          );
        }
        setLoadingStates((prev) => ({ ...prev, patients: false }));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      addNotification(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    // Effect to fetch data when active tab changes
    fetchData();
  }, [fetchData]);

  const addNotification = (message, type = "info") => {
    // Function to add notifications
    const newNotification = {
      id:
        notifications.length > 0
          ? Math.max(...notifications.map((n) => n.id)) + 1
          : 1,
      message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    toast({
      title: type === "error" ? "Error" : "Success",
      description: message,
      variant: type === "error" ? "destructive" : "default",
    });
  };

  const handleNewDrugSubmit = async () => {
    // Function to handle new drug submission
    try {
      setIsLoading(true);
      const response = await pharmacyService.addDrug(newDrug);
      if (response.success) {
        setDrugs((prev) => [...prev, response.data]);
        setNewDrug({
          name: "",
          genericName: "",
          dosageForm: "TABLET",
          strength: "",
          manufacturer: "",
          reorderLevel: 0,
        });
        setShowAddDrugDialog(false);
        addNotification(
          response.message || "Drug added successfully",
          "success"
        );
        setActivityLog((prev) => [
          {
            id: prev.length + 1,
            action: `Added drug: ${response.data.name}`,
            user: user.name || "Pharmacist",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "info",
          },
          ...prev,
        ]);
      } else {
        throw new Error(response.error?.message || "Failed to add drug");
      }
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewInventorySubmit = async () => {
    // Function to handle new inventory submission
    try {
      setIsLoading(true);
      const response = await pharmacyService.addInventory({
        ...newInventory,
        expirationDate: new Date(newInventory.expirationDate).toISOString(),
        purchaseDate: newInventory.purchaseDate
          ? new Date(newInventory.purchaseDate).toISOString()
          : undefined,
      });
      if (response.success) {
        setDrugs((prev) =>
          prev.map((drug) =>
            drug.id === newInventory.drugId
              ? { ...drug, inventory: [...drug.inventory, response.data] }
              : drug
          )
        );
        setNewInventory({
          drugId: "",
          batchNumber: "",
          expirationDate: "",
          quantity: 0,
          supplier: "",
          purchaseDate: "",
          purchasePrice: 0,
          sellingPrice: 0,
        });
        setShowAddInventoryDialog(false);
        addNotification(
          response.message || "Inventory added successfully",
          "success"
        );
        setActivityLog((prev) => [
          {
            id: prev.length + 1,
            action: `Added inventory for drug ID: ${newInventory.drugId}`,
            user: user.name || "Pharmacist",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "info",
          },
          ...prev,
        ]);
      } else {
        throw new Error(response.error?.message || "Failed to add inventory");
      }
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPrescriptionSubmit = async () => {
    // Function to handle new prescription submission
    try {
      setIsLoading(true);
      const response = await pharmacyService.createPrescription(
        newPrescription
      );
      if (response.success) {
        setPrescriptions((prev) => [...prev, ...response.data]);
        setNewPrescription({
          patientId: "",
          hospitalId: "1",
          notes: "",
          drugs: [],
        });
        setShowNewPrescriptionDialog(false);
        addNotification(
          response.message || "Prescription created successfully",
          "success"
        );
        setActivityLog((prev) => [
          {
            id: prev.length + 1,
            action: `Created prescription for patient ID: ${newPrescription.patientId}`,
            user: user.name || "Pharmacist",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "info",
          },
          ...prev,
        ]);
      } else {
        throw new Error(
          response.error?.message || "Failed to create prescription"
        );
      }
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMedicationToPrescription = () => {
    // Function to add medication to prescription
    setNewPrescription((prev) => ({
      ...prev,
      drugs: [...prev.drugs, medicationToAdd],
    }));
    setMedicationToAdd({
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 0,
      instructions: "",
    });
  };

  const handleRemoveMedicationFromPrescription = (index) => {
    // Function to remove medication from prescription
    setNewPrescription((prev) => ({
      ...prev,
      drugs: prev.drugs.filter((_, i) => i !== index),
    }));
  };

  const handleViewPrescription = async (prescription) => {
    // Function to handle viewing prescription details
    try {
      if (!prescription || !prescription.id) {
        throw new Error("Invalid prescription data");
      }
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(prescription.id)) {
        throw new Error("Invalid prescription ID format");
      }
      setIsLoading(true);
      const response = await pharmacyService.getPrescription(prescription.id);
      if (response.success && response.data) {
        const transformedPrescription = {
          ...response.data,
          patient: response.data.patient || { name: "Unknown" },
          prescribedBy: response.data.prescribedBy || {
            firstName: "Unknown",
            lastName: "",
          },
          deliveryStatus: response.data.deliveryStatus || "PENDING",
          drugName: response.data.drugName || "Unknown",
          dosage: response.data.dosage || "Not specified",
          frequency: response.data.frequency || "Not specified",
          duration: response.data.duration || "Not specified",
          instructions: response.data.instructions || "No special instructions",
          deliveredAt: response.data.deliveredAt,
          deliveredBy: response.data.deliveredBy
            ? `${response.data.deliveredBy.firstName} ${
                response.data.deliveredBy.lastName || ""
              }`.trim()
            : "Unknown",
          healthcareProviderName: response.data.prescribedBy
            ? `${response.data.prescribedBy.firstName} ${
                response.data.prescribedBy.lastName || ""
              }`.trim()
            : "Unknown",
        };
        setSelectedPrescription(transformedPrescription);
        setActiveTab("prescriptions");
        setTimeout(() => {
          const detailsElement = document.getElementById(
            "prescription-details"
          );
          if (detailsElement) {
            detailsElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      } else {
        throw new Error(
          response.error?.message || "Failed to fetch prescription details"
        );
      }
    } catch (err) {
      console.error("Error fetching prescription:", err);
      addNotification(
        err.message || "Failed to fetch prescription details",
        "error"
      );
      setSelectedPrescription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getPrescriptionStatusData = () => {
    // Function to get prescription status data for reports
    const statusCounts = prescriptions.reduce((acc, prescription) => {
      acc[prescription.deliveryStatus] =
        (acc[prescription.deliveryStatus] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  };

  const getDrugCategoryData = () => {
    // Function to get drug category data for reports
    const categoryCounts = drugs.reduce((acc, drug) => {
      acc[drug.dosageForm] = (acc[drug.dosageForm] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(categoryCounts).map(([category, count]) => ({
      name: category,
      value: count,
    }));
  };

  const handleShowConfirmDialog = (action, data) => {
    // Function to show confirmation dialog
    setConfirmAction({
      type: action,
      data: data,
      title: action === "delivery" ? "Confirm Delivery" : "Confirm Action",
      message:
        action === "delivery"
          ? "Are you sure you want to confirm the delivery of this prescription?"
          : "Are you sure you want to proceed with this action?",
    });
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    // Function to handle confirmation action
    if (!confirmAction) return;

    try {
      setLoadingStates((prev) => ({ ...prev, delivery: true }));

      switch (confirmAction.type) {
        case "delivery":
          await handleConfirmDelivery(confirmAction.data);
          break;
        default:
          console.warn("Unknown action type:", confirmAction.type);
      }
    } catch (error) {
      console.error("Error in confirm action:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete the action",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, delivery: false }));
      setIsConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  const handleConfirmDelivery = async (prescriptionId) => {
    // Function to confirm prescription delivery
    try {
      const response = await pharmacyService.confirmDrugDelivery(
        prescriptionId
      );
      if (response.success) {
        setPrescriptions((prev) =>
          prev.map((p) =>
            p.id === prescriptionId ? { ...p, deliveryStatus: "DELIVERED" } : p
          )
        );
        toast({
          title: "Success",
          description: "Prescription delivery confirmed successfully",
        });
        fetchData();
        setActivityLog((prev) => [
          {
            id: prev.length + 1,
            action: `Confirmed delivery for prescription ID: ${patients.person.firstName}`,
            user: user.name || "Pharmacist",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "info",
          },
          ...prev,
        ]);
      } else {
        throw new Error(
          response.error?.message || "Failed to confirm delivery"
        );
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      throw error;
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    // Filter prescriptions based on search query
    (prescription) =>
      prescription.patient?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      prescription.prescribedBy?.firstName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredDrugs = drugs.filter(
    // Filter drugs based on search query
    (drug) =>
      drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.genericName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    // Function to get initials from a name
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    // Main return statement for the component's JSX
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notifications={notifications} />{" "}
      {/* Render header with user and notifications */}
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />{" "}
        {/* Render sidebar for navigation */}
        <main className="flex-1 ml-60 pt-16 min-h-screen">
          <div className="container mx-auto px-6 py-8">
            {isLoading ? ( // Show loading spinner if data is loading
              <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? ( // Show error message if data fetch fails
              <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <>
                {activeTab === "dashboard" && ( // Render dashboard if active tab is dashboard
                  <Dashboard
                    prescriptions={prescriptions}
                    drugs={drugs}
                    patients={patients}
                    activityLog={activityLog}
                    loadingStates={loadingStates}
                    onViewPrescriptions={() => {
                      setActiveTab("prescriptions");
                      setSelectedPrescription(null);
                    }}
                  />
                )}
                {activeTab === "prescriptions" && ( // Render prescription list if active tab is prescriptions
                  <PrescriptionList
                    prescriptions={filteredPrescriptions}
                    onViewPrescription={handleViewPrescription}
                    onConfirmDelivery={(prescriptionId) =>
                      handleShowConfirmDialog("delivery", prescriptionId)
                    }
                    loading={loadingStates.prescriptions}
                  />
                )}
                {activeTab === "dispensing" && ( // Render dispensing view if active tab is dispensing
                  <Dispensing
                    prescriptions={prescriptions}
                    onConfirmDelivery={(prescriptionId) =>
                      handleShowConfirmDialog("delivery", prescriptionId)
                    }
                    loading={loadingStates.prescriptions}
                  />
                )}
                {activeTab === "inventory" && ( // Render inventory view if active tab is inventory
                  <Inventory
                    drugs={filteredDrugs}
                    onAddDrug={() => setShowAddDrugDialog(true)}
                    onAddInventory={() => setShowAddInventoryDialog(true)}
                    loading={loadingStates.drugs}
                  />
                )}
                {activeTab === "reports" && ( // Render reports view if active tab is reports
                  <Reports
                    prescriptions={prescriptions}
                    drugs={drugs}
                    loading={loadingStates.prescriptions || loadingStates.drugs}
                  />
                )}
                {activeTab === "patients" && ( // Render patients view if active tab is patients
                  <Patients
                    patients={patients}
                    onViewPatient={(patientId) => {
                      const selectedPatient = patients.find(
                        (p) => p.id === patientId
                      );
                      setSelectedPatient(selectedPatient);
                      setActiveTab("patients");
                    }}
                    selectedPatient={selectedPatient} // Pass selected patient to show details
                    loading={loadingStates.patients}
                  />
                )}
                {activeTab === "prescriptions" &&
                  selectedPrescription && ( // Render prescription details if a prescription is selected
                    <PrescriptionDetails
                      prescription={selectedPrescription}
                      onClose={() => setSelectedPrescription(null)}
                      onConfirmDelivery={handleConfirmDelivery}
                      loadingStates={loadingStates}
                    />
                  )}
              </>
            )}
          </div>
        </main>
      </div>
      {showNewPrescriptionDialog && ( // Render new prescription dialog if visible
        <NewPrescriptionDialog
          open={showNewPrescriptionDialog}
          onClose={() => setShowNewPrescriptionDialog(false)}
          onSubmit={handleNewPrescriptionSubmit}
          patients={patients}
          drugs={drugs}
          newPrescription={newPrescription}
          setNewPrescription={setNewPrescription}
          medicationToAdd={medicationToAdd}
          setMedicationToAdd={setMedicationToAdd}
          onAddMedication={handleAddMedicationToPrescription}
          onRemoveMedication={handleRemoveMedicationFromPrescription}
          formErrors={formErrors}
        />
      )}
      {showAddDrugDialog && ( // Render add drug dialog if visible
        <AddDrugDialog
          open={showAddDrugDialog}
          onClose={() => setShowAddDrugDialog(false)}
          onSubmit={handleNewDrugSubmit}
          newDrug={newDrug}
          setNewDrug={setNewDrug}
          formErrors={formErrors}
        />
      )}
      {showAddInventoryDialog && ( // Render add inventory dialog if visible
        <AddInventoryDialog
          open={showAddInventoryDialog}
          onClose={() => setShowAddInventoryDialog(false)}
          onSubmit={handleNewInventorySubmit}
          newInventory={newInventory}
          setNewInventory={setNewInventory}
          drugs={drugs}
          formErrors={formErrors}
        />
      )}
      <ConfirmDialog // Render confirm dialog if visible
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmAction}
        title={confirmAction?.title || "Confirm Action"}
        message={confirmAction?.message || "Are you sure you want to proceed?"}
        isLoading={loadingStates.delivery}
      />
    </div>
  );
}
