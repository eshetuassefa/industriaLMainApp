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
  Trash2
} from "lucide-react";

// Sample data for demonstration
const initialStaff = {
  healthProviders: [
    { 
      id: 1, 
      firstName: "Sarah",
      middleName: "Elizabeth",
      lastName: "Wilson",
      email: "sarah.wilson@hospital.com",
      phone: "+1 (555) 123-4567",
      role: "Cardiologist",
      department: "Health Providers",
      password: "hashedPassword123"
    }
  ],
  pharmacy: [
    { 
      id: 1, 
      firstName: "John",
      middleName: "Robert",
      lastName: "Smith",
      email: "john.smith@hospital.com",
      phone: "+1 (555) 345-6789",
      role: "Pharmacist",
      department: "Pharmacy",
      password: "hashedPassword123"
    }
  ],
  lab: [
    { 
      id: 1, 
      firstName: "Robert",
      middleName: "William",
      lastName: "Johnson",
      email: "robert.johnson@hospital.com",
      phone: "+1 (555) 567-8901",
      role: "Lab Technician",
      department: "Lab",
      password: "hashedPassword123"
    }
  ],
  radiology: [
    { 
      id: 1, 
      firstName: "James",
      middleName: "Edward",
      lastName: "Wilson",
      email: "james.wilson@hospital.com",
      phone: "+1 (555) 789-0123",
      role: "Radiologist",
      department: "Radiology",
      password: "hashedPassword123"
    }
  ],
  receptionists: [
    { 
      id: 1, 
      firstName: "David",
      middleName: "Thomas",
      lastName: "Wilson",
      email: "david.wilson@hospital.com",
      phone: "+1 (555) 901-2345",
      role: "Receptionist",
      department: "Receptionists",
      password: "hashedPassword123"
    }
  ]
};

// Add this mapping at the top of your component, after initialStaff
const staffTabMap = {
  "health-providers": "healthProviders",
  "pharmacy": "pharmacy",
  "lab": "lab",
  "radiology": "radiology",
  "receptionists": "receptionists"
};

// Add this after the initialStaff constant
const initialActivities = [
  {
    id: 1,
    type: "registration",
    message: "New health provider registration request",
    time: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    status: "pending",
    department: "Health Providers"
  },
  {
    id: 2,
    type: "inventory",
    message: "Pharmacy inventory needs attention",
    time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: "warning",
    department: "Pharmacy"
  },
  {
    id: 3,
    type: "schedule",
    message: "Lab technician schedule update required",
    time: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    status: "info",
    department: "Lab"
  }
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [staff, setStaff] = useState(initialStaff);
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [editStaffForm, setEditStaffForm] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteStaffId, setDeleteStaffId] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New health provider registration request",
      time: "10 minutes ago",
      type: "info",
    },
    {
      id: 2,
      message: "Pharmacy inventory needs attention",
      time: "30 minutes ago",
      type: "warning",
    },
    {
      id: 3,
      message: "Lab technician schedule update required",
      time: "1 hour ago",
      type: "info",
    },
  ]);
  const [addStaffForm, setAddStaffForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    password: ""
  });
  const [adminUsers, setAdminUsers] = useState([
    {
      id: 1,
      username: "admin",
      email: "admin@hospital.com",
      role: "Super Admin",
      status: "Active"
    }
  ]);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [addAdminForm, setAddAdminForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Admin",
    status: "Active"
  });
  const [activities, setActivities] = useState(initialActivities);

  const handleAddStaff = () => {
    // Validate required fields
    if (!addStaffForm.firstName || !addStaffForm.lastName || !addStaffForm.email || !addStaffForm.password || !addStaffForm.department || !addStaffForm.role) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addStaffForm.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Create new staff member
    const newStaff = {
      ...addStaffForm,
      id: Date.now(),
      department: addStaffForm.department
    };

    // Update staff state
    setStaff(prev => {
      const deptKey = Object.keys(prev).find(
        key => key.toLowerCase() === addStaffForm.department.toLowerCase()
      );
      
      if (!deptKey) {
        console.error("Department not found:", addStaffForm.department);
        return prev;
      }
      
      // Check if email already exists
      const emailExists = Object.values(prev).some(dept => 
        dept.some(staff => staff.email.toLowerCase() === addStaffForm.email.toLowerCase())
      );

      if (emailExists) {
        alert("This email address is already registered");
        return prev;
      }
      
      return {
        ...prev,
        [deptKey]: [...(prev[deptKey] || []), newStaff]
      };
    });

    // Reset form and close dialog
    setShowAddStaffDialog(false);
    setAddStaffForm({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      password: ""
    });

    // Show success message
    alert("Staff member added successfully!");

    // Add activity
    addActivity('registration', `New ${addStaffForm.department} staff member added`, addStaffForm.department);
  };

  const handleEditStaff = (staff) => {
    if (!staff) return;
    
    setEditStaff(staff);
    setEditStaffForm({
      ...staff,
      department: staff.department || ""
    });
    setShowEditDialog(true);
  };

  const handleEditStaffSave = () => {
    if (!editStaffForm) return;

    if (!editStaffForm.firstName || !editStaffForm.lastName || !editStaffForm.email) {
      alert("Please fill in all required fields");
      return;
    }

    setStaff(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(dept => {
        updated[dept] = updated[dept].map(s =>
          s.id === editStaffForm.id ? { ...editStaffForm } : s
        );
      });
      return updated;
    });

    addActivity('update', `${editStaffForm.department} staff member updated`, editStaffForm.department);

    setShowEditDialog(false);
    setEditStaffForm(null);
    setEditStaff(null);
  };

  const handleDeleteStaff = (staffId) => {
    setDeleteStaffId(staffId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteStaff = () => {
    const staffToDelete = Object.values(staff).flat().find(s => s.id === deleteStaffId);
    
    setStaff((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((dept) => {
        updated[dept] = updated[dept].filter((s) => s.id !== deleteStaffId);
      });
      return updated;
    });

    if (staffToDelete) {
      addActivity('deletion', `${staffToDelete.department} staff member removed`, staffToDelete.department);
    }

    setShowDeleteDialog(false);
    setDeleteStaffId(null);
  };

  const handleEditAdmin = (admin) => {
    setEditStaffForm({ ...admin });
    setShowEditDialog(true);
  };

  const handleDeleteAdmin = (adminId) => {
    setDeleteStaffId(adminId);
    setShowDeleteDialog(true);
  };

  const handleUpdateAdmin = () => {
    if (!editStaffForm) return;
    setAdminUsers(prev => 
      prev.map(admin => 
        admin.id === editStaffForm.id ? { ...editStaffForm } : admin
      )
    );
    setShowEditDialog(false);
    setEditStaffForm(null);
  };

  const handleDeleteAdminConfirm = () => {
    setAdminUsers(prev => prev.filter(admin => admin.id !== deleteStaffId));
    setShowDeleteDialog(false);
    setDeleteStaffId(null);
  };

  const getStaffList = () => {
    if (activeTab in staffTabMap) {
      const staffList = staff[staffTabMap[activeTab]] || [];
      if (!searchQuery) return staffList;
      
      const query = searchQuery.toLowerCase();
      return staffList.filter(staff => 
        staff.firstName?.toLowerCase().includes(query) ||
        staff.lastName?.toLowerCase().includes(query) ||
        staff.email?.toLowerCase().includes(query) ||
        staff.role?.toLowerCase().includes(query) ||
        staff.department?.toLowerCase().includes(query)
      );
    }
    return [];
  };

  const getStaffColumns = () => {
    return [
      { key: "firstName", label: "F_Name" },
      { key: "middleName", label: "M_Name" },
      { key: "lastName", label: "L_Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "role", label: "Role" },
      { key: "department", label: "Department" },
      { key: "password", label: "Password" },
      { key: "actions", label: "Actions" }
    ];
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    if (interval === 1) return '1 year ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    if (interval === 1) return '1 month ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    if (interval === 1) return '1 day ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    if (interval === 1) return '1 hour ago';
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    if (interval === 1) return '1 minute ago';
    
    return 'just now';
  };

  const addActivity = (type, message, department) => {
    const newActivity = {
      id: Date.now(),
      type,
      message,
      time: new Date(),
      status: type === 'warning' ? 'warning' : 'info',
      department
    };
    
    setActivities(prev => [newActivity, ...prev].slice(0, 10)); // Keep only last 10 activities
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Page</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <User className="h-5 w-5" />
                  <span>Admin Users</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Admin Users Management</DialogTitle>
                  <DialogDescription>
                    Manage system administrators and their access levels
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setShowAddAdminDialog(true)}
                    >
                      <UserPlus className="h-4 w-4" />
                      Add Admin
                    </Button>
                  </div>
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Username</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Role</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {adminUsers.map((admin) => (
                          <tr key={admin.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{admin.username}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{admin.email}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{admin.role}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              <Badge variant={admin.status === "Active" ? "success" : "destructive"}>
                                {admin.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="w-8 h-8"
                                  onClick={() => handleEditAdmin(admin)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="w-8 h-8"
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 mt-16">
        <div className="flex">
          <div className="fixed left-0 top-16 h-[calc(100vh-5rem)] w-60 bg-gray-50 border-r border-gray-200 z-10 overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-1 p-4">
              {[
                { value: "dashboard", label: "Dashboard", icon: Building2 },
                { value: "health-providers", label: "Health Providers", icon: Stethoscope },
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
            {activeTab === "dashboard" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(staffTabMap).map(([tabValue, staffKey]) => (
                    <Card key={tabValue}>
                      <CardHeader>
                        <CardTitle>
                          {tabValue.split(/(?=[A-Z])/).join(" ")}
                        </CardTitle>
                        <CardDescription>
                          Manage {tabValue.toLowerCase()} staff
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-bold">{staff[staffKey].length}</p>
                            <p className="text-sm text-gray-500">Active Staff</p>
                          </div>
                          <Button
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              setActiveTab(tabValue);
                              setShowAddStaffDialog(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4" />
                            Add Staff
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activities</CardTitle>
                      <CardDescription>Latest system activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div
                            key={activity.id}
                            className={`flex items-start space-x-3 p-3 border rounded-lg ${
                              activity.status === 'warning' ? 'bg-yellow-50' : 'bg-white'
                            }`}
                          >
                            <div className={`w-2 h-2 mt-1.5 rounded-full ${
                              activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.message}</p>
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{activity.department}</span>
                                <span>{formatTimeAgo(activity.time)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(staffTabMap).map(([tabValue, staffKey]) => (
                          <Button
                            key={tabValue}
                            variant="outline"
                            className="w-full h-24 flex flex-col items-center justify-center gap-2"
                            onClick={() => setActiveTab(tabValue)}
                          >
                            {tabValue === "health-providers" && <Stethoscope className="h-6 w-6" />}
                            {tabValue === "pharmacy" && <Pill className="h-6 w-6" />}
                            {tabValue === "lab" && <Microscope className="h-6 w-6" />}
                            {tabValue === "radiology" && <Scan className="h-6 w-6" />}
                            {tabValue === "receptionists" && <Users className="h-6 w-6" />}
                            <span>Manage {tabValue.split(/(?=[A-Z])/).join(" ")}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {activeTab.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                  </h2>
                  <Button
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setShowAddStaffDialog(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add New
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

                <Card>
                  <CardHeader>
                    <CardTitle>Staff List</CardTitle>
                    <CardDescription>
                      Manage {activeTab.split('-').join(' ')} staff members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-2xl shadow bg-white overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {getStaffColumns().map((column) => (
                                <th
                                  key={column.key}
                                  className="py-3 px-2 text-sm font-bold text-gray-500  text-left whitespace-nowrap"
                                >
                                  {column.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {getStaffList().map((staff) => (
                              <tr key={staff.id} className="hover:bg-gray-50">
                                <td className="py-2 px-2 text-sm text-gray-900 whitespace-nowrap">
                                  {staff.firstName}
                                </td>
                                <td className="py-2 px-2 text-sm text-gray-500 whitespace-nowrap">
                                  {staff.middleName}
                                </td>
                                <td className="py-2 px-2 text-sm text-gray-500 whitespace-nowrap">
                                  {staff.lastName}
                                </td>
                                <td className="py-2 px-2 text-sm text-gray-500 whitespace-nowrap">
                                  {staff.email}
                                </td>
                                <td className="py-2 px-2 text-sm text-gray-500 whitespace-nowrap">
                                  {staff.phone}
                                </td>
                                <td className="py-2 px-2 text-sm text-gray-500 whitespace-nowrap">
                                  {staff.role}
                                </td>
                                <td className="py-2 px-2 text-sm text-gray-500 whitespace-nowrap">
                                  {staff.department}
                                </td>
                                <td className="py-2 px-2 text-sm text-gray-500 whitespace-nowrap">
                                  {staff.password ? "••••••••" : ""}
                                </td>
                                <td className="py-2 px-2 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="w-8 h-8 flex items-center justify-center"
                                      onClick={() => handleEditStaff(staff)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      className="w-8 h-8 flex items-center justify-center"
                                      onClick={() => handleDeleteStaff(staff.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Staff Dialog */}
      <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details for the new staff member. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddStaff();
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    value={addStaffForm.firstName} 
                    onChange={e => setAddStaffForm(f => ({...f, firstName: e.target.value.trim()}))} 
                    placeholder="Enter first name"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input 
                    id="middleName" 
                    value={addStaffForm.middleName} 
                    onChange={e => setAddStaffForm(f => ({...f, middleName: e.target.value.trim()}))} 
                    placeholder="Enter middle name" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    value={addStaffForm.lastName} 
                    onChange={e => setAddStaffForm(f => ({...f, lastName: e.target.value.trim()}))} 
                    placeholder="Enter last name"
                    required 
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
                    onChange={e => setAddStaffForm(f => ({...f, email: e.target.value.trim()}))} 
                    placeholder="Enter email address"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={addStaffForm.phone} 
                    onChange={e => setAddStaffForm(f => ({...f, phone: e.target.value.trim()}))} 
                    placeholder="Enter phone number" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input 
                    id="role" 
                    value={addStaffForm.role} 
                    onChange={e => setAddStaffForm(f => ({...f, role: e.target.value.trim()}))} 
                    placeholder="Enter role"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={addStaffForm.department}
                    onValueChange={value => setAddStaffForm(f => ({ ...f, department: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthProviders">Health Providers</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="lab">Lab</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="receptionists">Receptionists</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="password">Password *</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={addStaffForm.password} 
                  onChange={e => setAddStaffForm(f => ({...f, password: e.target.value}))} 
                  placeholder="Enter password"
                  className="w-full"
                  required 
                  minLength={6}
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
                    phone: "",
                    role: "",
                    department: "",
                    password: ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Add Staff
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          {editStaffForm && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name *</Label>
                  <Input 
                    id="editFirstName" 
                    value={editStaffForm.firstName} 
                    onChange={e => setEditStaffForm(f => ({...f, firstName: e.target.value}))} 
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editMiddleName">Middle Name</Label>
                  <Input 
                    id="editMiddleName" 
                    value={editStaffForm.middleName || ""} 
                    onChange={e => setEditStaffForm(f => ({...f, middleName: e.target.value}))} 
                    placeholder="Enter middle name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name *</Label>
                  <Input 
                    id="editLastName" 
                    value={editStaffForm.lastName} 
                    onChange={e => setEditStaffForm(f => ({...f, lastName: e.target.value}))} 
                    placeholder="Enter last name"
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
                    onChange={e => setEditStaffForm(f => ({...f, email: e.target.value}))} 
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input 
                    id="editPhone" 
                    value={editStaffForm.phone || ""} 
                    onChange={e => setEditStaffForm(f => ({...f, phone: e.target.value}))} 
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editRole">Role *</Label>
                  <Input 
                    id="editRole" 
                    value={editStaffForm.role} 
                    onChange={e => setEditStaffForm(f => ({...f, role: e.target.value}))} 
                    placeholder="Enter role"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDepartment">Department *</Label>
                  <Select
                    value={editStaffForm.department}
                    onValueChange={value => setEditStaffForm(f => ({ ...f, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthProviders">Health Providers</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="lab">Lab</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="receptionists">Receptionists</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="editPassword">Password</Label>
                <Input 
                  id="editPassword" 
                  type="password"
                  value={editStaffForm.password || ""} 
                  onChange={e => setEditStaffForm(f => ({...f, password: e.target.value}))} 
                  placeholder="Enter new password (leave blank to keep current)"
                  className="w-full"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditStaffForm(null);
              setEditStaff(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditStaffSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteStaff}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Admin User</DialogTitle>
            <DialogDescription>
              Create a new administrator account with appropriate access levels
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={addAdminForm.username}
                onChange={(e) => setAddAdminForm(f => ({...f, username: e.target.value}))}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={addAdminForm.email}
                onChange={(e) => setAddAdminForm(f => ({...f, email: e.target.value}))}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={addAdminForm.password}
                onChange={(e) => setAddAdminForm(f => ({...f, password: e.target.value}))}
                placeholder="Enter password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={addAdminForm.role}
                onValueChange={(value) => setAddAdminForm(f => ({...f, role: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Department Admin">Department Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAdminDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setAdminUsers(prev => [...prev, { ...addAdminForm, id: Date.now() }]);
                setShowAddAdminDialog(false);
                setAddAdminForm({
                  username: "",
                  email: "",
                  password: "",
                  role: "Admin",
                  status: "Active"
                });
              }}
            >
              Add Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

