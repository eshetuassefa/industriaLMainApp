"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  Users,
  Building2,
  Stethoscope,
  Pill,
  Microscope,
  FileText,
  User,
  AlertTriangle,
  CheckCircle,
  Scan,
  Pencil,
  Trash2,
  LogOut,
} from "lucide-react";

const staffTabMap = {
  "health-providers": "healthProviders",
  pharmacy: "pharmacy",
  lab: "lab",
  radiology: "radiology",
  receptionists: "receptionists",
};

const roleMap = {
  "Healthcare Provider": "HEALTHCARE_PROVIDER",
  Pharmacist: "PHARMACIST",
  "Lab Technician": "LAB_TECHNICIAN",
  Radiologist: "RADIOLOGIST",
  Receptionist: "RECEPTIONIST",
  "Super Admin": "SUPERADMIN",
  HEALTHCARE_PROVIDER: "Healthcare Provider",
  PHARMACIST: "Pharmacist",
  LAB_TECHNICIAN: "Lab Technician",
  RADIOLOGIST: "Radiologist",
  RECEPTIONIST: "Receptionist",
  SUPERADMIN: "Super Admin",
};

const healthcareDepartments = [
  "General Practitioner (GP)",
  "Pediatrics",
  "Obstetrics & Gynecology (OB-GYN)",
  "General Surgery",
  "Orthopedics",
  "Cardiology",
  "Dermatology",
  "ENT",
  "Ophthalmology",
  "Neurology",
  "Psychiatry",
  "Pulmonology",
  "Gastroenterology",
  "Urology",
  "Endocrinology",
  "Nephrology",
  "Oncology",
  "Emergency (ER)",
  "Radiology/Lab",
  "Physiotherapy",
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [staff, setStaff] = useState({
    healthProviders: [],
    pharmacy: [],
    lab: [],
    radiology: [],
    receptionists: [],
  });
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [editStaffForm, setEditStaffForm] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteStaffId, setDeleteStaffId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationIdCounter, setNotificationIdCounter] = useState(0);
  const [addStaffForm, setAddStaffForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "",
    department: "",
    password: "",
    sex: "",
    dob: "",
    address: "",
  });
  const [adminUsers, setAdminUsers] = useState([]);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [addAdminForm, setAddAdminForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Admin",
    status: "Active",
  });
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const staffResponse = await adminService.getAllStaff();
        console.log("Staff response:", staffResponse);

        if (staffResponse.success) {
          // Ensure backendData is an array
          let backendData = Array.isArray(staffResponse.data)
            ? staffResponse.data
            : staffResponse.data?.data || [];

          // Additional check if backendData is still not an array
          if (!Array.isArray(backendData)) {
            console.warn("backendData is not an array:", backendData);
            backendData = [];
          }

          // Log each staff member's data for debugging
          backendData.forEach((staff, index) => {
            console.log(`Staff ${index} data:`, {
              id: staff.id,
              role: staff.role,
              hospital: staff.hospital,
              hospitalId: staff.hospitalId
            });
          });

          const transformedData = {
            healthProviders: backendData
              .filter((s) => s.role === "HEALTHCARE_PROVIDER")
              .map(transformStaffToFrontend),
            pharmacy: backendData
              .filter((s) => s.role === "PHARMACIST")
              .map(transformStaffToFrontend),
            lab: backendData
              .filter((s) => s.role === "LAB_TECHNICIAN")
              .map(transformStaffToFrontend),
            radiology: backendData
              .filter((s) => s.role === "RADIOLOGIST")
              .map(transformStaffToFrontend),
            receptionists: backendData
              .filter((s) => s.role === "RECEPTIONIST")
              .map(transformStaffToFrontend),
          };
          setStaff(transformedData);
          setAdminUsers(
            backendData
              .filter((u) => u.role === "SUPERADMIN")
              .map(transformStaffToFrontend)
          );
          setActivities([]);
        } else {
          throw new Error(
            staffResponse.error.message || "Failed to fetch staff data"
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load data");
        addNotification(error.message || "Failed to load data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const transformStaffToFrontend = (staff) => ({
    id: staff.id,
    firstName: staff.person?.firstName || "",
    middleName: staff.person?.middleName || "",
    lastName: staff.person?.lastName || "",
    email: staff.email || staff.person?.email || "",
    phoneNumber: staff.person?.phoneNumber || "",
    role: roleMap[staff.role] || staff.role,
    department: staff.department?.name || "",
    sex: staff.person?.sex || "",
    dob: staff.person?.dob
      ? new Date(staff.person.dob).toISOString().split("T")[0]
      : "",
    address: staff.person?.address || "",
    password: "hashedPassword123",
    hospital: staff.hospital?.name || "Unknown Hospital",
    hospitalId: staff.hospitalId || null,
  });

  const transformStaffToBackend = (staff) => {
    const transformed = {
      firstName: staff.firstName,
      middleName: staff.middleName,
      lastName: staff.lastName,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
      role: roleMap[staff.role] || staff.role.toUpperCase(),
      password: staff.password,
      sex: staff.sex.toUpperCase(),
      dob: staff.dob,
      address: staff.address || "",
      departmentName: staff.department || null,
    };

    console.log("Transformed staff data:", transformed);
    return transformed;
  };

  const addNotification = (message, type) => {
    setNotifications((prev) => {
      const filtered = prev.filter((n) => n.message !== message);
      return [
        {
          id: notificationIdCounter,
          message,
          type,
        },
        ...filtered,
      ];
    });
    setNotificationIdCounter((prev) => prev + 1);
  };

  const handleRoleChange = (value) => {
    console.log("Role changed to:", value);
    setAddStaffForm((prev) => ({
      ...prev,
      role: value,
      department: value === "Healthcare Provider" ? prev.department : "",
    }));
  };

  const handleDepartmentChange = (value) => {
    console.log("Department changed to:", value);
    setAddStaffForm((prev) => ({
      ...prev,
      department: value,
    }));
  };

  const validateForm = () => {
    const isHealthcareProvider = addStaffForm.role === "Healthcare Provider";
    const missingDepartment = isHealthcareProvider && !addStaffForm.department;

    console.log("Form validation:", {
      isHealthcareProvider,
      department: addStaffForm.department,
      missingDepartment,
    });

    if (missingDepartment) {
      throw new Error("Department name is required for healthcare providers");
    }

    if (
      !addStaffForm.firstName ||
      !addStaffForm.lastName ||
      !addStaffForm.email ||
      !addStaffForm.password ||
      !addStaffForm.role ||
      !addStaffForm.sex ||
      !addStaffForm.dob
    ) {
      throw new Error("Please fill in all required fields marked with *");
    }
  };

  const handleAddStaff = async () => {
    setIsLoading(true);
    try {
      const staffData = transformStaffToBackend(addStaffForm);
      const response = await adminService.registerStaff(staffData);

      if (!response.success) {
        throw new Error(response.error.message || "Failed to add staff");
      }

      // Transform the new staff data
      const newStaff = transformStaffToFrontend(response.data);

      // Immediately update the staff state
      setStaff((prev) => {
        const updatedStaff = { ...prev };
        const staffKey = staffTabMap[activeTab];

        if (staffKey) {
          updatedStaff[staffKey] = [
            ...(updatedStaff[staffKey] || []),
            newStaff,
          ];
        }

        return updatedStaff;
      });

      // Close dialog and reset form
      setShowAddStaffDialog(false);
      setAddStaffForm({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: "",
        department: "",
        password: "",
        sex: "",
        dob: "",
        address: "",
      });

      addNotification("Staff member added successfully!", "success");
      addActivity(
        "registration",
        `New ${addStaffForm.role} staff member added`,
        addStaffForm.role
      );
    } catch (error) {
      console.error("Error adding staff:", error);
      addNotification(error.message || "Failed to add staff", "error");
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditStaff = (staff) => {
    setEditStaff(staff);
    setEditStaffForm({
      ...staff,
      dob: staff.dob || "",
      phoneNumber: staff.phoneNumber || "",
      address: staff.address || "",
    });
    setShowEditDialog(true);
  };

  const handleEditStaffSave = async () => {
    setIsLoading(true);
    try {
      if (!editStaffForm) throw new Error("No staff data to save");

      const updateData = transformStaffToBackend(editStaffForm);
      if (
        editStaffForm.password &&
        editStaffForm.password !== "hashedPassword123"
      ) {
        updateData.password = editStaffForm.password;
      } else {
        delete updateData.password;
      }

      const response = await adminService.updateStaff(
        editStaffForm.id,
        updateData
      );
      if (!response.success) {
        throw new Error(response.error.message || "Failed to update staff");
      }

      setStaff((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((dept) => {
          updated[dept] = updated[dept].map((s) =>
            s.id === editStaffForm.id
              ? {
                  id: editStaffForm.id,
                  firstName: editStaffForm.firstName,
                  middleName: editStaffForm.middleName,
                  lastName: editStaffForm.lastName,
                  email: editStaffForm.email,
                  phoneNumber: editStaffForm.phoneNumber,
                  role: editStaffForm.role,
                  sex: editStaffForm.sex,
                  dob: editStaffForm.dob,
                  address: editStaffForm.address,
                  password: "hashedPassword123",
                }
              : s
          );
        });
        return updated;
      });

      addActivity(
        "update",
        `${editStaffForm.role} staff member updated`,
        editStaffForm.role
      );

      setShowEditDialog(false);
      setEditStaffForm(null);
      setEditStaff(null);
      addNotification("Staff member updated successfully!", "success");
    } catch (error) {
      console.error("Error saving staff edits:", error);
      addNotification(error.message || "Failed to update staff", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = (staffId) => {
    setDeleteStaffId(staffId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteStaff = async () => {
    setIsLoading(true);
    try {
      const staffToDelete = Object.values(staff)
        .flat()
        .find((s) => s.id === deleteStaffId);

      const response = await adminService.deleteStaff(deleteStaffId);
      if (!response.success) {
        throw new Error(response.error.message || "Failed to delete staff");
      }

      setStaff((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((dept) => {
          updated[dept] = updated[dept].filter((s) => s.id !== deleteStaffId);
        });
        return updated;
      });

      if (staffToDelete) {
        addActivity(
          "deletion",
          `${staffToDelete.role} staff member removed`,
          staffToDelete.role
        );
      }

      setShowDeleteDialog(false);
      setDeleteStaffId(null);
      addNotification("Staff member deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting staff:", error);
      addNotification(error.message || "Failed to delete staff", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = (type, message, role) => {
    const newActivity = {
      id: notificationIdCounter,
      type,
      message,
      time: new Date(),
      status: type === "warning" ? "warning" : "info",
      role,
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 10));
    setNotificationIdCounter((prev) => prev + 1);
  };

  const getStaffList = () => {
    if (activeTab in staffTabMap) {
      const staffList = staff[staffTabMap[activeTab]] || [];
      if (!searchQuery) return staffList;

      const query = searchQuery.toLowerCase();
      return staffList.filter(
        (staff) =>
          staff.firstName?.toLowerCase().includes(query) ||
          staff.lastName?.toLowerCase().includes(query) ||
          staff.email?.toLowerCase().includes(query) ||
          staff.role?.toLowerCase().includes(query)
      );
    }
    return [];
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    if (interval === 1) return "1 year ago";
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    if (interval === 1) return "1 month ago";
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    if (interval === 1) return "1 day ago";
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    if (interval === 1) return "1 hour ago";
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    if (interval === 1) return "1 minute ago";
    return "just now";
  };

  const handleAddAdmin = async () => {
    setIsLoading(true);
    try {
      if (
        !addAdminForm.username ||
        !addAdminForm.email ||
        !addAdminForm.password
      ) {
        throw new Error("Please fill in all required fields");
      }

      const adminData = {
        firstName: addAdminForm.username.split(" ")[0] || "Admin",
        lastName: addAdminForm.username.split(" ")[1] || "User",
        email: addAdminForm.email,
        password: addAdminForm.password,
        role: roleMap[addAdminForm.role] || "SUPERADMIN",
        sex: "MALE",
        dob: new Date().toISOString().split("T")[0],
        phoneNumber: "",
        address: "",
      };

      const response = await adminService.registerStaff(adminData);
      if (!response.success) {
        throw new Error(response.error.message || "Failed to add admin");
      }

      const newAdmin = transformStaffToFrontend(response.data);
      setAdminUsers((prev) => [...prev, newAdmin]);
      setShowAddAdminDialog(false);
      setAddAdminForm({
        username: "",
        email: "",
        password: "",
        role: "Admin",
        status: "Active",
      });
      addNotification("Admin user added successfully!", "success");
      addActivity(
        "registration",
        `New ${addAdminForm.role} admin added`,
        addAdminForm.role
      );
    } catch (error) {
      console.error("Error adding admin:", error);
      addNotification(error.message || "Failed to add admin", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getStaffColumns = () => {
    const baseColumns = [
      { key: "firstName", label: "F_Name" },
      { key: "middleName", label: "M_Name" },
      { key: "lastName", label: "L_Name" },
      { key: "email", label: "Email" },
      { key: "phoneNumber", label: "Phone" },
      { key: "role", label: "Role" },
      { key: "hospital", label: "Hospital" },
      { key: "sex", label: "Sex" },
      { key: "dob", label: "Date of Birth" },
      { key: "address", label: "Address" },
      { key: "password", label: "Password" },
      { key: "actions", label: "Actions" },
    ];

    if (activeTab === "health-providers") {
      baseColumns.splice(7, 0, { key: "department", label: "Department" });
    }

    return baseColumns;
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      addNotification('Failed to logout. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf9f5]">
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <strong>Error:</strong> {error}
        </div>
      )}
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`fixed top-4 right-4 border px-4 py-3 rounded z-50 ${
            notif.type === "success"
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
        >
          <strong>{notif.type === "success" ? "Success" : "Error"}:</strong>{" "}
          {notif.message}
        </div>
      ))}

      <main className="flex-1 container mx-auto px-4 py-6 mt-16">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-5rem)] lg:w-60 bg-gray-800 border-r border-gray-200 z-10 overflow-y-auto overflow-x-hidden mb-4 lg:mb-0">
            <div className="flex flex-col gap-1 p-4">
              {[
                { value: "dashboard", label: "Dashboard", icon: Building2 },
                {
                  value: "health-providers",
                  label: "Health Providers",
                  icon: Stethoscope,
                },
                { value: "pharmacy", label: "Pharmacy", icon: Pill },
                { value: "lab", label: "Lab Technicians", icon: Microscope },
                { value: "radiology", label: "Radiology", icon: Scan },
                { value: "receptionists", label: "Receptionists", icon: Users },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`w-full py-3 px-4 text-left rounded-md text-base font-medium transition-colors hover:bg-gray-100 flex items-center gap-2 ${
                    activeTab === tab.value
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : "text-white hover:bg-gray-500"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 lg:ml-60 px-4 lg:px-6 pb-6">
            {activeTab === "dashboard" ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    Admin Dashboard
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(staffTabMap).map(([tabValue, staffKey]) => (
                    <Card
                      key={tabValue}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {tabValue.split(/(?=[A-Z])/).join(" ")}
                        </CardTitle>
                        <CardDescription>
                          Manage {tabValue.toLowerCase()} staff
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-bold">
                              {staff[staffKey].length}
                            </p>
                            <p className="text-sm text-gray-500">
                              Active Staff
                            </p>
                          </div>
                          <Button
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => {
                              setActiveTab(tabValue);
                              setShowAddStaffDialog(true);
                            }}
                            disabled={isLoading}
                          >
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Staff</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>Recent Activities</CardTitle>
                      <CardDescription>
                        Latest system activities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {activities.map((activity) => (
                          <div
                            key={activity.id}
                            className={`flex items-start space-x-3 p-3 border rounded-lg ${
                              activity.status === "warning"
                                ? "bg-yellow-50"
                                : "bg-white"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 mt-1.5 rounded-full ${
                                activity.status === "warning"
                                  ? "bg-yellow-500"
                                  : "bg-blue-500"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.message}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-500 gap-2">
                                <span>{activity.role}</span>
                                <span>{formatTimeAgo(activity.time)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>
                        Common administrative tasks
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(staffTabMap).map(
                          ([tabValue, staffKey]) => (
                            <Button
                              key={tabValue}
                              variant="outline"
                              className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                              onClick={() => setActiveTab(tabValue)}
                            >
                              {tabValue === "health-providers" && (
                                <Stethoscope className="h-6 w-6" />
                              )}
                              {tabValue === "pharmacy" && (
                                <Pill className="h-6 w-6" />
                              )}
                              {tabValue === "lab" && (
                                <Microscope className="h-6 w-6" />
                              )}
                              {tabValue === "radiology" && (
                                <Scan className="h-6 w-6" />
                              )}
                              {tabValue === "receptionists" && (
                                <Users className="h-6 w-6" />
                              )}
                              <span className="text-sm">
                                {tabValue.split(/(?=[A-Z])/).join(" ")}
                              </span>
                            </Button>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {activeTab
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </h2>
                  <Button
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                    onClick={() => setShowAddStaffDialog(true)}
                    disabled={isLoading}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add New</span>
                  </Button>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    placeholder={`Search ${activeTab.split("-").join(" ")}...`}
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Staff List</CardTitle>
                    <CardDescription>
                      Manage {activeTab.split("-").join(" ")} staff members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative w-full overflow-x-auto">
                      <div className="min-w-full inline-block align-middle">
                        <div className="overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {getStaffColumns().map((column) => (
                                  <th
                                    key={column.key}
                                    className="py-2 px-2 text-xs font-medium text-gray-500 text-left whitespace-nowrap"
                                  >
                                    {column.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {getStaffList().map((staff) => (
                                <tr key={staff.id} className="hover:bg-gray-50">
                                  <td className="py-2 px-3 text-xs text-gray-900 max-w-[100px] truncate">
                                    {staff.firstName}
                                  </td>
                                  <td className="py-2 px-3 text-xs text-gray-500 max-w-[100px] truncate">
                                    {staff.middleName}
                                  </td>
                                  <td className="py-2 px-3 text-xs text-gray-500 max-w-[100px] truncate">
                                    {staff.lastName}
                                  </td>
                                  <td className="py-2 px-3 text-xs text-gray-500 max-w-[150px] truncate">
                                    {staff.email}
                                  </td>
                                  <td className="py-2 px-3 text-xs text-gray-500 max-w-[100px] truncate">
                                    {staff.phoneNumber}
                                  </td>
                                  <td className="py-2 px-3 text-xs text-gray-500 max-w-[100px] truncate">
                                    {staff.role}
                                  </td>
                                  <td className="py-2 px-3 text-xs text-gray-500 max-w-[150px] truncate">
                                    {staff.hospital}
                                  </td>
                                  {activeTab === "health-providers" && (
                                    <td className="py-2 px-3 text-xs text-gray-500 max-w-[150px] truncate">
                                      {staff.department}
                                    </td>
                                  )}
                                  <td className="py-2 px-3 text-xs text-gray-500 max-w-[80px] truncate">
                                    {staff.sex}
                                  </td>
                                  <td className="py-2 px-3 text-xs text-gray-500 max-w-[100px] truncate">
                                    {staff.dob}
                                  </td>
                                  <td className="py-2 px-3 text-xs text-gray-500 max-w-[150px] truncate">
                                    {staff.address}
                                  </td>
                                  <td className="py-2 px-3 text-xs text-gray-500 max-w-[80px] truncate">
                                    {staff.password ? "••••••••" : ""}
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-6 h-6 flex items-center justify-center"
                                        onClick={() => handleEditStaff(staff)}
                                        disabled={isLoading}
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="w-6 h-6 flex items-center justify-center"
                                        onClick={() =>
                                          handleDeleteStaff(staff.id)
                                        }
                                        disabled={isLoading}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details for the new staff member. Fields marked with *
              are required.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddStaff();
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={addStaffForm.firstName}
                    onChange={(e) =>
                      setAddStaffForm((prev) => ({
                        ...prev,
                        firstName: e.target.value.trim(),
                      }))
                    }
                    placeholder="Enter first name"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={addStaffForm.middleName}
                    onChange={(e) =>
                      setAddStaffForm((prev) => ({
                        ...prev,
                        middleName: e.target.value.trim(),
                      }))
                    }
                    placeholder="Enter middle name"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={addStaffForm.lastName}
                    onChange={(e) =>
                      setAddStaffForm((prev) => ({
                        ...prev,
                        lastName: e.target.value.trim(),
                      }))
                    }
                    placeholder="Enter last name"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={addStaffForm.email}
                    onChange={(e) =>
                      setAddStaffForm((prev) => ({
                        ...prev,
                        email: e.target.value.trim(),
                      }))
                    }
                    placeholder="Enter email address"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={addStaffForm.phoneNumber}
                    onChange={(e) =>
                      setAddStaffForm((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value.trim(),
                      }))
                    }
                    placeholder="Enter phone number"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex *</Label>
                  <Select
                    value={addStaffForm.sex}
                    onValueChange={(value) =>
                      setAddStaffForm((prev) => ({ ...prev, sex: value }))
                    }
                    required
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={addStaffForm.dob}
                    onChange={(e) =>
                      setAddStaffForm((prev) => ({
                        ...prev,
                        dob: e.target.value,
                      }))
                    }
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={addStaffForm.role}
                  onValueChange={handleRoleChange}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTab === "health-providers" && (
                      <SelectItem value="Healthcare Provider">
                        Healthcare Provider
                      </SelectItem>
                    )}
                    {activeTab === "pharmacy" && (
                      <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                    )}
                    {activeTab === "lab" && (
                      <SelectItem value="Lab Technician">
                        Lab Technician
                      </SelectItem>
                    )}
                    {activeTab === "radiology" && (
                      <SelectItem value="Radiologist">Radiologist</SelectItem>
                    )}
                    {activeTab === "receptionists" && (
                      <SelectItem value="Receptionist">Receptionist</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {addStaffForm.role === "Healthcare Provider" && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={addStaffForm.department}
                    onValueChange={handleDepartmentChange}
                    required
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {healthcareDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={addStaffForm.address}
                  onChange={(e) =>
                    setAddStaffForm((prev) => ({
                      ...prev,
                      address: e.target.value.trim(),
                    }))
                  }
                  placeholder="Enter address"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={addStaffForm.password}
                  onChange={(e) =>
                    setAddStaffForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Enter password"
                  className="w-full"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddStaffDialog(false);
                  setAddStaffForm({
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    role: "",
                    department: "",
                    password: "",
                    sex: "",
                    dob: "",
                    address: "",
                  });
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          {editStaffForm && (
            <div className="grid gap-4 py-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name *</Label>
                  <Input
                    id="editFirstName"
                    value={editStaffForm.firstName}
                    onChange={(e) =>
                      setEditStaffForm((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="Edit first name"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editMiddleName">Middle Name</Label>
                  <Input
                    id="editMiddleName"
                    value={editStaffForm.middleName || ""}
                    onChange={(e) =>
                      setEditStaffForm((prev) => ({
                        ...prev,
                        middleName: e.target.value,
                      }))
                    }
                    placeholder="Edit middle name"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name *</Label>
                  <Input
                    id="editLastName"
                    value={editStaffForm.lastName}
                    onChange={(e) =>
                      setEditStaffForm((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Edit last name"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editStaffForm.email}
                    onChange={(e) =>
                      setEditStaffForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Edit email address"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhoneNumber">Phone Number</Label>
                  <Input
                    id="editPhoneNumber"
                    value={editStaffForm.phoneNumber || ""}
                    onChange={(e) =>
                      setEditStaffForm((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    placeholder="Edit phone number"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editSex">Sex *</Label>
                  <Select
                    value={editStaffForm.sex}
                    onValueChange={(value) =>
                      setEditStaffForm((prev) => ({
                        ...prev,
                        sex: value,
                      }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDob">Date of Birth *</Label>
                  <Input
                    id="editDob"
                    type="date"
                    value={editStaffForm.dob}
                    onChange={(e) =>
                      setEditStaffForm((prev) => ({
                        ...prev,
                        dob: e.target.value,
                      }))
                    }
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Role *</Label>
                <Select
                  value={editStaffForm.role}
                  onValueChange={(value) =>
                    setEditStaffForm((prev) => ({
                      ...prev,
                      role: value,
                      // Reset department if role changes from healthcare provider
                      department:
                        value === "Healthcare Provider" ? prev.department : "",
                    }))
                  }
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Healthcare Provider">
                      Healthcare Provider
                    </SelectItem>
                    <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                    <SelectItem value="Lab Technician">
                      Lab Technician
                    </SelectItem>
                    <SelectItem value="Radiologist">Radiologist</SelectItem>
                    <SelectItem value="Receptionist">Receptionist</SelectItem>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Field - Only shown for Healthcare Providers */}
              {editStaffForm.role === "Healthcare Provider" && (
                <div className="space-y-2">
                  <Label htmlFor="editDepartment">Department *</Label>
                  <Select
                    value={editStaffForm.department || ""}
                    onValueChange={(value) =>
                      setEditStaffForm((prev) => ({
                        ...prev,
                        department: value,
                      }))
                    }
                    required
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {healthcareDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="editAddress">Address</Label>
                <Input
                  id="editAddress"
                  value={editStaffForm.address || ""}
                  onChange={(e) =>
                    setEditStaffForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Edit address"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="editPassword">Password</Label>
                <Input
                  id="editPassword"
                  type="password"
                  value={editStaffForm.password || ""}
                  onChange={(e) =>
                    setEditStaffForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Enter new password (leave blank to keep current)"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setEditStaffForm(null);
                setEditStaff(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEditStaffSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this staff member? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteStaff}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Staff</DialogTitle>
            <DialogDescription>
              Create a new admin account with appropriate access levels
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={addAdminForm.username}
                onChange={(e) =>
                  setAddAdminForm((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                placeholder="Enter username"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={addAdminForm.email}
                onChange={(e) =>
                  setAddAdminForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="Enter email"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={addAdminForm.password}
                onChange={(e) =>
                  setAddAdminForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="Enter password"
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={addAdminForm.role}
                onValueChange={(value) =>
                  setAddAdminForm((prev) => ({
                    ...prev,
                    role: value,
                  }))
                }
                required
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddAdminDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddAdmin}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
