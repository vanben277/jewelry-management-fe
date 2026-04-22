import React from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import BannerPopup from "./BannerPopup";

const UserLayout: React.FC = () => {
  return (
    <div className="app">
      <BannerPopup />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default UserLayout;
