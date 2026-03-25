import React from "react";
import { Link } from "react-router-dom";

const BottomNav: React.FC = () => {
  return (
    <div className="home-bottom-nav">
      <Link to="/my-home" className="home-bottom-nav-item">
        <div className="home-bottom-nav-hover">
          <img
            src="https://cdn.pnj.io/images/customer/home/ic-solar_home-angle-bold-duotone.svg"
            alt="Home"
          />
        </div>
        <span>Trang chủ</span>
      </Link>

      <Link to="/" className="home-bottom-nav-item">
        <div className="home-bottom-nav-image">
          <img
            src="https://cdn.pnj.io/images/customer/home/ic_chat_and_phone.svg"
            width="24"
            alt="Phone"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
        <span>Tư vấn</span>
      </Link>

      <Link to="/my-account" className="home-bottom-nav-item">
        <div className="home-bottom-nav-hover">
          <img
            src="https://cdn.pnj.io/images/customer/home/ic_user.svg"
            alt="Account"
          />
        </div>
        <span>Tài khoản</span>
      </Link>
    </div>
  );
};

export default BottomNav;
