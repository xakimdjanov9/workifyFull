import React from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Sidebar from "../Sidebar/Sidebar";

const Layout = () => {
  const location = useLocation();

  // Dashboard rejimida chiqishi kerak bo'lgan so'zlar (prefixlar)
  const dashboardPrefixes = [
    "/company/dashboard",
    "/company/my-company",
    "/company/my-jobs",
    "/company/job-detail", // ID qismi startsWith bilan baribir o'tadi
    "/company/settings",
    "/faq",
    "/contacts"
  ];

  // Hozirgi yo'l dashboard'ga tegishlimi?
  // startsWith ishlatganimizda ID bo'lsa ham (masalan /company/job-detail/9) to'g'ri ishlaydi
  const isDashboard = dashboardPrefixes.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {isDashboard ? (
        /* --- DASHBOARD REJIMI (Faqat Sidebar) --- */
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
          <aside className="order-2 md:order-1 w-full md:w-[300px] h-auto md:h-full shrink-0">
            <Sidebar />
          </aside>
          <main className="order-1 md:order-2 flex-1 overflow-y-auto p-4 lg:p-10 pb-[100px] md:pb-10">
            {/* Faqat o'ng tomon (qizil bilan chizgan joying) o'zgaradi */}
            <Outlet />
          </main>
        </div>
      ) : (
        /* --- ODDIY REJIM (Header + Content + Footer) --- */
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Outlet />
          </main>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Layout;