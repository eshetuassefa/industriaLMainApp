import React from 'react';
import { createBrowserRouter } from "react-router-dom";
import NotFound from './pages/notefound/NotFound';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import SuperAdminAdmins from './pages/superadmin/Admins';
import SuperAdminHospitals from './pages/superadmin/Hospitals';
import DoctorDashboard from './pages/provider/Dashboard';
import ProviderLayout from './layouts/ProviderLayout';
import Patients from './pages/provider/Patients';
import Appointments from './pages/provider/Appointments';
import MedicalRecord from './pages/provider/MedicalRecord';
import MedicalRecords from './pages/provider/MedicalRecords';
import LabResults from './pages/provider/LabResults';
import LabResultDetails from './pages/provider/LabResultDetails';
import RadiologyResults from './pages/radiology/RadiologyResults';
import LabDashboard from './pages/lab/LabDashboard';
import LabResultForm from './pages/lab/LabResultForm';
import LabLayout from './layouts/LabLayout';
import PendingPatientsList from './pages/lab/PendingPatientsList';
import InProgressPatientsList from './pages/lab/InProgressPatientsList';
import CompletedPatientsList from './pages/lab/CompletedPatientsList';
import UrgentPatientsList from './pages/lab/UrgentPatientsList';
import RadiologistLayout from './layouts/RadiologistLayout';
import RadiologistDashboard from './pages/radiologist/RadiologistDashboard';
import PendingScansList from './pages/radiologist/PendingScansList';
import InProgressScansList from './pages/radiologist/InProgressScansList';
import CompletedScansList from './pages/radiologist/CompletedScansList';
import UrgentScansList from './pages/radiologist/UrgentScansList';
import RadiologyResultEntry from './pages/radiologist/RadiologyResultEntry';

export const router = createBrowserRouter([
  {
    path: "/superadmin",
    element: <SuperAdminLayout><SuperAdminDashboard /></SuperAdminLayout>,
  },
  {
    path: "/superadmin/admins",
    element: <SuperAdminLayout><SuperAdminAdmins /></SuperAdminLayout>,
  },
  {
    path: "/superadmin/hospitals",
    element: <SuperAdminLayout><SuperAdminHospitals /></SuperAdminLayout>,
  },
  {
    path: "/provider",
    element: <ProviderLayout><DoctorDashboard /></ProviderLayout>,
  },
  {
    path: "/provider/patients",
    element: <ProviderLayout><Patients /></ProviderLayout>,
  },
  {
    path: "/provider/appointments",
    element: <ProviderLayout><Appointments /></ProviderLayout>,
  },
  {
    path: "/provider/medical-records",
    element: <ProviderLayout><MedicalRecords /></ProviderLayout>,
  },
  {
    path: "/provider/medical-record/:patientId",
    element: <ProviderLayout><MedicalRecord /></ProviderLayout>,
  },
  {
    path: "/provider/lab-results",
    element: <ProviderLayout><LabResults /></ProviderLayout>,
  },
  {
    path: "/provider/lab-results/:resultId",
    element: <ProviderLayout><LabResultDetails /></ProviderLayout>,
  },
  {
    path: "/provider/radiology",
    element: <ProviderLayout><RadiologyResults /></ProviderLayout>,
  },
  {
    path: "/lab",
    element: <LabLayout />,
    children: [
      {
        path: "dashboard",
        element: <LabDashboard />,
      },
      {
        path: "results/:testId",
        element: <LabResultForm />,
      },
      {
        path: "pending-tests",
        element: <PendingPatientsList />,
      },
      {
        path: "in-progress-tests",
        element: <InProgressPatientsList />,
      },
      {
        path: "completed-tests",
        element: <CompletedPatientsList />,
      },
      {
        path: "urgent-tests",
        element: <UrgentPatientsList />,
      },
    ],
  },
  {
    path: "/radiologist",
    element: <RadiologistLayout />,
    children: [
      {
        path: "dashboard",
        element: <RadiologistDashboard />,
      },
      {
        path: "pending-scans",
        element: <PendingScansList />,
      },
      {
        path: "in-progress-scans",
        element: <InProgressScansList />,
      },
      {
        path: "completed-scans",
        element: <CompletedScansList />,
      },
      {
        path: "urgent-scans",
        element: <UrgentScansList />,
      },
      {
        path: "results/:scanId",
        element: <RadiologyResultEntry />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]); 