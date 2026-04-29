import React from "react";
import { useLocation, Link } from "react-router-dom";
import { STORAGE_KEYS } from '../../constants';

interface HeadProps {
  onToggleSidenav?: () => void;
}

const Head: React.FC<HeadProps> = ({ onToggleSidenav }) => {
  const location = useLocation();

  const userInfoRaw = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;

  const userAvatar =
    userInfo?.avatar ||
    "https://cdn-icons-png.flaticon.com/512/8345/8345328.png";

  const getPageName = (path: string) => {
    if (path.includes("dashboard")) return "Bảng điều khiển";
    if (path.includes("accounts")) return "Quản lý tài khoản";
    if (path.includes("orders")) return "Quản lý đơn hàng";
    if (path.includes("categories")) return "Quản lý danh mục";
    if (path.includes("products")) return "Quản lý sản phẩm";
    if (path.includes("profile")) return "Thông tin cá nhân";
    return "Trang sức PNJ";
  };

  return (
    <nav
      className="navbar navbar-main navbar-expand-lg px-0 mx-3 shadow-none border-radius-xl"
      id="navbarBlur"
      data-scroll="true"
    >
      <div className="container-fluid py-1 px-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
            <li className="breadcrumb-item">
              <a
                className="opacity-5 text-dark text-[1.4rem] font-medium"
                href="/admin/dashboard"
              >
                Trang
              </a>
            </li>
            <li
              className="breadcrumb-item !text-[1.4rem] text-dark active font-medium"
              aria-current="page"
            >
              {getPageName(location.pathname)}
            </li>
          </ol>
        </nav>

        <div className="mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">
          <ul className="navbar-nav d-flex align-items-center ms-md-auto pe-md-3 justify-content-end flex-row">
            <li className="nav-item d-xl-none ps-3 pe-3 d-flex align-items-center">
              <div
                className="nav-link text-body p-0 cursor-pointer"
                id="iconNavbarSidenav"
                onClick={onToggleSidenav}
              >
                <div className="sidenav-toggler-inner">
                  <i className="sidenav-toggler-line bg-dark"></i>
                  <i className="sidenav-toggler-line bg-dark"></i>
                  <i className="sidenav-toggler-line bg-dark"></i>
                </div>
              </div>
            </li>

            <li className="nav-item d-flex align-items-center">
              <Link
                to="/admin/profile"
                className="nav-link text-body font-weight-bold px-0"
              >
                <img
                  width="28"
                  height="28"
                  className="rounded-circle"
                  src={userAvatar}
                  alt="user"
                  style={{ objectFit: "cover" }}
                />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Head;
