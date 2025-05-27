import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoctorDashboard from './pages/provider/Dashboard';
import Patients from './pages/provider/Patients';
import MedicalRecord from './pages/provider/MedicalRecord';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/provider/dashboard" element={<DoctorDashboard />} />
        <Route path="/provider/patients" element={<Patients />} />
        <Route path="/provider/medical-record/:patientId" element={<MedicalRecord />} />
      </Routes>
    </Router>
  );
};

export default App;
