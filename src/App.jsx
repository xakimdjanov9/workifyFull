import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

import { useTheme } from "./talent/Context/ThemeContext";

import Layout from "./Company/Layout/LoyoUt.jsx";
import Talents from "./Company/Talend/Talents.jsx";
import TalentDetail from "./Company/Talend/TalentDetail.jsx";
import Jobs from "./Company/Jobs/Jobs.jsx";
import Home from "./Company/Home/Home.jsx";
import SignUpPage from "./Company/Register/Register.jsx";
import SignInCompany from "./Company/Login/Login.jsx";
import DashboardCompany from "./Company/Dashboard/Dashboard.jsx";
import MyCompany from "./Company/MyCompany/MyCompany.jsx";

const ProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return <Navigate to="/company/signin" replace />;
  return children ? children : <Outlet />;
};

function App() {
  const { settings } = useTheme();

  return (
    <div
      className={`min-h-screen ${settings.darkMode ? "bg-[#121212]" : "bg-[#F8F9FA]"}`}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        <Route element={<Layout />}>
          <Route path="/company/signin" element={<SignInCompany />} />
          <Route path="/company/signup" element={<SignUpPage />} />

          <Route path="/company/talents" element={<Talents />} />
          <Route path="/company/talents/:id" element={<TalentDetail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/company/dashboard" element={<DashboardCompany />} />
            <Route path="/company/my-company" element={<MyCompany />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
