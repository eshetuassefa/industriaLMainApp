"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  ResponsiveContainer
} from 'recharts';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Add this after the imports
const COLORS = {
  Filled: '#22c55e',
  Pending: '#eab308',
  'Ready for Pickup': '#3b82f6',
  'Picked Up': '#6b7280',
  default: '#ef4444'
};

// Sample data
const initialPatients = [
  {
    id: 1,
    name: "John Doe",
    dob: "1985-05-15",
    contact: "555-123-4567",
    email: "john.doe@example.com",
    address: "123 Main St",
    insurance: "BlueCross #12345",
    allergies: "Penicillin",
  },
  {
    id: 2,
    name: "Jane Smith",
    dob: "1990-08-22",
    contact: "555-987-6543",
    email: "jane.smith@example.com",
    address: "456 Oak Ave",
    insurance: "Aetna #67890",
    allergies: "None",
  },
  {
    id: 3,
    name: "Robert Johnson",
    dob: "1978-03-30",
    contact: "555-456-7890",
    email: "robert.j@example.com",
    address: "789 Pine Rd",
    insurance: "UnitedHealth #54321",
    allergies: "Sulfa drugs",
  },
  {
    id: 4,
    name: "Emily Davis",
    dob: "1995-11-12",
    contact: "555-789-0123",
    email: "emily.d@example.com",
    address: "321 Elm St",
    insurance: "Cigna #09876",
    allergies: "Aspirin",
  },
];

const initialPrescriptions = [
  {
    id: 1,
    patientId: 1,
    patientName: "John Doe",
    doctor: "Dr. Sarah Wilson",
    dateIssued: "2024-04-25",
    expiryDate: "2024-07-25",
    status: "Pending",
    medications: [
      {
        id: 1,
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        quantity: 30,
        instructions: "Take in the morning",
      },
      {
        id: 2,
        name: "Atorvastatin",
        dosage: "20mg",
        frequency: "Once daily",
        quantity: 30,
        instructions: "Take in the evening",
      },
    ],
    notes: "Patient has hypertension and high cholesterol",
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Jane Smith",
    doctor: "Dr. Michael Chen",
    dateIssued: "2024-04-26",
    expiryDate: "2024-05-26",
    status: "Filled",
    medications: [
      {
        id: 3,
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        quantity: 60,
        instructions: "Take with meals",
      },
    ],
    notes: "Patient has type 2 diabetes",
  },
  {
    id: 3,
    patientId: 3,
    patientName: "Robert Johnson",
    doctor: "Dr. Lisa Brown",
    dateIssued: "2024-04-27",
    expiryDate: "2024-05-27",
    status: "Ready for Pickup",
    medications: [
      {
        id: 4,
        name: "Ibuprofen",
        dosage: "600mg",
        frequency: "Three times daily",
        quantity: 30,
        instructions: "Take with food",
      },
      {
        id: 5,
        name: "Cyclobenzaprine",
        dosage: "10mg",
        frequency: "Three times daily",
        quantity: 30,
        instructions: "May cause drowsiness",
      },
    ],
    notes: "For back pain and muscle spasms",
  },
  {
    id: 4,
    patientId: 4,
    patientName: "Emily Davis",
    doctor: "Dr. James Taylor",
    dateIssued: "2024-04-28",
    expiryDate: "2024-05-28",
    status: "Picked Up",
    medications: [
      {
        id: 6,
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "Three times daily",
        quantity: 21,
        instructions: "Complete full course",
      },
    ],
    notes: "For skin infection",
  },
];

const initialMedications = [
  {
    id: 1,
    name: "Lisinopril",
    category: "Antihypertensive",
    stock: 120,
    unit: "tablets",
    reorderLevel: 30,
    supplier: "PharmaCorp",
    price: 15.99,
  },
  {
    id: 2,
    name: "Atorvastatin",
    category: "Statin",
    stock: 85,
    unit: "tablets",
    reorderLevel: 25,
    supplier: "MediSource",
    price: 22.5,
  },
  {
    id: 3,
    name: "Metformin",
    category: "Antidiabetic",
    stock: 150,
    unit: "tablets",
    reorderLevel: 40,
    supplier: "PharmaCorp",
    price: 12.75,
  },
  {
    id: 4,
    name: "Ibuprofen",
    category: "NSAID",
    stock: 200,
    unit: "tablets",
    reorderLevel: 50,
    supplier: "MediSource",
    price: 8.99,
  },
  {
    id: 5,
    name: "Cyclobenzaprine",
    category: "Muscle Relaxant",
    stock: 45,
    unit: "tablets",
    reorderLevel: 20,
    supplier: "HealthSupply",
    price: 18.25,
  },
  {
    id: 6,
    name: "Amoxicillin",
    category: "Antibiotic",
    stock: 75,
    unit: "capsules",
    reorderLevel: 30,
    supplier: "HealthSupply",
    price: 14.5,
  },
  {
    id: 7,
    name: "Sertraline",
    category: "SSRI",
    stock: 60,
    unit: "tablets",
    reorderLevel: 20,
    supplier: "PharmaCorp",
    price: 25.99,
  },
  {
    id: 8,
    name: "Albuterol",
    category: "Bronchodilator",
    stock: 40,
    unit: "inhalers",
    reorderLevel: 15,
    supplier: "MediSource",
    price: 45.0,
  },
  {
    id: 9,
    name: "Levothyroxine",
    category: "Thyroid Hormone",
    stock: 90,
    unit: "tablets",
    reorderLevel: 30,
    supplier: "HealthSupply",
    price: 19.75,
  },
  {
    id: 10,
    name: "Omeprazole",
    category: "Proton Pump Inhibitor",
    stock: 110,
    unit: "capsules",
    reorderLevel: 35,
    supplier: "PharmaCorp",
    price: 16.25,
  },
];

export default function PharmacyPage() {
  const [patients, setPatients] = useState(initialPatients);
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [medications, setMedications] = useState(initialMedications);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showNewPrescriptionDialog, setShowNewPrescriptionDialog] = useState(false);
  const [showDispenseMedicationDialog, setShowDispenseMedicationDialog] = useState(false);
  const [showAddMedicationDialog, setShowAddMedicationDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    doctor: "",
    dateIssued: format(new Date(), "yyyy-MM-dd"),
    expiryDate: format(
      new Date(new Date().setMonth(new Date().getMonth() + 1)),
      "yyyy-MM-dd"
    ),
    medications: [],
    notes: "",
  });
  const [newMedication, setNewMedication] = useState({
    name: "",
    category: "",
    stock: 0,
    unit: "tablets",
    reorderLevel: 0,
    supplier: "",
    price: 0,
  });
  const [medicationToAdd, setMedicationToAdd] = useState({
    medicationId: "",
    dosage: "",
    frequency: "",
    quantity: 0,
    instructions: "",
  });
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Low stock alert: Cyclobenzaprine (15 remaining)",
      time: "10 minutes ago",
      type: "warning",
    },
    {
      id: 2,
      message: "Prescription #3 is ready for pickup",
      time: "30 minutes ago",
      type: "info",
    },
    {
      id: 3,
      message: "New prescription received for John Doe",
      time: "1 hour ago",
      type: "info",
    },
  ]);
  const [activeTab, setActiveTab] = useState("prescriptions");
  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      action: "Prescription #3 status changed to Ready for Pickup",
      user: "Pharmacist",
      time: "10 minutes ago",
      type: "info"
    },
    {
      id: 2,
      action: "Medication stock updated: Lisinopril (+50)",
      user: "Inventory Manager",
      time: "1 hour ago",
      type: "info"
    },
    {
      id: 3,
      action: "New prescription created for John Doe",
      user: "Pharmacist",
      time: "2 hours ago",
      type: "info"
    },
    {
      id: 4,
      action: "Low stock alert: Cyclobenzaprine (15 remaining)",
      user: "System",
      time: "3 hours ago",
      type: "warning"
    },
    {
      id: 5,
      action: "Prescription #2 status changed to Picked Up",
      user: "Pharmacist",
      time: "4 hours ago",
      type: "info"
    }
  ]);
  const [user, setUser] = useState({
    name: "John Smith", // This would come from your authentication system
    role: "Pharmacist"
  });

  // Filter prescriptions based on search query
  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patientName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      prescription.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter medications based on search query
  const filteredMedications = medications.filter(
    (medication) =>
      medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle prescription selection
  const handlePrescriptionSelect = (prescription) => {
    setSelectedPrescription(prescription);
  };

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setNewPrescription({
      ...newPrescription,
      patientId: patient.id.toString(),
    });
  };

  // Handle new prescription form submission
  const handleNewPrescriptionSubmit = () => {
    const newPrescriptionId =
      prescriptions.length > 0
        ? Math.max(...prescriptions.map((p) => p.id)) + 1
        : 1;
    const selectedPatientData = patients.find(
      (p) => p.id === Number.parseInt(newPrescription.patientId)
    );

    const prescriptionToAdd = {
      ...newPrescription,
      id: newPrescriptionId,
      patientName: selectedPatientData.name,
      status: "Pending",
    };

    setPrescriptions([...prescriptions, prescriptionToAdd]);
    setNewPrescription({
      patientId: "",
      doctor: "",
      dateIssued: format(new Date(), "yyyy-MM-dd"),
      expiryDate: format(
        new Date(new Date().setMonth(new Date().getMonth() + 1)),
        "yyyy-MM-dd"
      ),
      medications: [],
      notes: "",
    });
    setShowNewPrescriptionDialog(false);

    // Add notification
    addNotification(
      `New prescription created for ${selectedPatientData.name}`,
      "info"
    );
  };

  // Handle adding medication to prescription
  const handleAddMedicationToPrescription = () => {
    const selectedMedication = medications.find(
      (m) => m.id === Number.parseInt(medicationToAdd.medicationId)
    );

    if (selectedMedication) {
      const newMedicationItem = {
        id:
          newPrescription.medications.length > 0
            ? Math.max(...newPrescription.medications.map((m) => m.id)) + 1
            : 1,
        name: selectedMedication.name,
        dosage: medicationToAdd.dosage,
        frequency: medicationToAdd.frequency,
        quantity: Number.parseInt(medicationToAdd.quantity),
        instructions: medicationToAdd.instructions,
      };

      setNewPrescription({
        ...newPrescription,
        medications: [...newPrescription.medications, newMedicationItem],
      });

      setMedicationToAdd({
        medicationId: "",
        dosage: "",
        frequency: "",
        quantity: 0,
        instructions: "",
      });
    }
  };

  // Handle removing medication from prescription
  const handleRemoveMedicationFromPrescription = (medicationId) => {
    setNewPrescription({
      ...newPrescription,
      medications: newPrescription.medications.filter(
        (m) => m.id !== medicationId
      ),
    });
  };

  // Handle new medication form submission
  const handleNewMedicationSubmit = () => {
    const newMedicationId =
      medications.length > 0
        ? Math.max(...medications.map((m) => m.id)) + 1
        : 1;

    const medicationToAdd = {
      ...newMedication,
      id: newMedicationId,
    };

    setMedications([...medications, medicationToAdd]);
    setNewMedication({
      name: "",
      category: "",
      stock: 0,
      unit: "tablets",
      reorderLevel: 0,
      supplier: "",
      price: 0,
    });
    setShowAddMedicationDialog(false);

    // Add notification
    addNotification(
      `New medication ${medicationToAdd.name} added to inventory`,
      "info"
    );
  };

  // Update prescription status
  const updatePrescriptionStatus = (prescriptionId, newStatus) => {
    const updatedPrescriptions = prescriptions.map((prescription) => {
      if (prescription.id === prescriptionId) {
        // If status is changing to "Filled" or "Ready for Pickup", update medication stock
        if (
          (newStatus === "Filled" || newStatus === "Ready for Pickup") &&
          prescription.status === "Pending"
        ) {
          // Reduce stock for each medication in the prescription
          prescription.medications.forEach((med) => {
            const medicationIndex = medications.findIndex(
              (m) => m.name === med.name
            );
            if (medicationIndex !== -1) {
              const updatedMedications = [...medications];
              updatedMedications[medicationIndex] = {
                ...updatedMedications[medicationIndex],
                stock: updatedMedications[medicationIndex].stock - med.quantity,
              };
              setMedications(updatedMedications);

              // Check if stock is below reorder level
              if (
                updatedMedications[medicationIndex].stock <=
                updatedMedications[medicationIndex].reorderLevel
              ) {
                addNotification(
                  `Low stock alert: ${med.name} (${updatedMedications[medicationIndex].stock} remaining)`,
                  "warning"
                );
              }
            }
          });
        }

        const updatedPrescription = { ...prescription, status: newStatus };

        // Add notification for status change
        const patient = patients.find((p) => p.id === prescription.patientId);
        addNotification(
          `Prescription #${prescription.id} for ${prescription.patientName} is now ${newStatus}`,
          "info"
        );

        return updatedPrescription;
      }
      return prescription;
    });

    setPrescriptions(updatedPrescriptions);
  };

  // Add notification
  const addNotification = (message, type = "info") => {
    const newNotification = {
      id:
        notifications.length > 0
          ? Math.max(...notifications.map((n) => n.id)) + 1
          : 1,
      message,
      time: "Just now",
      type,
    };
    setNotifications([newNotification, ...notifications]);
  };

  // Update medication stock
  const updateMedicationStock = (medicationId, newStock) => {
    const updatedMedications = medications.map((medication) => {
      if (medication.id === medicationId) {
        const updatedMedication = {
          ...medication,
          stock: Number.parseInt(newStock),
        };

        // Check if stock is below reorder level
        if (Number.parseInt(newStock) <= medication.reorderLevel) {
          addNotification(
            `Low stock alert: ${medication.name} (${newStock} remaining)`,
            "warning"
          );
        }

        return updatedMedication;
      }
      return medication;
    });

    setMedications(updatedMedications);
  };

  // Add these functions near the top of the component
  const handleExportReports = () => {
    // Create report data
    const reportData = {
      dispensingSummary: {
        totalPrescriptions: prescriptions.length,
        filledPrescriptions: prescriptions.filter(p => p.status === "Filled").length,
        pickedUp: prescriptions.filter(p => p.status === "Picked Up").length,
      },
      inventorySummary: {
        totalMedications: medications.length,
        lowStockItems: medications.filter(med => med.stock <= med.reorderLevel).length,
        outOfStock: medications.filter(med => med.stock === 0).length,
      },
      topMedications: medications
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 5)
        .map(med => ({
          name: med.name,
          stock: med.stock,
          category: med.category
        })),
      inventoryValue: {
        total: medications.reduce((total, med) => total + med.price * med.stock, 0),
        average: medications.reduce((total, med) => total + med.price, 0) / medications.length,
        lowStock: medications
          .filter(med => med.stock <= med.reorderLevel)
          .reduce((total, med) => total + med.price * med.stock, 0)
      }
    };

    // Convert to CSV format
    const csvContent = [
      // Dispensing Summary
      ["Dispensing Summary"],
      ["Total Prescriptions", reportData.dispensingSummary.totalPrescriptions],
      ["Filled Prescriptions", reportData.dispensingSummary.filledPrescriptions],
      ["Picked Up", reportData.dispensingSummary.pickedUp],
      [],
      // Inventory Summary
      ["Inventory Summary"],
      ["Total Medications", reportData.inventorySummary.totalMedications],
      ["Low Stock Items", reportData.inventorySummary.lowStockItems],
      ["Out of Stock", reportData.inventorySummary.outOfStock],
      [],
      // Top Medications
      ["Top Medications"],
      ["Name", "Stock", "Category"],
      ...reportData.topMedications.map(med => [med.name, med.stock, med.category]),
      [],
      // Inventory Value
      ["Inventory Value"],
      ["Total Value", `$${reportData.inventoryValue.total.toFixed(2)}`],
      ["Average Item Value", `$${reportData.inventoryValue.average.toFixed(2)}`],
      ["Low Stock Value", `$${reportData.inventoryValue.lowStock.toFixed(2)}`]
    ].map(row => row.join(",")).join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pharmacy_report_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Add notification
    addNotification("Report exported successfully", "info");
  };

  const handlePrintPrescription = (prescription) => {
    if (!prescription) return;
    
    // Create a printable version of the prescription
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align: center;">Medical Prescription</h2>
        <div style="margin: 20px 0;">
          <p><strong>Prescription #:</strong> ${prescription.id}</p>
          <p><strong>Patient:</strong> ${prescription.patientName}</p>
          <p><strong>Doctor:</strong> ${prescription.doctor}</p>
          <p><strong>Date Issued:</strong> ${prescription.dateIssued}</p>
          <p><strong>Expiry Date:</strong> ${prescription.expiryDate}</p>
        </div>
        <div style="margin: 20px 0;">
          <h3>Medications:</h3>
          ${prescription.medications.map(med => `
            <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd;">
              <p><strong>${med.name}</strong> - ${med.dosage}</p>
              <p>Frequency: ${med.frequency}</p>
              <p>Quantity: ${med.quantity}</p>
              <p>Instructions: ${med.instructions}</p>
            </div>
          `).join('')}
        </div>
        ${prescription.notes ? `
          <div style="margin: 20px 0;">
            <h3>Notes:</h3>
            <p>${prescription.notes}</p>
          </div>
        ` : ''}
      </div>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription #${prescription.id}</title>
          <style>
            body { margin: 0; padding: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleViewPrescription = (prescription) => {
    if (!prescription) return;
    
    // Set the selected prescription
    setSelectedPrescription(prescription);
    
    // Switch to the prescriptions tab if not already there
    setActiveTab("prescriptions");
    
    // Scroll to the prescription details after a short delay to ensure the DOM is updated
    setTimeout(() => {
      const detailsElement = document.getElementById('prescription-details');
      if (detailsElement) {
        detailsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleFillPrescription = (prescription) => {
    if (!prescription) return;

    // Check if all medications are in stock
    const insufficientMedications = prescription.medications.filter(
      med => medications.find(m => m.name === med.name)?.stock < med.quantity
    );

    if (insufficientMedications.length > 0) {
      // Show warning about insufficient stock
      const medicationNames = insufficientMedications.map(m => m.name).join(', ');
      alert(`Cannot fill prescription. Insufficient stock for: ${medicationNames}`);
      return;
    }

    // Update prescription status
    updatePrescriptionStatus(prescription.id, "Filled");

    // Update medication stock
    prescription.medications.forEach(med => {
      const medication = medications.find(m => m.name === med.name);
      if (medication) {
        updateMedicationStock(medication.id, medication.stock - med.quantity);
      }
    });

    // Add notification
    addNotification(
      `Prescription #${prescription.id} has been filled for ${prescription.patientName}`,
      "info"
    );
  };

  // Add these functions to calculate chart data
  const getPrescriptionStatusData = () => {
    const statusCounts = prescriptions.reduce((acc, prescription) => {
      acc[prescription.status] = (acc[prescription.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  const getMedicationCategoryData = () => {
    const categoryCounts = medications.reduce((acc, medication) => {
      acc[medication.category] = (acc[medication.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts).map(([category, count]) => ({
      name: category,
      value: count
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-white text-black shadow-md z-50">
        <div className="container mx-auto px-4 p-2 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Pharmacy Page</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-black">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 mt-16">
        <div className="flex">
          <div className="fixed left-0 top-16 h-[calc(100vh-5rem)] w-60 bg-gray-50 border-r border-gray-200 z-10 overflow-y-auto">
            <div className="flex flex-col gap-1 p-4">
              {[
                { value: "dashboard", label: "Dashboard", icon: Building2 },
                { value: "prescriptions", label: "Prescriptions", icon: ClipboardList },
                { value: "dispensing", label: "Dispensing", icon: Package },
                { value: "inventory", label: "Inventory", icon: UsersRound },
                { value: "reports", label: "Reports", icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`w-full py-3 px-4 text-left rounded-md text-base font-medium transition-colors hover:bg-gray-100 flex items-center gap-2 ${
                    activeTab === tab.value 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 ml-60 px-6 pb-6">
            {activeTab === "prescriptions" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Prescription Management</h2>
                  <Button onClick={() => setShowNewPrescriptionDialog(true)}>
                    Create New Prescription
                  </Button>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search prescriptions by patient name or doctor..."
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Prescription List</CardTitle>
                        <CardDescription>
                          {filteredPrescriptions.length} prescriptions found
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="max-h-[500px] overflow-y-auto">
                          {filteredPrescriptions.map((prescription) => (
                            <div
                              key={prescription.id}
                              className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                                selectedPrescription?.id === prescription.id
                                  ? "bg-green-50"
                                  : ""
                              }`}
                              onClick={() => handleViewPrescription(prescription)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    #{prescription.id} - {prescription.patientName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {prescription.doctor}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Issued: {prescription.dateIssued}
                                  </p>
                                </div>
                                <Badge
                                  className={
                                    prescription.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                      : prescription.status === "Filled"
                                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                      : prescription.status === "Ready for Pickup"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                                      : prescription.status === "Picked Up"
                                      ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                  }
                                >
                                  {prescription.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="md:col-span-2">
                    {selectedPrescription ? (
                      <Card id="prescription-details">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>
                                Prescription #{selectedPrescription.id}
                              </CardTitle>
                              <CardDescription>
                                Patient: {selectedPrescription.patientName} |
                                Doctor: {selectedPrescription.doctor}
                              </CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => handlePrintPrescription(selectedPrescription)}
                                className="flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                Print Prescription
                              </Button>
                              {selectedPrescription.status === "Pending" && (
                                <Button
                                  onClick={() => handleFillPrescription(selectedPrescription)}
                                  disabled={selectedPrescription.medications.some(
                                    (med) => medications.find((m) => m.name === med.name)?.stock < med.quantity
                                  )}
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Fill Prescription
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                  Date Issued
                                </h3>
                                <p>{selectedPrescription.dateIssued}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                  Expiry Date
                                </h3>
                                <p>{selectedPrescription.expiryDate}</p>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-medium mb-2">
                                Medications
                              </h3>
                              <div className="space-y-2">
                                {selectedPrescription.medications.map(
                                  (medication) => (
                                    <div
                                      key={medication.id}
                                      className="p-3 border rounded-lg"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium">
                                            {medication.name}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            {medication.dosage} •{" "}
                                            {medication.frequency} • Qty:{" "}
                                            {medication.quantity}
                                          </p>
                                          {medication.instructions && (
                                            <p className="text-sm text-gray-500 mt-1">
                                              Instructions:{" "}
                                              {medication.instructions}
                                            </p>
                                          )}
                                        </div>
                                        <div>
                                          {medications.find(
                                            (m) => m.name === medication.name
                                          )?.stock < medication.quantity ? (
                                            <Badge
                                              variant="outline"
                                              className="bg-red-100 text-red-800 border-red-200"
                                            >
                                              Insufficient Stock
                                            </Badge>
                                          ) : (
                                            <Badge
                                              variant="outline"
                                              className="bg-green-100 text-green-800 border-green-200"
                                            >
                                              In Stock
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {selectedPrescription.notes && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                  Notes
                                </h3>
                                <p className="text-sm">
                                  {selectedPrescription.notes}
                                </p>
                              </div>
                            )}

                            <div className="pt-4 border-t">
                              <h3 className="text-lg font-medium mb-2">
                                Patient Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">
                                    Contact
                                  </h4>
                                  <p className="text-sm">
                                    {
                                      patients.find(
                                        (p) =>
                                          p.id === selectedPrescription.patientId
                                      )?.contact
                                    }
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">
                                    Allergies
                                  </h4>
                                  <p className="text-sm">
                                    {patients.find(
                                      (p) => p.id === selectedPrescription.patientId
                                    )?.allergies || "None"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <Clipboard className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-gray-500">
                            Select a prescription to view details
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "dispensing" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Medication Dispensing</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle>Prescriptions Ready for Dispensing</CardTitle>
                      <CardDescription>
                        Manage prescription fulfillment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {prescriptions
                          .filter(
                            (prescription) => prescription.status === "Pending"
                          )
                          .map((prescription) => (
                            <div
                              key={prescription.id}
                              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => handlePrescriptionSelect(prescription)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    #{prescription.id} - {prescription.patientName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {prescription.doctor}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Issued: {prescription.dateIssued}
                                  </p>
                                </div>
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Pending
                                </Badge>
                              </div>
                            </div>
                          ))}
                        {prescriptions.filter(
                          (prescription) => prescription.status === "Pending"
                        ).length === 0 && (
                          <p className="text-gray-500 text-center py-4">
                            No pending prescriptions
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle>Ready for Pickup</CardTitle>
                      <CardDescription>
                        Prescriptions ready for patient pickup
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {prescriptions
                          .filter(
                            (prescription) =>
                              prescription.status === "Ready for Pickup"
                          )
                          .map((prescription) => (
                            <div
                              key={prescription.id}
                              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => handlePrescriptionSelect(prescription)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    #{prescription.id} - {prescription.patientName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {prescription.doctor}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Issued: {prescription.dateIssued}
                                  </p>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                  Ready for Pickup
                                </Badge>
                              </div>
                            </div>
                          ))}
                        {prescriptions.filter(
                          (prescription) =>
                            prescription.status === "Ready for Pickup"
                        ).length === 0 && (
                          <p className="text-gray-500 text-center py-4">
                            No prescriptions ready for pickup
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle>Recently Dispensed</CardTitle>
                      <CardDescription>
                        Prescriptions picked up in the last 7 days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {prescriptions
                          .filter(
                            (prescription) => prescription.status === "Picked Up"
                          )
                          .map((prescription) => (
                            <div
                              key={prescription.id}
                              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => handlePrescriptionSelect(prescription)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    #{prescription.id} - {prescription.patientName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {prescription.doctor}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Issued: {prescription.dateIssued}
                                  </p>
                                </div>
                                <Badge className="bg-gray-100 text-gray-800">
                                  Picked Up
                                </Badge>
                              </div>
                            </div>
                          ))}
                        {prescriptions.filter(
                          (prescription) => prescription.status === "Picked Up"
                        ).length === 0 && (
                          <p className="text-gray-500 text-center py-4">
                            No recently dispensed prescriptions
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Dispensing Queue</CardTitle>
                    <CardDescription>
                      Manage prescription fulfillment workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3">ID</th>
                            <th className="text-left py-2 px-3">Patient</th>
                            <th className="text-left py-2 px-3">Doctor</th>
                            <th className="text-left py-2 px-3">Date Issued</th>
                            <th className="text-left py-2 px-3">Status</th>
                            <th className="text-left py-2 px-3">Medications</th>
                            <th className="text-left py-2 px-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescriptions
                            .filter((prescription) =>
                              ["Pending", "Filled", "Ready for Pickup"].includes(
                                prescription.status
                              )
                            )
                            .map((prescription) => (
                              <tr
                                key={prescription.id}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="py-2 px-3">#{prescription.id}</td>
                                <td className="py-2 px-3">
                                  {prescription.patientName}
                                </td>
                                <td className="py-2 px-3">{prescription.doctor}</td>
                                <td className="py-2 px-3">
                                  {prescription.dateIssued}
                                </td>
                                <td className="py-2 px-3">
                                  <Badge
                                    className={
                                      prescription.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : prescription.status === "Filled"
                                        ? "bg-blue-100 text-blue-800"
                                        : prescription.status === "Ready for Pickup"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }
                                  >
                                    {prescription.status}
                                  </Badge>
                                </td>
                                <td className="py-2 px-3">
                                  {prescription.medications.length}
                                </td>
                                <td className="py-2 px-3">
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewPrescription(prescription)}
                                      className="flex items-center gap-1"
                                    >
                                      <FileText className="h-3 w-3" />
                                      View
                                    </Button>
                                    {prescription.status === "Pending" && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleFillPrescription(prescription)}
                                        disabled={prescription.medications.some(
                                          (med) => medications.find((m) => m.name === med.name)?.stock < med.quantity
                                        )}
                                        className="flex items-center gap-1"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                        Fill
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Medication Inventory</h2>
                  <Button 
                    onClick={() => setShowAddMedicationDialog(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Package className="h-5 w-5" />
                    Add New Medication
                  </Button>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search medications by name or category..."
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle>Inventory Summary</CardTitle>
                      <CardDescription>
                        Quick overview of medication stock
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Total Medications
                          </h3>
                          <p className="text-3xl font-bold">{medications.length}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Low Stock Items
                          </h3>
                          <p className="text-3xl font-bold text-yellow-600">
                            {
                              medications.filter(
                                (med) => med.stock <= med.reorderLevel
                              ).length
                            }
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Out of Stock
                          </h3>
                          <p className="text-3xl font-bold text-red-600">
                            {medications.filter((med) => med.stock === 0).length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-3">
                    <CardHeader>
                      <CardTitle>Medication List</CardTitle>
                      <CardDescription>
                        {filteredMedications.length} medications found
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-3">Name</th>
                              <th className="text-left py-2 px-3">Category</th>
                              <th className="text-left py-2 px-3">Stock</th>
                              <th className="text-left py-2 px-3">Unit</th>
                              <th className="text-left py-2 px-3">Price</th>
                              <th className="text-left py-2 px-3">Supplier</th>
                              <th className="text-left py-2 px-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMedications.map((medication) => (
                              <tr
                                key={medication.id}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="py-2 px-3">{medication.name}</td>
                                <td className="py-2 px-3">{medication.category}</td>
                                <td className="py-2 px-3">
                                  <div className="flex items-center">
                                    <span
                                      className={
                                        medication.stock === 0
                                          ? "text-red-600 font-medium"
                                          : medication.stock <=
                                            medication.reorderLevel
                                          ? "text-yellow-600 font-medium"
                                          : ""
                                      }
                                    >
                                      {medication.stock}
                                    </span>
                                    {medication.stock <=
                                      medication.reorderLevel && (
                                      <AlertTriangle className="h-4 w-4 text-yellow-500 ml-1" />
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-3">{medication.unit}</td>
                                <td className="py-2 px-3">
                                  ${medication.price.toFixed(2)}
                                </td>
                                <td className="py-2 px-3">{medication.supplier}</td>
                                <td className="py-2 px-3">
                                  <div className="flex space-x-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          Update Stock
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>
                                            Update Stock - {medication.name}
                                          </DialogTitle>
                                          <DialogDescription>
                                            Adjust the current stock level for this
                                            medication.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="current-stock">
                                              Current Stock
                                            </Label>
                                            <Input
                                              id="current-stock"
                                              value={medication.stock}
                                              disabled
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="new-stock">
                                              New Stock Level
                                            </Label>
                                            <Input
                                              id="new-stock"
                                              type="number"
                                              min="0"
                                              defaultValue={medication.stock}
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button
                                            onClick={(e) => {
                                              const newStock = e.target
                                                .closest('div[role="dialog"]')
                                                .querySelector("#new-stock").value;
                                              updateMedicationStock(
                                                medication.id,
                                                newStock
                                              );
                                            }}
                                          >
                                            Update Stock
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Low Stock Medications</CardTitle>
                    <CardDescription>
                      Medications that need to be reordered
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3">Name</th>
                            <th className="text-left py-2 px-3">Category</th>
                            <th className="text-left py-2 px-3">Current Stock</th>
                            <th className="text-left py-2 px-3">Reorder Level</th>
                            <th className="text-left py-2 px-3">Supplier</th>
                            <th className="text-left py-2 px-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medications
                            .filter((med) => med.stock <= med.reorderLevel)
                            .map((medication) => (
                              <tr
                                key={medication.id}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="py-2 px-3">{medication.name}</td>
                                <td className="py-2 px-3">{medication.category}</td>
                                <td className="py-2 px-3">
                                  <span
                                    className={
                                      medication.stock === 0
                                        ? "text-red-600 font-medium"
                                        : "text-yellow-600 font-medium"
                                    }
                                  >
                                    {medication.stock}
                                  </span>
                                </td>
                                <td className="py-2 px-3">
                                  {medication.reorderLevel}
                                </td>
                                <td className="py-2 px-3">{medication.supplier}</td>
                                <td className="py-2 px-3">
                                  <Button variant="outline" size="sm">
                                    Place Order
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          {medications.filter(
                            (med) => med.stock <= med.reorderLevel
                          ).length === 0 && (
                            <tr>
                              <td
                                colSpan={6}
                                className="py-4 text-center text-gray-500"
                              >
                                No medications are currently low in stock
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Pharmacy Reports</h2>
                  <Button 
                    variant="outline" 
                    onClick={handleExportReports}
                    className="flex items-center gap-2"
                  >
                    <FileDown className="h-4 w-4" />
                    Export Reports
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dispensing Summary</CardTitle>
                      <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Total Prescriptions
                          </h3>
                          <p className="text-3xl font-bold">
                            {prescriptions.length}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Filled Prescriptions
                          </h3>
                          <p className="text-3xl font-bold text-blue-600">
                            {prescriptions.filter((p) => p.status === "Filled").length}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Picked Up
                          </h3>
                          <p className="text-3xl font-bold text-green-600">
                            {prescriptions.filter((p) => p.status === "Picked Up").length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Most Dispensed Medications</CardTitle>
                      <CardDescription>Top medications by volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {medications
                          .sort((a, b) => b.stock - a.stock)
                          .slice(0, 5)
                          .map((medication) => (
                            <div
                              key={medication.id}
                              className="flex items-center justify-between"
                            >
                              <span>{medication.name}</span>
                              <div className="flex items-center">
                                <span className="font-medium mr-2">{medication.stock}</span>
                                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-green-600 h-2.5 rounded-full"
                                    style={{
                                      width: `${(medication.stock / Math.max(...medications.map(m => m.stock))) * 100}%`
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Inventory Value</CardTitle>
                      <CardDescription>Current inventory valuation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Total Value
                          </h3>
                          <p className="text-3xl font-bold">
                            ${medications
                              .reduce((total, med) => total + med.price * med.stock, 0)
                              .toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Average Item Value
                          </h3>
                          <p className="text-xl font-medium">
                            ${(medications.reduce((total, med) => total + med.price, 0) / medications.length).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Low Stock Value
                          </h3>
                          <p className="text-xl font-medium text-yellow-600">
                            ${medications
                              .filter((med) => med.stock <= med.reorderLevel)
                              .reduce((total, med) => total + med.price * med.stock, 0)
                              .toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Prescription Status Distribution</CardTitle>
                      <CardDescription>Current prescription status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPrescriptionStatusData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
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
                      <CardTitle>Medication Categories</CardTitle>
                      <CardDescription>Inventory by medication category</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getMedicationCategoryData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#3b82f6" name="Number of Medications" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity Log</CardTitle>
                    <CardDescription>System activity and audit trail</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityLog.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start space-x-3 p-3 border rounded-lg"
                        >
                          <div className={`w-2 h-2 mt-1.5 rounded-full ${
                            log.type === "warning" ? "bg-yellow-500" :
                            log.type === "error" ? "bg-red-500" :
                            "bg-green-500"
                          }`}></div>
                          <div className="flex-1">
                            <p className="font-medium">{log.action}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{log.user}</span>
                              <span className="mx-2">•</span>
                              <span>{log.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Pharmacy Dashboard</h2>
                  <div className="flex items-center justify-center space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowNewPrescriptionDialog(true)}
                      className="flex items-center gap-2 hover:bg-gray-50"
                    >
                      <ClipboardList className="h-4 w-4" />
                      New Prescription
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                      onClick={() => setShowAddMedicationDialog(true)}
                    >
                      <Package className="h-5 w-5" />
                      Add Medication
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>Today's Prescriptions</CardTitle>
                      <CardDescription>Prescription status overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Total</p>
                            <p className="text-2xl font-bold">
                              {prescriptions.filter(p => p.dateIssued === format(new Date(), "yyyy-MM-dd")).length}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              {prescriptions.filter(p => p.status === "Pending" && p.dateIssued === format(new Date(), "yyyy-MM-dd")).length} Pending
                            </Badge>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              {prescriptions.filter(p => p.status === "Filled" && p.dateIssued === format(new Date(), "yyyy-MM-dd")).length} Filled
                            </Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-2 bg-green-600 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(prescriptions.filter(p => p.status === "Filled" && p.dateIssued === format(new Date(), "yyyy-MM-dd")).length / 
                                Math.max(prescriptions.filter(p => p.dateIssued === format(new Date(), "yyyy-MM-dd")).length, 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>Inventory Status</CardTitle>
                      <CardDescription>Current stock levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Total Items</p>
                            <p className="text-2xl font-bold">{medications.length}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                              {medications.filter(m => m.stock === 0).length} Out of Stock
                            </Badge>
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              {medications.filter(m => m.stock <= m.reorderLevel && m.stock > 0).length} Low Stock
                            </Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${((medications.length - medications.filter(m => m.stock === 0).length) / medications.length) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest system updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activityLog.slice(0, 3).map((log) => (
                          <div key={log.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className={`w-2 h-2 mt-1.5 rounded-full ${
                              log.type === "warning" ? "bg-yellow-500" :
                              log.type === "error" ? "bg-red-500" :
                              "bg-green-500"
                            }`}></div>
                            <div>
                              <p className="text-sm font-medium">{log.action}</p>
                              <p className="text-xs text-gray-500">{log.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common pharmacy tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant="outline" 
                          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowNewPrescriptionDialog(true)}
                        >
                          <ClipboardList className="h-6 w-6" />
                          <span>New Prescription</span>
                        </Button>
                        <Button
                          variant="outline" 
                          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowAddMedicationDialog(true)}
                        >
                          <Package className="h-6 w-6" />
                          <span>Add Medication</span>
                        </Button>
                        <Button
                          variant="outline" 
                          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setActiveTab("inventory")}
                        >
                          <UsersRound className="h-6 w-6" />
                          <span>View Inventory</span>
                        </Button>
                        <Button
                          variant="outline" 
                          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setActiveTab("reports")}
                        >
                          <BarChart3 className="h-6 w-6" />
                          <span>View Reports</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>Low Stock Alerts</CardTitle>
                      <CardDescription>Medications needing attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {medications
                          .filter(m => m.stock <= m.reorderLevel)
                          .slice(0, 3)
                          .map((medication) => (
                            <div 
                              key={medication.id} 
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <p className="font-medium">{medication.name}</p>
                                <p className="text-sm text-gray-500">
                                  Current Stock: {medication.stock} {medication.unit}
                                </p>
                              </div>
                              <Badge className={
                                medication.stock === 0 
                                  ? "bg-red-100 text-red-800 hover:bg-red-100" 
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              }>
                                {medication.stock === 0 ? "Out of Stock" : "Low Stock"}
                              </Badge>
                            </div>
                          ))}
                        {medications.filter(m => m.stock <= m.reorderLevel).length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                            <p>No low stock alerts</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Prescription Dialog */}
      <Dialog
        open={showNewPrescriptionDialog}
        onOpenChange={setShowNewPrescriptionDialog}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
            <DialogDescription>
              Enter prescription details to create a new prescription.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select
                value={newPrescription.patientId}
                onValueChange={(value) =>
                  setNewPrescription({ ...newPrescription, patientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor">Prescribing Doctor</Label>
              <Input
                id="doctor"
                value={newPrescription.doctor}
                onChange={(e) =>
                  setNewPrescription({
                    ...newPrescription,
                    doctor: e.target.value,
                  })
                }
                placeholder="Dr. Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateIssued">Date Issued</Label>
                <Input
                  id="dateIssued"
                  type="date"
                  value={newPrescription.dateIssued}
                  onChange={(e) =>
                    setNewPrescription({
                      ...newPrescription,
                      dateIssued: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newPrescription.expiryDate}
                  onChange={(e) =>
                    setNewPrescription({
                      ...newPrescription,
                      expiryDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Medications</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Add Medication
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Medication</DialogTitle>
                      <DialogDescription>
                        Add a medication to this prescription.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="medication">Medication</Label>
                        <Select
                          value={medicationToAdd.medicationId}
                          onValueChange={(value) =>
                            setMedicationToAdd({
                              ...medicationToAdd,
                              medicationId: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a medication" />
                          </SelectTrigger>
                          <SelectContent>
                            {medications.map((medication) => (
                              <SelectItem
                                key={medication.id}
                                value={medication.id.toString()}
                              >
                                {medication.name} ({medication.stock} in stock)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input
                          id="dosage"
                          value={medicationToAdd.dosage}
                          onChange={(e) =>
                            setMedicationToAdd({
                              ...medicationToAdd,
                              dosage: e.target.value,
                            })
                          }
                          placeholder="e.g. 10mg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Input
                          id="frequency"
                          value={medicationToAdd.frequency}
                          onChange={(e) =>
                            setMedicationToAdd({
                              ...medicationToAdd,
                              frequency: e.target.value,
                            })
                          }
                          placeholder="e.g. Once daily"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={medicationToAdd.quantity}
                          onChange={(e) =>
                            setMedicationToAdd({
                              ...medicationToAdd,
                              quantity: e.target.value,
                            })
                          }
                          placeholder="e.g. 30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instructions">Instructions</Label>
                        <Input
                          id="instructions"
                          value={medicationToAdd.instructions}
                          onChange={(e) =>
                            setMedicationToAdd({
                              ...medicationToAdd,
                              instructions: e.target.value,
                            })
                          }
                          placeholder="e.g. Take with food"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddMedicationToPrescription}>
                        Add to Prescription
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                {newPrescription.medications.length > 0 ? (
                  <div className="space-y-2">
                    {newPrescription.medications.map((medication) => (
                      <div
                        key={medication.id}
                        className="flex justify-between items-center p-2 border rounded bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">{medication.name}</p>
                          <p className="text-sm text-gray-500">
                            {medication.dosage} • {medication.frequency} • Qty:{" "}
                            {medication.quantity}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveMedicationFromPrescription(
                              medication.id
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No medications added yet
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newPrescription.notes}
                onChange={(e) =>
                  setNewPrescription({
                    ...newPrescription,
                    notes: e.target.value,
                  })
                }
                placeholder="Additional notes or instructions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewPrescriptionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNewPrescriptionSubmit}
              disabled={
                !newPrescription.patientId ||
                !newPrescription.doctor ||
                newPrescription.medications.length === 0
              }
            >
              Create Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Medication Dialog */}
      <Dialog
        open={showAddMedicationDialog}
        onOpenChange={setShowAddMedicationDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
            <DialogDescription>
              Enter medication details to add to inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medication Name</Label>
              <Input
                id="name"
                value={newMedication.name}
                onChange={(e) =>
                  setNewMedication({ ...newMedication, name: e.target.value })
                }
                placeholder="e.g. Lisinopril"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newMedication.category}
                onValueChange={(value) =>
                  setNewMedication({ ...newMedication, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Antihypertensive">
                    Antihypertensive
                  </SelectItem>
                  <SelectItem value="Statin">Statin</SelectItem>
                  <SelectItem value="Antidiabetic">Antidiabetic</SelectItem>
                  <SelectItem value="NSAID">NSAID</SelectItem>
                  <SelectItem value="Antibiotic">Antibiotic</SelectItem>
                  <SelectItem value="Analgesic">Analgesic</SelectItem>
                  <SelectItem value="Antihistamine">Antihistamine</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={newMedication.stock}
                  onChange={(e) =>
                    setNewMedication({
                      ...newMedication,
                      stock: Number.parseInt(e.target.value),
                    })
                  }
                  placeholder="e.g. 100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={newMedication.unit}
                  onValueChange={(value) =>
                    setNewMedication({ ...newMedication, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tablets">Tablets</SelectItem>
                    <SelectItem value="capsules">Capsules</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="inhalers">Inhalers</SelectItem>
                    <SelectItem value="patches">Patches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  value={newMedication.reorderLevel}
                  onChange={(e) =>
                    setNewMedication({
                      ...newMedication,
                      reorderLevel: Number.parseInt(e.target.value),
                    })
                  }
                  placeholder="e.g. 20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newMedication.price}
                  onChange={(e) =>
                    setNewMedication({
                      ...newMedication,
                      price: Number.parseFloat(e.target.value),
                    })
                  }
                  placeholder="e.g. 15.99"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                value={newMedication.supplier}
                onValueChange={(value) =>
                  setNewMedication({ ...newMedication, supplier: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PharmaCorp">PharmaCorp</SelectItem>
                  <SelectItem value="MediSource">MediSource</SelectItem>
                  <SelectItem value="HealthSupply">HealthSupply</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddMedicationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNewMedicationSubmit}
              disabled={
                !newMedication.name ||
                !newMedication.category ||
                !newMedication.supplier
              }
            >
              Add Medication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
