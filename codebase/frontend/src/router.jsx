import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./Component/Header/Header";
import LoginForm from "./Component/LoginForm/LoginForm";
import Home from "./Component/Home/Home";
import About from "./Component/About/About";
import Footer from "./Component/Footer/Footer";
import ReceptionistPage from "./pages/receptionist/ReceptionistPage"; // Import ReceptionistPage
import PharmacyPage from "./pages/pharmacist/PharmacistPage";
import AdminPage from "./pages/admin/AdminPage";

const router = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/about" element={<About />} />
        <Route path="/receptionist" element={<ReceptionistPage />} />
        <Route path="/pharmacist" element={<PharmacyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        {/* Add AdminMenu route */}
      </Routes>
      <Footer />
    </>
  );
};

export default router;
