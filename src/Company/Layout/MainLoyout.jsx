import React from "react";
import Sidebar from "../Sidebar/Sidebar"; 
import { Outlet } from "react-router-dom";

const MainLoyout = () => {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar chap tomonda qotib turadi */}
      <aside className="sticky top-0 h-screen shrink-0 z-50">
        <Sidebar />
      </aside>

      {/* Sahifalar almashadigan asosiy qism */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* ml (margin-left) o'rniga flex-1 o'zi joyni to'g'ri taqsimlaydi */}
        <div className="p-4 lg:p-8">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default MainLoyout;