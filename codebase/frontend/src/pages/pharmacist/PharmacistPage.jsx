"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
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
} from "lucide-react";
import {
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "../../components/ui/use-toast";
import pharmacyService from "../../services/pharmacist.service";
import authService from "../../services/auth.service";

import Sidebar from "@/pages/pharmacist/Sidebar";
import Dashboard from "@/pages/pharmacist/Dashboard";
import PrescriptionList from "@/pages/pharmacist/PrescriptionList";
import PrescriptionDetails from "@/pages/pharmacist/PrescriptionDetails";
import Dispensing from "@/pages/pharmacist/Dispensing";
import Inventory from "@/pages/pharmacist/Inventory";
import Reports from "@/pages/pharmacist/Reports";
import Patients from "@/pages/pharmacist/Patients";
import NewPrescriptionDialog from "@/pages/pharmacist/NewPrescriptionDialog";
import AddDrugDialog from "@/pages/pharmacist/AddDrugDialog";
import AddInventoryDialog from "@/pages/pharmacist/AddInventoryDialog";
import ConfirmDialog from "@/pages/pharmacist/ConfirmDialog";

const COLORS = {
  PENDING: "#eab308", // Yellow
  DELIVERED: "#22c55e", // Green
  default: "#ef4444", // Red
};

export default function PharmacistPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isInitialMount = useRef(true);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showNewPrescriptionDialog, setShowNewPrescriptionDialog] =
    useState(false);
  const [showAddDrugDialog, setShowAddDrugDialog] = useState(false);
  const [showAddInventoryDialog, setShowAddInventoryDialog] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    notes: "",
    drugs: [],
  });
  const [newDrug, setNewDrug] = useState({
    name: "",
    genericName: "",
    dosageForm: "TABLET",
    strength: "",
    manufacturer: "",
    reorderLevel: 0,
  });
  const [newInventory, setNewInventory] = useState({
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
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: 0,
    instructions: "",
  });
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activityLog, setActivityLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    drugs: false,
    prescriptions: false,
    patients: false,
    delivery: false,
  });
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || "Pharmacist",
    role: localStorage.getItem("userRole") || "PHARMACIST",
    avatar: localStorage.getItem("userAvatar") || null,
  });
  const [formErrors, setFormErrors] = useState({});

  const cardClass = "bg-gray-100 shadow rounded-lg p-4"; // Consistent gray card style

  const navigation = [
    { name: "Dashboard", value: "dashboard", icon: Pill },
    { name: "Prescriptions", value: "prescriptions", icon: ClipboardList },
    { name: "Dispensing", value: "dispensing", icon: Package },
    { name: "Inventory", value: "inventory", icon: ArchiveBoxIcon },
    { name: "Reports", value: "reports", icon: BarChart3 },
    { name: "Patients", value: "patients", icon: UserGroupIcon },
  ];

  const getFirstNameFromEmail = (email) => {
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
            duration: p.dosage || "Not specified",
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
    fetchData();
  }, [fetchData]);

  const addNotification = (message, type = "info") => {
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
    try {
      setIsLoading(true);
      const response = await pharmacyService.createPrescription(
        newPrescription
      );
      if (response.success) {
        setPrescriptions((prev) => [...prev, ...response.data]);
        setNewPrescription({
          patientId: "",
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
    setNewPrescription((prev) => ({
      ...prev,
      drugs: prev.drugs.filter((_, i) => i !== index),
    }));
  };

  const handleViewPrescription = async (prescription) => {
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
          description: "Confirmed",
        });
        fetchData();
        const deliveredPrescription = prescriptions.find(
          (p) => p.id === prescriptionId
        );
        const patientName = deliveredPrescription?.patient?.name || "Unknown";
        setActivityLog((prev) => [
          {
            id: prev.length + 1,
            action: `Confirmed prescription delivery  to: ${patientName}`,
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
    (prescription) =>
      prescription.patient?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      prescription.prescribedBy?.firstName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredDrugs = drugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.genericName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#fdf9f5]">
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 ml-60 min-h-screen">
          <div className="container mx-auto px-6 py-8">
            {isLoading ? (
              <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <>
                {activeTab === "dashboard" && (
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
                    cardClass={cardClass}
                  />
                )}
                {activeTab === "prescriptions" && (
                  <PrescriptionList
                    prescriptions={filteredPrescriptions}
                    onViewPrescription={handleViewPrescription}
                    onConfirmDelivery={(prescriptionId) =>
                      handleShowConfirmDialog("delivery", prescriptionId)
                    }
                    loading={loadingStates.prescriptions}
                    cardClass={cardClass}
                  />
                )}
                {activeTab === "dispensing" && (
                  <Dispensing
                    prescriptions={prescriptions}
                    onConfirmDelivery={(prescriptionId) =>
                      handleShowConfirmDialog("delivery", prescriptionId)
                    }
                    loading={loadingStates.prescriptions}
                    cardClass={cardClass}
                  />
                )}
                {activeTab === "inventory" && (
                  <Inventory
                    drugs={filteredDrugs}
                    onAddDrug={() => setShowAddDrugDialog(true)}
                    onAddInventory={() => setShowAddInventoryDialog(true)}
                    loading={loadingStates.drugs}
                    cardClass={cardClass}
                  />
                )}
                {activeTab === "reports" && (
                  <Reports
                    prescriptions={prescriptions}
                    drugs={drugs}
                    loading={loadingStates.prescriptions || loadingStates.drugs}
                    cardClass={cardClass}
                  />
                )}
                {activeTab === "patients" && (
                  <Patients
                    patients={patients}
                    onViewPatient={(patientId) => {
                      const selectedPatient = patients.find(
                        (p) => p.id === patientId
                      );
                      setSelectedPatient(selectedPatient);
                      setActiveTab("patients");
                    }}
                    selectedPatient={selectedPatient}
                    loading={loadingStates.patients}
                    cardClass={cardClass}
                  />
                )}
                {activeTab === "prescriptions" && selectedPrescription && (
                  <PrescriptionDetails
                    prescription={selectedPrescription}
                    onClose={() => setSelectedPrescription(null)}
                    onConfirmDelivery={handleConfirmDelivery}
                    loadingStates={loadingStates}
                    colors={COLORS}
                    cardClass={cardClass}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
      {showNewPrescriptionDialog && (
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
          cardClass="bg-gray-100 shadow rounded-lg p-6" // Slightly more padding for dialog
        />
      )}
      {showAddDrugDialog && (
        <AddDrugDialog
          open={showAddDrugDialog}
          onClose={() => setShowAddDrugDialog(false)}
          onSubmit={handleNewDrugSubmit}
          newDrug={newDrug}
          setNewDrug={setNewDrug}
          formErrors={formErrors}
          cardClass="bg-gray-100 shadow rounded-lg p-6"
        />
      )}
      {showAddInventoryDialog && (
        <AddInventoryDialog
          open={showAddInventoryDialog}
          onClose={() => setShowAddInventoryDialog(false)}
          onSubmit={handleNewInventorySubmit}
          newInventory={newInventory}
          setNewInventory={setNewInventory}
          drugs={drugs}
          formErrors={formErrors}
          cardClass="bg-gray-100 shadow rounded-lg p-6"
        />
      )}
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmAction}
        title={confirmAction?.title || "Confirm Action"}
        message={confirmAction?.message || "Are you sure you want to proceed?"}
        isLoading={loadingStates.delivery}
        cardClass="bg-gray-100 shadow rounded-lg p-6"
      />
    </div>
  );
}
