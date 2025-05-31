"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { format } from "date-fns";
import {
  Search,
  PillIcon,
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
  UsersRound,
  FileDown,
  ClipboardList,
  Package,
  Clock,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "../../components/ui/use-toast";
import pharmacyService from "../../services/pharmacist.service";
import authService from "../../services/auth.service";

const COLORS = {
  PENDING: "#eab308",
  DELIVERED: "#22c55e",
  default: "#ef4444",
};

export default function PharmacistPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showNewPrescriptionDialog, setShowNewPrescriptionDialog] = useState(false);
  const [showAddDrugDialog, setShowAddDrugDialog] = useState(false);
  const [showAddInventoryDialog, setShowAddInventoryDialog] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    hospitalId: "1",
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
  const [userRole, setUserRole] = useState(null);

  const navigation = [
    { name: "Dashboard", value: "dashboard", icon: PillIcon },
    { name: "Prescriptions", value: "prescriptions", icon: ClipboardList },
    { name: "Dispensing", value: "dispensing", icon: Package },
    { name: "Inventory", value: "inventory", icon: ArchiveBoxIcon },
    { name: "Reports", value: "reports", icon: BarChart3 },
    { name: "Patients", value: "patients", icon: UserGroupIcon },
  ];

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserRole(user.role);
    };
    checkAuth();
  }, [navigate]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "inventory" || activeTab === "dashboard") {
        setLoadingStates(prev => ({ ...prev, drugs: true }));
        const drugResponse = await pharmacyService.fetchDrugs();
        if (drugResponse.success) {
          setDrugs(drugResponse.data || []);
        } else {
          throw new Error(drugResponse.error?.message || "Failed to fetch drugs");
        }
        setLoadingStates(prev => ({ ...prev, drugs: false }));
      }

      if (activeTab === "prescriptions" || activeTab === "dispensing" || activeTab === "dashboard") {
        setLoadingStates(prev => ({ ...prev, prescriptions: true }));
        const response = await pharmacyService.getPrescriptions();
        if (response.success) {
          // Transform prescription data to ensure consistent structure
          const transformedPrescriptions = (response.data || []).map(p => ({
            ...p,
            patient: p.patient || { name: "Unknown" },
            prescribedBy: p.prescribedBy || { firstName: "Unknown", lastName: "" },
            deliveryStatus: p.deliveryStatus || "PENDING"
          }));
          setPrescriptions(transformedPrescriptions);
        } else {
          throw new Error(response.error?.message || "Failed to fetch prescriptions");
        }
        setLoadingStates(prev => ({ ...prev, prescriptions: false }));
      }

      if (activeTab === "patients" || activeTab === "prescriptions") {
        setLoadingStates(prev => ({ ...prev, patients: true }));
        const patientResponse = await pharmacyService.getPatients();
        if (patientResponse.success) {
          setPatients(patientResponse.data || []);
        } else {
          throw new Error(patientResponse.error?.message || "Failed to fetch patients");
        }
        setLoadingStates(prev => ({ ...prev, patients: false }));
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

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.prescribedBy?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDrugs = drugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.genericName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addNotification = (message, type = "info") => {
    const newNotification = {
      id: notifications.length > 0 ? Math.max(...notifications.map((n) => n.id)) + 1 : 1,
      message,
      time: "Just now",
      type,
    };
    setNotifications(prev => [newNotification, ...prev]);
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
        setDrugs(prev => [...prev, response.data]);
        setNewDrug({
          name: "",
          genericName: "",
          dosageForm: "TABLET",
          strength: "",
          manufacturer: "",
          reorderLevel: 0,
        });
        setShowAddDrugDialog(false);
        addNotification(response.message || "Drug added successfully", "success");
        setActivityLog(prev => [
          {
            id: prev.length + 1,
            action: `Added drug: ${response.data.name}`,
            user: "Pharmacist",
            time: "Just now",
            type: "info",
          },
          ...prev
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
        purchaseDate: newInventory.purchaseDate ? new Date(newInventory.purchaseDate).toISOString() : undefined,
      });
      if (response.success) {
        setDrugs(prev =>
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
        addNotification(response.message || "Inventory added successfully", "success");
        setActivityLog(prev => [
          {
            id: prev.length + 1,
            action: `Added inventory for drug ID: ${newInventory.drugId}`,
            user: "Pharmacist",
            time: "Just now",
            type: "info",
          },
          ...prev
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
      const response = await pharmacyService.createPrescription(newPrescription);
      if (response.success) {
        setPrescriptions(prev => [...prev, ...response.data]);
        setNewPrescription({
          patientId: "",
          hospitalId: "1",
          notes: "",
          drugs: [],
        });
        setShowNewPrescriptionDialog(false);
        addNotification(response.message || "Prescription created successfully", "success");
        setActivityLog(prev => [
          {
            id: prev.length + 1,
            action: `Created prescription for patient ID: ${newPrescription.patientId}`,
            user: "Pharmacist",
            time: "Just now",
            type: "info",
          },
          ...prev
        ]);
      } else {
        throw new Error(response.error?.message || "Failed to create prescription");
      }
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMedicationToPrescription = () => {
    setNewPrescription(prev => ({
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
    setNewPrescription(prev => ({
      ...prev,
      drugs: prev.drugs.filter((_, i) => i !== index),
    }));
  };

  const handleViewPrescription = async (prescription) => {
    try {
      if (!prescription || !prescription.id) {
        throw new Error("Invalid prescription data");
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(prescription.id)) {
        throw new Error("Invalid prescription ID format");
      }

      setIsLoading(true);
      console.log("Fetching prescription with ID:", prescription.id); // Debug log
      
      const response = await pharmacyService.getPrescription(prescription.id);
      console.log("Prescription response:", response); // Debug log
      
      if (response.success && response.data) {
        // Transform the prescription data to match the expected structure
        const transformedPrescription = {
          ...response.data,
          patient: response.data.patient || { name: "Unknown" },
          prescribedBy: response.data.prescribedBy || { firstName: "Unknown", lastName: "" },
          deliveryStatus: response.data.deliveryStatus || "PENDING",
          drugName: response.data.drugName || "Unknown",
          dosage: response.data.dosage || "Not specified",
          frequency: response.data.frequency || "Not specified",
          duration: response.data.duration || "Not specified",
          instructions: response.data.instructions || "No special instructions"
        };

        setSelectedPrescription(transformedPrescription);
        setActiveTab("prescriptions");
        
        // Scroll to details section after a short delay to ensure DOM is updated
        setTimeout(() => {
          const detailsElement = document.getElementById("prescription-details");
          if (detailsElement) {
            detailsElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      } else {
        throw new Error(response.error?.message || "Failed to fetch prescription details");
      }
    } catch (err) {
      console.error("Error fetching prescription:", err);
      addNotification(err.message || "Failed to fetch prescription details", "error");
      setSelectedPrescription(null); // Clear selected prescription on error
    } finally {
      setIsLoading(false);
    }
  };

  const getPrescriptionStatusData = () => {
    const statusCounts = prescriptions.reduce((acc, prescription) => {
      acc[prescription.deliveryStatus] = (acc[prescription.deliveryStatus] || 0) + 1;
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
    setConfirmAction({ action, data });
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.action) {
        case 'delivery':
          await handleConfirmDelivery(confirmAction.data);
          break;
        case 'deleteDrug':
          await handleDeleteDrug(confirmAction.data);
          break;
        default:
          throw new Error("Unknown action");
      }
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setIsConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  const handleConfirmDelivery = async (prescriptionId) => {
    try {
      setLoadingStates(prev => ({ ...prev, delivery: true }));
      console.log("Confirming delivery for prescription:", prescriptionId); // Debug log
      
      const response = await pharmacyService.confirmDrugDelivery(prescriptionId);
      console.log("Delivery confirmation response:", response); // Debug log
      
      if (response.success && response.data) {
        // Update prescriptions list with transformed data
        setPrescriptions(prev => 
          prev.map(p => 
            p.id === prescriptionId 
              ? {
                  ...p,
                  ...response.data,
                  patient: response.data.patient || p.patient,
                  prescribedBy: response.data.prescribedBy || p.prescribedBy,
                  deliveryStatus: "DELIVERED",
                  deliveredAt: new Date().toISOString()
                }
              : p
          )
        );

        // Update selected prescription if it's the one being delivered
        if (selectedPrescription?.id === prescriptionId) {
          setSelectedPrescription(prev => ({
            ...prev,
            ...response.data,
            patient: response.data.patient || prev.patient,
            prescribedBy: response.data.prescribedBy || prev.prescribedBy,
            deliveryStatus: "DELIVERED",
            deliveredAt: new Date().toISOString()
          }));
        }

        addNotification("Delivery confirmed successfully", "success");
        
        // Add to activity log
        setActivityLog(prev => [
          {
            id: prev.length + 1,
            action: `Confirmed delivery for prescription #${prescriptionId}`,
            user: "Pharmacist",
            time: "Just now",
            type: "success",
          },
          ...prev
        ]);

        // Refresh prescriptions list
        const prescriptionsResponse = await pharmacyService.getPrescriptions();
        if (prescriptionsResponse.success) {
          const updatedPrescriptions = prescriptionsResponse.data.map(p => ({
            ...p,
            patient: p.patient || { name: "Unknown" },
            prescribedBy: p.prescribedBy || { firstName: "Unknown", lastName: "" },
            deliveryStatus: p.deliveryStatus || "PENDING"
          }));
          setPrescriptions(updatedPrescriptions);
        }
      } else {
        throw new Error(response.error?.message || "Failed to confirm delivery");
      }
    } catch (err) {
      console.error("Delivery confirmation error:", err);
      addNotification(err.message || "Failed to confirm delivery", "error");
    } finally {
      setLoadingStates(prev => ({ ...prev, delivery: false }));
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white z-50">
        <div className="flex items-center h-16 px-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Ethiopia e-Health</h1>
        </div>
        <nav className="px-4 mt-6">
          <ul>
            {navigation.map((item) => (
              <li key={item.name} className="mb-4">
                <button
                  onClick={() => setActiveTab(item.value)}
                  className={`flex items-center w-full px-2 py-2 rounded-lg text-left ${
                    activeTab === item.value
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <item.icon className="w-6 h-6 mr-3" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 pl-64">
        <main className="p-6">
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="dashboard">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Pharmacy Dashboard</h2>
                  <div className="flex space-x-2">
                    <Button onClick={() => setShowNewPrescriptionDialog(true)}>
                      New Prescription
                    </Button>
                    {["PHARMACIST", "SUPERADMIN"].includes(userRole) && (
                      <Dialog open={showAddDrugDialog} onOpenChange={setShowAddDrugDialog}>
                        <DialogTrigger asChild>
                          <Button>Add Drug</Button>
                        </DialogTrigger>
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
                                onChange={(e) =>
                                  setNewDrug({ ...newDrug, name: e.target.value })
                                }
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
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Today's Prescriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{prescriptions.length}</p>
                      <p className="text-sm text-gray-500">
                        Pending: {prescriptions.filter((p) => p.deliveryStatus === "PENDING").length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Inventory Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{drugs.length}</p>
                      <p className="text-sm text-gray-500">
                        Low Stock:{" "}
                        {
                          drugs.filter(
                            (d) =>
                              d.inventory.reduce((sum, i) => sum + i.quantity, 0) <=
                              d.reorderLevel
                          ).length
                        }
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activityLog.slice(0, 3).map((log) => (
                        <div key={log.id} className="mb-2">
                          <p className="text-sm">{log.action}</p>
                          <p className="text-xs text-gray-500">{log.time}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prescriptions">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Prescription Management</h2>
                  <Button onClick={() => setShowNewPrescriptionDialog(true)}>
                    Create New Prescription
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle>Prescription List</CardTitle>
                      <div className="mt-2">
                        <Input
                          placeholder="Search prescriptions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingStates.prescriptions ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : filteredPrescriptions.length === 0 ? (
                        <p className="text-center text-gray-500">No prescriptions found</p>
                      ) : (
                        filteredPrescriptions.map((prescription) => (
                          <div
                            key={prescription.id}
                            className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                              selectedPrescription?.id === prescription.id ? "bg-green-50" : ""
                            }`}
                            onClick={() => handleViewPrescription(prescription)}
                          >
                            <p className="font-medium">
                              #{prescription.id} - {prescription.patient?.name || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {prescription.prescribedBy?.firstName} {prescription.prescribedBy?.lastName}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <Badge variant={prescription.deliveryStatus === "DELIVERED" ? "success" : "warning"}>
                                {prescription.deliveryStatus}
                              </Badge>
                              {prescription.deliveryStatus === "PENDING" && (
                                <Button 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowConfirmDialog('delivery', prescription.id);
                                  }}
                                  disabled={loadingStates.delivery}
                                >
                                  {loadingStates.delivery ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Confirming...
                                    </>
                                  ) : (
                                    "Confirm Delivery"
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Prescription Details</CardTitle>
                    </CardHeader>
                    <CardContent id="prescription-details">
                      {loadingStates.prescriptions ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : selectedPrescription ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="font-medium text-gray-500">Patient</p>
                              <p className="text-lg">{selectedPrescription.patient?.name || "Unknown"}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">Prescribed By</p>
                              <p className="text-lg">
                                {selectedPrescription.prescribedBy?.firstName} {selectedPrescription.prescribedBy?.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">Drug Name</p>
                              <p className="text-lg">{selectedPrescription.drugName}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">Dosage</p>
                              <p className="text-lg">{selectedPrescription.dosage}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">Frequency</p>
                              <p className="text-lg">{selectedPrescription.frequency}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">Duration</p>
                              <p className="text-lg">{selectedPrescription.duration}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">Status</p>
                              <Badge variant={selectedPrescription.deliveryStatus === "DELIVERED" ? "success" : "warning"}>
                                {selectedPrescription.deliveryStatus}
                              </Badge>
                            </div>
                            {selectedPrescription.deliveredAt && (
                              <div>
                                <p className="font-medium text-gray-500">Delivered At</p>
                                <p className="text-lg">
                                  {new Date(selectedPrescription.deliveredAt).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                          {selectedPrescription.instructions && (
                            <div>
                              <p className="font-medium text-gray-500">Instructions</p>
                              <p className="text-lg mt-1">{selectedPrescription.instructions}</p>
                            </div>
                          )}
                          {selectedPrescription.deliveryStatus === "PENDING" && (
                            <div className="mt-4">
                              <Button 
                                onClick={() => handleShowConfirmDialog('delivery', selectedPrescription.id)}
                                disabled={loadingStates.delivery}
                                className="w-full"
                              >
                                {loadingStates.delivery ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirming...
                                  </>
                                ) : (
                                  "Confirm Delivery"
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500">Select a prescription to view details</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dispensing">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Medication Dispensing</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Prescriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingStates.prescriptions ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : prescriptions.filter(p => p.deliveryStatus === "PENDING").length === 0 ? (
                      <p className="text-center text-gray-500">No pending prescriptions</p>
                    ) : (
                      prescriptions
                        .filter((p) => p.deliveryStatus === "PENDING")
                        .map((prescription) => (
                          <div key={prescription.id} className="p-3 border-b">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">
                                  #{prescription.id} - {prescription.patient?.name || "Unknown"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {prescription.drugName} - {prescription.dosage}
                                </p>
                              </div>
                              <Button 
                                onClick={() => handleShowConfirmDialog('delivery', prescription.id)}
                                disabled={loadingStates.delivery}
                              >
                                {loadingStates.delivery ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirming...
                                  </>
                                ) : (
                                  "Confirm Delivery"
                                )}
                              </Button>
                            </div>
                          </div>
                        ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="inventory">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Medication Inventory</h2>
                  <div className="flex space-x-2">
                    {["PHARMACIST", "SUPERADMIN"].includes(userRole) && (
                      <Dialog open={showAddDrugDialog} onOpenChange={setShowAddDrugDialog}>
                        <DialogTrigger asChild>
                          <Button>Add Drug</Button>
                        </DialogTrigger>
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
                                onChange={(e) =>
                                  setNewDrug({ ...newDrug, name: e.target.value })
                                }
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
                          <th>Name</th>
                          <th>Dosage Form</th>
                          <th>Strength</th>
                          <th>Stock</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDrugs.map((drug) => (
                          <tr key={drug.id}>
                            <td>{drug.name}</td>
                            <td>{drug.dosageForm}</td>
                            <td>{drug.strength}</td>
                            <td>{drug.inventory.reduce((sum, i) => sum + i.quantity, 0)}</td>
                            <td>{drug.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Pharmacy Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Prescription Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPrescriptionStatusData()}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label
                          >
                            {getPrescriptionStatusData().map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.name] || COLORS.default}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Drug Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getDrugCategoryData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="patients">
              <div>
                <h2 className="text-2xl font-bold mb-4">Patients</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Patient List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patients.map((patient) => (
                      <div key={patient.id} className="p-3 border-b">
                        <p>{patient.name}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Dialogs */}
          <Dialog open={showNewPrescriptionDialog} onOpenChange={setShowNewPrescriptionDialog}>
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
                      setNewPrescription({ ...newPrescription, notes: e.target.value })
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
                        setMedicationToAdd({ ...medicationToAdd, dosage: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Frequency"
                      value={medicationToAdd.frequency}
                      onChange={(e) =>
                        setMedicationToAdd({ ...medicationToAdd, frequency: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Duration"
                      value={medicationToAdd.duration}
                      onChange={(e) =>
                        setMedicationToAdd({ ...medicationToAdd, duration: e.target.value })
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
                    <Button onClick={handleAddMedicationToPrescription}>Add Medication</Button>
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

          <Dialog open={showAddInventoryDialog} onOpenChange={setShowAddInventoryDialog}>
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
                      setNewInventory({ ...newInventory, batchNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Expiration Date</Label>
                  <Input
                    type="date"
                    value={newInventory.expirationDate}
                    onChange={(e) =>
                      setNewInventory({ ...newInventory, expirationDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={newInventory.quantity}
                    onChange={(e) =>
                      setNewInventory({ ...newInventory, quantity: Number(e.target.value) })
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
                      setNewInventory({ ...newInventory, purchaseDate: e.target.value })
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

          {/* Add Confirmation Dialog */}
          <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogDescription>
                  Are you sure you want to confirm the delivery of this prescription?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmDialogOpen(false)}
                  disabled={loadingStates.delivery}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  disabled={loadingStates.delivery}
                >
                  {loadingStates.delivery ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
