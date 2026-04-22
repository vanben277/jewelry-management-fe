import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import HeadAdmin from "./Head";
import FooterAdmin from "./Footer";
import Sidebar from "./Sidebar";

const AdminLayout: React.FC = () => {
  const [isPinned, setIsPinned] = useState(false);

  const toggleSidenav = () => {
    setIsPinned((prev) => !prev);
  };

  useEffect(() => {
    if (isPinned) {
      document.body.classList.add("g-sidenav-pinned");
    } else {
      document.body.classList.remove("g-sidenav-pinned");
    }
    return () => {
      document.body.classList.remove("g-sidenav-pinned");
    };
  }, [isPinned]);

  return (
    <div
      className={`g-sidenav-show bg-gray-100 ${isPinned ? "g-sidenav-pinned" : ""}`}
    >
      <Sidebar />

      <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg mr-[1%]">
        <HeadAdmin onToggleSidenav={toggleSidenav} />

        <div className="container-fluid py-4">
          <Outlet />
          <FooterAdmin />
        </div>
      </main>

      {isPinned && (
        <div
          className="fixed inset-0 z-[990] bg-black/30 d-xl-none"
          onClick={toggleSidenav}
        />
      )}
    </div>
  );
};

export default AdminLayout;
