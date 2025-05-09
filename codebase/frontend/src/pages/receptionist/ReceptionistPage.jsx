"use client";

import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { format } from "date-fns";
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
  UsersRound
} from "lucide-react";

// Sample data
const initialPatients = [
  {
    id: 1,
    name: "John Doe",
    nationalId: "1234567890",
    dob: "1985-05-15",
    contact: "555-123-4567",
    email: "john.doe@example.com",
    address: "123 Main St",
    insurance: "BlueCross #12345",
    lastVisit: "2023-11-10",
  },
  
   {
    id: 2,
    name: "Firomsa Mitiku",
    nationalId: "2345678901", // Add nationalId
    dob: "1990-08-22",
    contact: "555-987-6543",
    email: "jane.smith@example.com",
    address: "456 Oak Ave",
    insurance: "Aetna #67890",
    lastVisit: "2023-12-05",
  },
  {
    id: 3,
    name: "Robert Johnson",
    nationalId: "3456789012", // Add nationalId
    dob: "1978-03-30",
    contact: "555-456-7890",
    email: "robert.j@example.com",
    address: "789 Pine Rd",
    insurance: "UnitedHealth #54321",
    lastVisit: "2024-01-15",
  },
  {
    id: 4,
    name: "Duresa Guya",
    nationalId: "4567890123", // Add nationalId
    dob: "1995-11-12",
    contact: "555-789-0123",
    email: "emily.d@example.com",
    address: "321 Elm St",
    insurance: "Cigna #09876",
    lastVisit: "2024-02-20",
  },
];

const initialAppointments = [
  {
    id: 1,
    patientId: 1,
    patientName: "Awoke Worket",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    doctor: "Dr. Sarah Wilson",
    department: "General Medicine",
    status: "Confirmed",
    notes: "Follow-up appointment",
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Israel Abebe",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:30",
    doctor: "Dr. Michael Chen",
    department: "Cardiology",
    status: "Checked In",
    notes: "Annual checkup",
  },
  {
    id: 3,
    patientId: 3,
    patientName: "Eshetu Assefa",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "13:15",
    doctor: "Dr. Lisa Brown",
    department: "Orthopedics",
    status: "Waiting",
    notes: "Knee pain assessment",
  },
  {
    id: 4,
    patientId: 4,
    patientName: "Emily Davis",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "11:00",
    doctor: "Dr. James Taylor",
    department: "Dermatology",
    status: "Confirmed",
    notes: "Skin rash examination",
  },
  {
    id: 5,
    patientId: 1,
    patientName: "John Doe",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "14:45",
    doctor: "Dr. Sarah Wilson",
    department: "General Medicine",
    status: "Scheduled",
    notes: "Medication review",
  },
];

const doctors = [
  {
    id: 1,
    name: "Dr. Muhammad Ali",
    department: "General Medicine",
    availability: ["09:00", "10:00", "11:00", "14:00", "15:00"],
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    department: "Cardiology",
    availability: ["09:30", "10:30", "13:30", "14:30"],
  },
  {
    id: 3,
    name: "Dr. Lisa Brown",
    department: "Orthopedics",
    availability: ["08:00", "09:00", "13:15", "16:00"],
  },
  {
    id: 4,
    name: "Dr. James Taylor",
    department: "Dermatology",
    availability: ["11:00", "12:00", "15:30", "16:30"],
  },
];



export default function ReceptionistPage() {

  const [patients, setPatients] = useState(initialPatients);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] =
    useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");

    // Add state for editing patient
const [isEditing, setIsEditing] = useState(false);
const [editingPatient, setEditingPatient] = useState(null);

const [todayAppointments, setTodayAppointments] = useState([]);
const todayDate = format(new Date(), "yyyy-MM-dd");


const [newPatient, setNewPatient] = useState({
  name: "",
  nationalId: "", // Add national ID
  dob: "",
  contact: "",
  email: "",
  address: "",
  insurance: "",
});
// Add user state at the top of the component
const [user, setUser] = useState({
  name: "John Smith", // This would come from your authentication system
  role: "Receptionist"
});

const [showForwardDialog, setShowForwardDialog] = useState(false);
const [forwardDetails, setForwardDetails] = useState({
  patientId: "",
  providerId: "",
  reason: "",
  priority: "normal",
});
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    date: new Date(),
    time: "",
    doctor: "",
    department: "",
    notes: "",
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "John Doe checked in for his appointment",
      time: "5 minutes ago",
    },
    {
      id: 2,
      message: "New appointment request from Emily Davis",
      time: "20 minutes ago",
    },
    {
      id: 3,
      message: "Dr. Wilson is running 15 minutes late",
      time: "1 hour ago",
    },
  ]);

  // Update the filters state with proper date initialization
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    status: "all",
    doctor: "all",
    department: "all"
  });

  // Update the handleApplyFilters function with proper date handling
  const handleApplyFilters = () => {
    try {
      const filteredAppointments = appointments.filter(appointment => {
        // Ensure we have valid dates for comparison
        let appointmentDate;
        if (typeof appointment.date === 'string') {
          appointmentDate = appointment.date;
        } else if (appointment.date instanceof Date) {
          appointmentDate = format(appointment.date, "yyyy-MM-dd");
        } else {
          console.error('Invalid appointment date:', appointment.date);
          return false;
        }

        // Format filter date consistently
        const filterDate = typeof filters.date === 'string' 
          ? filters.date 
          : format(new Date(filters.date), "yyyy-MM-dd");

        const matchesDate = appointmentDate === filterDate;
        const matchesStatus = filters.status === "all" || appointment.status.toLowerCase() === filters.status.toLowerCase();
        const matchesDoctor = filters.doctor === "all" || appointment.doctor === filters.doctor;
        const matchesDepartment = filters.department === "all" || appointment.department === filters.department;

        return matchesDate && matchesStatus && matchesDoctor && matchesDepartment;
      });

      setFilteredAppointments(filteredAppointments);
    } catch (error) {
      console.error('Error applying filters:', error);
      setFilteredAppointments(appointments);
    }
  };

  // Add this state for filtered appointments
  const [filteredAppointments, setFilteredAppointments] = useState(appointments);

  // Filter patients based on search query
 const filteredPatients = patients.filter(
  (patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient.nationalId && patient.nationalId.includes(searchQuery)) || // Add null check
    patient.contact.includes(searchQuery) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
);

  // Today's appointments

// Update the useEffect for today's appointments with better filtering
useEffect(() => {
  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = typeof appointment.date === 'string' 
      ? appointment.date 
      : format(appointment.date, "yyyy-MM-dd");
    return appointmentDate === todayDate;
  });
  setTodayAppointments(filteredAppointments);
}, [appointments, todayDate]);
const formatDate = (date) => {
  if (typeof date === 'string') return date;
  return format(date, "yyyy-MM-dd");
};
  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  // Add handleEditPatient function
const handleEditPatient = (patient) => {
  setEditingPatient({...patient}); // Create a copy of the patient object
  setIsEditing(true);
  setShowNewPatientDialog(true);
};
// Add handleUpdatePatient function
const handleUpdatePatient = () => {
  if (!editingPatient) return;
  
  const updatedPatients = patients.map((patient) =>
    patient.id === editingPatient.id ? { ...editingPatient } : patient
  );
  
  setPatients(updatedPatients);
  setIsEditing(false);
  setEditingPatient(null);
  setShowNewPatientDialog(false);
  addNotification(`Patient ${editingPatient.name} has been updated`);
};
  // Handle new patient form submission
  const handleNewPatientSubmit = () => {
    const newPatientId =
      patients.length > 0 ? Math.max(...patients.map((p) => p.id)) + 1 : 1;
    const patientToAdd = {
      ...newPatient,
      id: newPatientId,
      lastVisit: format(new Date(), "yyyy-MM-dd"),
    };
    setPatients([...patients, patientToAdd]);
     setNewPatient({
    name: "",
    nationalId: "", // Add this line
    dob: "",
    contact: "",
    email: "",
    address: "",
    insurance: "",
  });
    setShowNewPatientDialog(false);

    // Add notification
    addNotification(`New patient ${patientToAdd.name} has been registered`);
  };

  // Handle new appointment form submission
  const handleNewAppointmentSubmit = () => {
    const newAppointmentId =
      appointments.length > 0
        ? Math.max(...appointments.map((a) => a.id)) + 1
        : 1;
    const selectedPatientData = patients.find(
      (p) => p.id === Number.parseInt(newAppointment.patientId)
    );

    const appointmentToAdd = {
      ...newAppointment,
      id: newAppointmentId,
      patientName: selectedPatientData.name,
      date: format(newAppointment.date, "yyyy-MM-dd"),
      status: "Scheduled",
    };

    setAppointments((prevAppointments) => [...prevAppointments, appointmentToAdd]);
    setNewAppointment({
      patientId: "",
      date: new Date(),
      time: "",
      doctor: "",
      department: "",
      notes: "",
    });
    setShowNewAppointmentDialog(false);

    // Add notification
    addNotification(
      `New appointment scheduled for ${selectedPatientData.name} on ${format(
        newAppointment.date,
        "MMM dd, yyyy"
      )} at ${newAppointment.time}`
    );
  };
  const handleForwardSubmit = () => {
  // Here you would typically make an API call to forward the patient
  addNotification(`Patient ${selectedPatient.name} has been forwarded to healthcare provider`);
  setShowForwardDialog(false);
  setForwardDetails({
    patientId: "",
    providerId: "",
    reason: "",
    priority: "normal",
  });
};

 // Update the updateAppointmentStatus function
const updateAppointmentStatus = (appointmentId, newStatus) => {
  setAppointments((prevAppointments) =>
    prevAppointments.map((appointment) => {
      if (appointment.id === appointmentId) {
        const updatedAppointment = {
          ...appointment,
          status: newStatus,
          date: typeof appointment.date === 'string' 
            ? appointment.date 
            : format(appointment.date, "yyyy-MM-dd")
        };
        
        // Add notification for status change
        const patient = patients.find((p) => p.id === appointment.patientId);
        if (patient) {
          addNotification(
            `${patient.name}'s appointment status changed to ${newStatus}`
          );
        }
        
        return updatedAppointment;
      }
      return appointment;
    })
  );
};

  // Add notification
  const addNotification = (message) => {
    const newNotification = {
      id:
        notifications.length > 0
          ? Math.max(...notifications.map((n) => n.id)) + 1
          : 1,
      message,
      time: "Just now",
    };
    setNotifications([newNotification, ...notifications]);
  };
  
// Add this useEffect to update today's appointments
useEffect(() => {
  const filteredAppointments = appointments.filter(
    (appointment) => appointment.date === todayDate
  );
  setTodayAppointments(filteredAppointments);
}, [appointments, todayDate]);

  // Update available times when doctor is selected
  useEffect(() => {
    if (newAppointment.doctor) {
      const doctor = doctors.find((d) => d.name === newAppointment.doctor);
      if (doctor) {
        setSelectedDoctor(doctor);
        setAvailableTimes(doctor.availability);
        setNewAppointment((prev) => ({
          ...prev,
          department: doctor.department,
          time: "",
        }));
      }
    }
  }, [newAppointment.doctor]);

  return (
   <div className="min-h-screen flex flex-col">
    {/* Header */}
    <header className="fixed top-0 left-0 right-0 bg-white text-black shadow-md z-50">
      <div className="container mx-auto px-4 p-2 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Receptionist Page</h1>
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
      {/* Main Content */}
    <div className="flex pt-20">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-16 h-[calc(100vh-5rem)] w-60 bg-gray-50 border-r border-gray-200 z-10 overflow-y-auto">
        <div className="flex flex-col gap-1 p-4">
          {[
            { value: "dashboard", label: "Dashboard", icon: Building2 },
            { value: "appointments", label: "Appointments", icon: CalendarDays },
            { value: "patients", label: "Patients", icon: UserCircle },
            { value: "queue", label: "Queue Management", icon: UsersRound },
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
          {/* Dashboard Tab */}
            <div className="flex-1 ml-60 px-6 pb-6">
   {activeTab === "dashboard" && (
  <div className="space-y-4">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Today's Appointments Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Today's Appointments</CardTitle>
          <CardDescription>
            {format(new Date(), "MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {todayAppointments.length}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            <span className="text-green-500 font-medium">
              {todayAppointments.filter(a => a.status === "Checked In").length}
            </span>{" "}
            checked in,{" "}
            <span className="text-yellow-500 font-medium">
              {todayAppointments.filter(a => a.status === "Waiting").length}
            </span>{" "}
            waiting,{" "}
              <span className="text-blue-500 font-medium">
              {todayAppointments.filter(a => a.status === "Confirmed").length}
            </span>{" "}
            confirmed
          </div>
        </CardContent>
      </Card>

       {/* Patient Check-ins Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Patient Check-ins</CardTitle>
          <CardDescription>Today's activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {todayAppointments.filter(a => a.status === "Checked In").length}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            <span className="text-green-500 font-medium">
              {Math.round(
                (todayAppointments.filter(a => a.status === "Checked In").length /
                  (todayAppointments.length || 1)) *
                  100
              )}
              %
            </span>{" "}
            of today's appointments
          </div>
        </CardContent>
      </Card>

   {/* Recent Activity Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="flex items-start space-x-2"
              >
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

  {/* Today's Schedule and Quick Actions */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Today's Schedule */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>
            Appointments for {format(new Date(), "MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Avatar>
                        <AvatarFallback>
                          {appointment.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                      </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="font-medium">
                        {appointment.patientName}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1 h-3 w-3" />
                        {appointment.time}
                        <span className="mx-2">•</span>
                        {appointment.doctor}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={
                        appointment.status === "Checked In"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "Waiting"
                          ? "bg-yellow-100 text-yellow-800"
                          : appointment.status === "Confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }
                            >
                      {appointment.status}
                    </Badge>
                    <Select
                      onValueChange={(value) =>
                        updateAppointmentStatus(appointment.id, value)
                      }
                      defaultValue={appointment.status}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Checked In">Check In</SelectItem>
                        <SelectItem value="Waiting">Waiting</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
           </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CalendarIcon2 className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No appointments scheduled for today</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => setShowNewAppointmentDialog(true)}
          >
            Schedule New Appointment
          </Button>
        </CardFooter>
      </Card>

       {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={() => setShowNewPatientDialog(true)}
          >
            Register New Patient
          </Button>
          <Button
            onClick={() => setShowNewAppointmentDialog(true)}
          >
            Schedule Appointment
          </Button>
         <Button
            onClick={() => setActiveTab("appointments")}
          >
            View Today's Schedule
          </Button>
          <Button
            onClick={() => setActiveTab("queue")}
          >
            Manage Patient Queue
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
)}

          {/* Appointments Tab */}
       {activeTab === "appointments" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Appointments</h2>
              <Button 
                onClick={() => setShowNewAppointmentDialog(true)}
              >
                Schedule New Appointment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Filter Appointments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-filter">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.date ? format(new Date(filters.date), "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.date ? new Date(filters.date) : new Date()}
                          onSelect={(date) => {
                            if (date) {
                              setFilters({ ...filters, date: format(date, "yyyy-MM-dd") });
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Checked In">Checked In</SelectItem>
                        <SelectItem value="Waiting">Waiting</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-filter">Doctor</Label>
                    <Select
                      value={filters.doctor}
                      onValueChange={(value) => setFilters({ ...filters, doctor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All doctors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All doctors</SelectItem>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.name}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department-filter">Department</Label>
                    <Select
                      value={filters.department}
                      onValueChange={(value) => setFilters({ ...filters, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All departments</SelectItem>
                        <SelectItem value="General Medicine">General Medicine</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline"
                    className="w-full mb-2"
                    onClick={() => {
                      setFilters({
                        date: new Date().toISOString().split('T')[0],
                        status: "all",
                        doctor: "all",
                        department: "all"
                      });
                      setFilteredAppointments(appointments);
                    }}
                  >
                    Reset Filters
                  </Button>

                  <Button 
                    className="w-full"
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Appointment List</CardTitle>
                  <CardDescription>
                    Showing {filteredAppointments.length} appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <Avatar>
                              <AvatarFallback>
                                {appointment.patientName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <p className="font-medium">
                              {appointment.patientName}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarIcon2 className="mr-1 h-3 w-3" />
                              {appointment.date}
                              <span className="mx-1">•</span>
                              <Clock className="mr-1 h-3 w-3" />
                              {appointment.time}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.doctor} • {appointment.department}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              appointment.status === "Checked In"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : appointment.status === "Waiting"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : appointment.status === "Confirmed"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : appointment.status === "Completed"
                                ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                : appointment.status === "Cancelled"
                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {appointment.status}
                          </Badge>
                          <Select
                            onValueChange={(value) =>
                              updateAppointmentStatus(appointment.id, value)
                            }
                            defaultValue={appointment.status}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Scheduled">
                                Scheduled
                              </SelectItem>
                              <SelectItem value="Confirmed">
                                Confirmed
                              </SelectItem>
                              <SelectItem value="Checked In">
                                Check In
                              </SelectItem>
                              <SelectItem value="Waiting">Waiting</SelectItem>
                              <SelectItem value="In Progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="Completed">
                                Completed
                              </SelectItem>
                              <SelectItem value="Cancelled">Cancel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
       </div>
        )}

          {/* Patients Tab */}
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

            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search patients by  national_id, name, email, or phone..."
                className="flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient List</CardTitle>
                    <CardDescription>
                      {filteredPatients.length} patients found
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                            selectedPatient?.id === patient.id
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-gray-500">
                                {patient.contact}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                {selectedPatient ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{selectedPatient.name}</CardTitle>
                          <CardDescription>
                            Patient ID: {selectedPatient.id}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditPatient(selectedPatient)}>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewAppointment((prev) => ({
                                ...prev,
                                patientId: selectedPatient.id.toString(),
                              }));
                              setShowNewAppointmentDialog(true);
                            }}
                          >
                            Schedule Appointment
                          </Button>
                           <Button
    variant="outline"
    size="sm"
    onClick={() => {
      setForwardDetails({
        ...forwardDetails,
        patientId: selectedPatient.id.toString(),
      });
      setShowForwardDialog(true);
    }}
  >
    Forward to Provider
  </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                           <div>
    <h3 className="text-sm font-medium text-gray-500">National ID</h3>
    <p>{selectedPatient.nationalId}</p>
  </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Date of Birth
                            </h3>
                            <p>{selectedPatient.dob}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Contact Number
                            </h3>
                            <p>{selectedPatient.contact}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Email
                            </h3>
                            <p>{selectedPatient.email}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Address
                            </h3>
                            <p>{selectedPatient.address}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Insurance
                            </h3>
                            <p>{selectedPatient.insurance}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Last Visit
                            </h3>
                            <p>{selectedPatient.lastVisit}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">
                          Appointment History
                        </h3>
                        <div className="space-y-2">
                          {appointments
                            .filter(
                              (appointment) =>
                                appointment.patientId === selectedPatient.id
                            )
                            .map((appointment) => (
                              <div
                                key={appointment.id}
                                className="p-3 border rounded-lg"
                              >
                                <div className="flex justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {appointment.date} at {appointment.time}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {appointment.doctor} •{" "}
                                      {appointment.department}
                                    </p>
                                  </div>
                                  <Badge
                                    className={
                                      appointment.status === "Checked In"
                                        ? "bg-green-100 text-green-800"
                                        : appointment.status === "Waiting"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : appointment.status === "Confirmed"
                                        ? "bg-blue-100 text-blue-800"
                                        : appointment.status === "Completed"
                                        ? "bg-gray-100 text-gray-800"
                                        : appointment.status === "Cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }
                                  >
                                    {appointment.status}
                                  </Badge>
                                </div>
                                {appointment.notes && (
                                  <p className="text-sm text-gray-500 mt-2">
                                    Notes: {appointment.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          {appointments.filter(
                            (appointment) =>
                              appointment.patientId === selectedPatient.id
                          ).length === 0 && (
                            <p className="text-gray-500 text-center py-4">
                              No appointment history found
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">
                        Select a patient to view details
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

          {/* Queue Management Tab */}
         {activeTab === "queue" && (
          <div className="space-y-4">
            {/* <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Queue Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline">Refresh Queue</Button>
                <Button>Call Next Patient</Button>
              </div>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Waiting Room</CardTitle>
                  <CardDescription>
                    Patients checked in and waiting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {appointments
                      .filter(
                        (appointment) =>
                          appointment.status === "Waiting" &&
                          appointment.date === todayDate
                      )
                      .map((appointment, index) => (
                        <div
                          key={appointment.id}
                          className="p-3 border rounded-lg flex justify-between items-center hover:bg-yellow-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-yellow-100 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">
                                {appointment.patientName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.time} • {appointment.doctor}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "In Progress"
                                )
                              }
                              className="hover:bg-yellow-100 hover:text-yellow-800"
                            >
                              Call
                            </Button>
                          </div>
                        </div>
                      ))}
                    {appointments.filter(
                      (appointment) =>
                        appointment.status === "Waiting" &&
                        appointment.date === todayDate
                    ).length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No patients waiting
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>In Progress</CardTitle>
                  <CardDescription>Currently with doctor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {appointments
                      .filter(
                        (appointment) =>
                          appointment.status === "In Progress" &&
                          appointment.date === todayDate
                      )
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 border rounded-lg flex justify-between items-center hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                              <Clock className="h-3 w-3" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {appointment.patientName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.doctor} • {appointment.department}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "Completed"
                                )
                              }
                              className="hover:bg-blue-100 hover:text-blue-800"
                            >
                              Complete
                            </Button>
                          </div>
                        </div>
                      ))}
                    {appointments.filter(
                      (appointment) =>
                        appointment.status === "In Progress" &&
                        appointment.date === todayDate
                    ).length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No patients in progress
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completed</CardTitle>
                  <CardDescription>
                    Today's completed appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {appointments
                      .filter(
                        (appointment) =>
                          appointment.status === "Completed" &&
                          appointment.date === todayDate
                      )
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 border rounded-lg flex justify-between items-center hover:bg-green-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                              ✓
                            </div>
                            <div>
                              <p className="font-medium">
                                {appointment.patientName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.doctor} • {appointment.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    {appointments.filter(
                      (appointment) =>
                        appointment.status === "Completed" &&
                        appointment.date === todayDate
                    ).length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No completed appointments
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Queue Overview</CardTitle>
                <CardDescription>
                  Current status for all departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    "General Medicine",
                    "Cardiology",
                    "Orthopedics",
                    "Dermatology",
                  ].map((department) => {
                    const deptAppointments = appointments.filter(
                      (a) => a.department === department && a.date === todayDate
                    );
                    const waiting = deptAppointments.filter(
                      (a) => a.status === "Waiting"
                    ).length;
                    const inProgress = deptAppointments.filter(
                      (a) => a.status === "In Progress"
                    ).length;
                    const completed = deptAppointments.filter(
                      (a) => a.status === "Completed"
                    ).length;

                    return (
                      <div key={department} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{department}</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Waiting:</span>
                            <span className="font-medium text-yellow-600">
                              {waiting}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">In Progress:</span>
                            <span className="font-medium text-blue-600">
                              {inProgress}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Completed:</span>
                            <span className="font-medium text-green-600">
                              {completed}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium">
                              {deptAppointments.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
 </div>
        )}
      </div>
    </div>
      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Forward Patient to Healthcare Provider</DialogTitle>
      <DialogDescription>
        Select a healthcare provider and provide forwarding details.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="provider">Healthcare Provider</Label>
        <Select
          value={forwardDetails.providerId}
          onValueChange={(value) =>
            setForwardDetails({ ...forwardDetails, providerId: value })
          }
           >
          <SelectTrigger>
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id.toString()}>
                {doctor.name} - {doctor.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={forwardDetails.priority}
          onValueChange={(value) =>
            setForwardDetails({ ...forwardDetails, priority: value })
          }
   >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Forwarding</Label>
        <Textarea
          id="reason"
          value={forwardDetails.reason}
          onChange={(e) =>
            setForwardDetails({ ...forwardDetails, reason: e.target.value })
          }
          placeholder="Enter reason for forwarding the patient"
        />
         </div>
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setShowForwardDialog(false)}
      >
        Cancel
      </Button>
      <Button
        onClick={handleForwardSubmit}
        disabled={!forwardDetails.providerId || !forwardDetails.reason}
      >
        Forward Patient
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      {/* New Patient Dialog */}
      <Dialog
         open={showNewPatientDialog}
  onOpenChange={(open) => {
    setShowNewPatientDialog(open);
    if (!open) {
      setIsEditing(false);
      setEditingPatient(null);
    }
  }}
      >
     <DialogContent className="sm:max-w-[500px]">
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
          <Label htmlFor="name">Full Name</Label>
        <Input
        id="name"
        value={isEditing ? editingPatient.name : newPatient.name}
        onChange={(e) =>
          isEditing
            ? setEditingPatient({ ...editingPatient, name: e.target.value })
            : setNewPatient({ ...newPatient, name: e.target.value })
        }
        placeholder="John Doe"
        required
      />
        </div>
    <div className="space-y-2">
      <Label htmlFor="nationalId">National ID</Label>
      <Input
        id="nationalId"
        value={isEditing ? editingPatient.nationalId : newPatient.nationalId}
        onChange={(e) =>
          isEditing
            ? setEditingPatient({ ...editingPatient, nationalId: e.target.value })
            : setNewPatient({ ...newPatient, nationalId: e.target.value })
        }
        placeholder="Enter national ID"
        required
      />
        </div>
    <div className="space-y-2">
      <Label htmlFor="dob">Date of Birth</Label>
      <Input
        id="dob"
        type="date"
        value={isEditing ? editingPatient.dob : newPatient.dob}
        onChange={(e) =>
          isEditing
            ? setEditingPatient({ ...editingPatient, dob: e.target.value })
            : setNewPatient({ ...newPatient, dob: e.target.value })
        }
      />
              </div>
  </div>
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="contact">Contact Number</Label>
      <Input
        id="contact"
        value={isEditing ? editingPatient.contact : newPatient.contact}
        onChange={(e) =>
          isEditing
            ? setEditingPatient({ ...editingPatient, contact: e.target.value })
            : setNewPatient({ ...newPatient, contact: e.target.value })
        }
        placeholder="555-123-4567"
      />
            </div>
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={isEditing ? editingPatient.email : newPatient.email}
        onChange={(e) =>
          isEditing
            ? setEditingPatient({ ...editingPatient, email: e.target.value })
            : setNewPatient({ ...newPatient, email: e.target.value })
        }
        placeholder="john.doe@example.com"
      />
              </div>
  </div>
  <div className="space-y-2">
    <Label htmlFor="address">Address</Label>
    <Input
      id="address"
      value={isEditing ? editingPatient.address : newPatient.address}
      onChange={(e) =>
        isEditing
          ? setEditingPatient({ ...editingPatient, address: e.target.value })
          : setNewPatient({ ...newPatient, address: e.target.value })
      }
      placeholder="123 Main St, City, State, ZIP"
    />
           </div>
  <div className="space-y-2">
    <Label htmlFor="insurance">Insurance Information</Label>
    <Input
      id="insurance"
      value={isEditing ? editingPatient.insurance : newPatient.insurance}
      onChange={(e) =>
        isEditing
          ? setEditingPatient({ ...editingPatient, insurance: e.target.value })
          : setNewPatient({ ...newPatient, insurance: e.target.value })
      }
      placeholder="Insurance Provider & Policy Number"
    />
  </div>
</div>
      <DialogFooter>
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
          isEditing
            ? !editingPatient.name || !editingPatient.nationalId
            : !newPatient.name || !newPatient.nationalId
        }
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isEditing ? "Update Patient" : "Register Patient"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* New Appointment Dialog */}
      <Dialog
        open={showNewAppointmentDialog}
        onOpenChange={setShowNewAppointmentDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Fill in the details to schedule a new appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select
                value={newAppointment.patientId}
                onValueChange={(value) =>
                  setNewAppointment({ ...newAppointment, patientId: value })
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
              <Label>Appointment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newAppointment.date
                      ? format(newAppointment.date, "PPP")
                      : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newAppointment.date}
                    onSelect={(date) =>
                      setNewAppointment({ ...newAppointment, date: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Select
                value={newAppointment.doctor}
                onValueChange={(value) =>
                  setNewAppointment({ ...newAppointment, doctor: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.name}>
                      {doctor.name} - {doctor.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Appointment Time</Label>
              <Select
                value={newAppointment.time}
                onValueChange={(value) =>
                  setNewAppointment({ ...newAppointment, time: value })
                }
                disabled={!selectedDoctor}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedDoctor ? "Select a time" : "Select a doctor first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newAppointment.notes}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    notes: e.target.value,
                  })
                }
                placeholder="Reason for visit, special requirements, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewAppointmentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNewAppointmentSubmit}
              disabled={
                !newAppointment.patientId ||
                !newAppointment.date ||
                !newAppointment.doctor ||
                !newAppointment.time
              }
            >
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
