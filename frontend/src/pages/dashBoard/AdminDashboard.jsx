import { useState } from "react";
import Courses from "./DCourses";
import Dashboard from "./Dashboard";
import SideBar from "./SideBar";
import Users from "./DUsers";
import Instructors from "./DInstructors";
import Payments from "./DPayments";

import { authService } from "../../api/auth.service";

function AdminDashboard() {
  const [current, setCurrent] = useState(() => localStorage.getItem("adminActiveTab") || "dashboard");
  const isAuthenticated = authService.isAdminAuthenticated();

  const renderContent = () => {
    switch (current) {
      case "dashboard":
        return <Dashboard isAuthenticated={isAuthenticated} />;
      case "user":
        return <Users />;
      case "courses":
        return <Courses />;
      case "instructors":
        return <Instructors />;
      case "payments":
        return <Payments />;
      default:
        return <Dashboard isAuthenticated={isAuthenticated} />;
    }
  };

  const handleSelect = (key) => {
    setCurrent(key);
    try { localStorage.setItem("adminActiveTab", key); } catch { }
  };

  return (
    <div className="flex min-h-screen">
      <SideBar current={current} onSelect={handleSelect} />

      <section className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 transition-all duration-300">
        <main className="p-8 font-poppins">
          {renderContent()}
        </main>
      </section>
    </div>
  );
}

export default AdminDashboard;
