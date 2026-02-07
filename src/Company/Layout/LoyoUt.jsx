import React from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Sidebar from "../Sidebar/Sidebar";

const Layout = () => {
  const location = useLocation();

  // Dashboard qismiga kiruvchi barcha yo'llar ro'yxati
  const dashboardPaths = [
    "/company/dashboard",
    "/company/my-company",
    "/faq",
    "/contacts",
    "/company/my-jobs",
    "/company/settings"
  ];

  // Hozirgi yo'l dashboard'ga tegishlimi yoki yo'qmi tekshiramiz
  const isDashboard = dashboardPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {isDashboard ? (
        /* --- DASHBOARD REJIMI (Faqat Sidebar) --- */
        // Layout.js ichidagi o'zgarish
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
          <aside className="order-2 md:order-1 w-full md:w-[300px] h-auto md:h-full shrink-0">
            <Sidebar />
          </aside>
          <main className="order-1 md:order-2 flex-1 overflow-y-auto p-4 lg:p-10 pb-[100px] md:pb-10">
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