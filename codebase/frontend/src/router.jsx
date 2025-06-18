import React from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import NotFound from "./pages/notefound/NotFound";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import SuperAdminAdmins from "./pages/superadmin/Admins";
import SuperAdminHospitals from "./pages/superadmin/Hospitals";
import DoctorDashboard from "./pages/provider/Dashboard";
import ProviderLayout from "./layouts/ProviderLayout";
import Patients from "./pages/provider/Patients";
import Appointments from "./pages/provider/Appointments";
import MedicalRecord from "./pages/provider/MedicalRecord";
import MedicalRecords from "./pages/provider/MedicalRecords";
import LabResults from "./pages/provider/LabResults";
import LabResultDetails from "./pages/provider/LabResultDetails";
import RadiologyResults from "./pages/radiology/RadiologyResults";
import LabDashboard from "./pages/lab/LabDashboard";
import LabResultForm from "./pages/lab/LabResultForm";
import LabLayout from "./layouts/LabLayout";
import PendingPatientsList from "./pages/lab/PendingPatientsList";
import InProgressPatientsList from "./pages/lab/InProgressPatientsList";
import CompletedPatientsList from "./pages/lab/CompletedPatientsList";
import UrgentPatientsList from "./pages/lab/UrgentPatientsList";
import RadiologistLayout from "./layouts/RadiologistLayout";
import RadiologistDashboard from "./pages/radiologist/RadiologistDashboard";
import RadiologyResultPage from "./pages/radiologist/RadiologyResultPage";
import PendingScansList from "./pages/radiologist/PendingScansList";
import InProgressScansList from "./pages/radiologist/InProgressScansList";
import CompletedScansList from "./pages/radiologist/CompletedScansList";
import UrgentScansList from "./pages/radiologist/UrgentScansList";
import RadiologyResultEntry from "./pages/radiologist/RadiologyResultEntry";
import Header from "./Component/Header/Header";
import Footer from "./Component/Footer/Footer";
import LoginForm from "./Component/LoginForm/LoginForm";
import Home from "./Component/Home/Home";
// import About from "./Component/About/About";
import ReceptionistPage from "./pages/receptionist/ReceptionistPage";
import PharmacyPage from "./pages/pharmacist/PharmacistPage";
import AdminPage from "./pages/admin/AdminPage";
import authService from "@/services/auth.service"; // Adjust the import path as needed

const Layout = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

// ProtectedRoute component to restrict access to authenticated users
const ProtectedRoute = () => {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    // Redirect to login with error message and intended route
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate
        to={`/login?error=You%20must%20first%20login&redirect=${redirectTo}`}
        replace
      />
    );
  }

  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <LoginForm />
      </Layout>
    ),
  },
  // {
  //   path: "/about",
  //   element: (
  //     <Layout>
  //       <About />
  //     </Layout>
  //   ),
  // },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "reception/dashboard",
        element: (
          <Layout>
            <ReceptionistPage />
          </Layout>
        ),
      },
      {
        path: "pharmacy/dashboard",
        element: (
          <Layout>
            <PharmacyPage />
          </Layout>
        ),
      },
      {
        path: "/admin/dashboard",
        element: (
          <Layout>
            <AdminPage />
          </Layout>
        ),
      },
      {
        path: "/superadmin",
        element: (
          <Layout>
            <SuperAdminLayout />
          </Layout>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <SuperAdminDashboard /> },
          { path: "admins", element: <SuperAdminAdmins /> },
          { path: "hospitals", element: <SuperAdminHospitals /> },
        ],
      },
      {
        path: "/provider",
        element: (
          <Layout>
            <ProviderLayout />
          </Layout>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <DoctorDashboard /> },
          { path: "patients", element: <Patients /> },
          { path: "appointments", element: <Appointments /> },
          { path: "medical-records", element: <MedicalRecords /> },
          { path: "medical-record/:patientId", element: <MedicalRecord /> },
          { path: "lab-results", element: <LabResults /> },
          { path: "lab-results/:resultId", element: <LabResultDetails /> },
          { path: "radiology", element: <RadiologyResults /> },
        ],
      },
      {
        path: "/lab",
        element: (
          <Layout>
            <LabLayout />
          </Layout>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <LabDashboard /> },
          { path: "results/:testId", element: <LabResultForm /> },
          { path: "pending-tests", element: <PendingPatientsList /> },
          { path: "in-progress-tests", element: <InProgressPatientsList /> },
          { path: "completed-tests", element: <CompletedPatientsList /> },
          { path: "urgent-tests", element: <UrgentPatientsList /> },
        ],
      },
      {
        path: "/radiology/dashboard",
        element: (
          <Layout>
            <RadiologistLayout />
          </Layout>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <RadiologistDashboard /> },
          { path: "pending-scans", element: <PendingScansList /> },
          { path: "in-progress-scans", element: <InProgressScansList /> },
          { path: "completed-scans", element: <CompletedScansList /> },
          { path: "urgent-scans", element: <UrgentScansList /> },
          { path: "results/:scanId", element: <RadiologyResultEntry /> },
        ],
      },
      {
        path: "/radiology/result/:requestId",
        element: (
          <Layout>
            <RadiologyResultPage />
          </Layout>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <Layout>
        <NotFound />
      </Layout>
    ),
  },
]);

export default router;
