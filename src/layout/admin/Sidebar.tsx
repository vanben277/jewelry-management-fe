import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MdOutlineDashboard,
  MdCategory,
  MdReceiptLong,
  MdInventory,
  MdSmartToy,
} from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { FaUserCircle, FaRegUser } from "react-icons/fa";
import toast from "react-hot-toast";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.clear();
      toast.success("Đã đăng xuất thành công");
      setTimeout(() => {
        navigate("/login");
      }, 200);
    }
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Bảng điều khiển",
      icon: <MdOutlineDashboard size={20} />,
    },
    {
      path: "/admin/accounts",
      label: "Quản lý tài khoản",
      icon: <FaRegUser size={20} />,
    },
    {
      path: "/admin/orders",
      label: "Quản lý đơn hàng",
      icon: <MdReceiptLong size={20} />,
    },
    {
      path: "/admin/categories",
      label: "Quản lý danh mục",
      icon: <MdCategory size={20} />,
    },
    {
      path: "/admin/products",
      label: "Quản lý sản phẩm",
      icon: <MdInventory size={20} />,
    },
    {
      path: "/admin/ai",
      label: "Quản lý AI Chat",
      icon: <MdSmartToy size={20} />,
    },
  ];

  return (
    <aside
      className="sidenav navbar navbar-vertical navbar-expand-xs border-radius-lg fixed-start bg-white z-[1000] my-2 ml-2"
      id="sidenav-main"
    >
      <div className="sidenav-header">
        <Link className="navbar-brand pl-6 pr-6 py-4 text-center" to="/">
          <img
            src="https://cdn.pnj.io/images/logo/pnj.com.vn.png"
            className="navbar-brand-img !max-h-[unset]"
            width="88"
            alt="main_logo"
          />
        </Link>
      </div>
      <hr className="horizontal dark mt-0 mb-2" />
      <div
        className="collapse navbar-collapse w-auto h-auto"
        id="sidenav-collapse-main"
        style={{ visibility: "visible", display: "block" }}
      >
        <ul className="navbar-nav">
          {menuItems.map((item) => (
            <li className="nav-item h-[38px]" key={item.path}>
              <Link
                className={`nav-link h-[38px] ${
                  location.pathname === item.path
                    ? "active bg-gradient-dark text-white"
                    : "text-dark"
                }`}
                to={item.path}
              >
                <div className="text-center d-flex align-items-center justify-content-center me-2 opacity-5 ">
                  {item.icon}
                </div>
                <span className="nav-link-text ms-1 text-[1.2rem]">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}

          <li className="nav-item mt-4">
            <h6 className="ps-4 ms-2 uppercase !text-[1.3rem] text-dark font-weight-bolder opacity-5 ">
              Tài khoản
            </h6>
          </li>

          <li className="nav-item">
            <Link
              className={`nav-link ${
                location.pathname === "/admin/profile"
                  ? "active bg-gradient-dark text-white"
                  : "text-dark"
              }`}
              to="/admin/profile"
            >
              <div className="text-center d-flex align-items-center justify-content-center me-2  opacity-5">
                <FaUserCircle size={20} />
              </div>
              <span className="nav-link-text ms-1 text-[1.2rem]">
                Thông tin cá nhân
              </span>
            </Link>
          </li>

          <li className="nav-item">
            <div
              className="nav-link text-dark cursor-pointer"
              onClick={handleLogout}
            >
              <div className="text-center d-flex align-items-center justify-content-center me-2">
                <IoLogOut size={20} className="text-danger" />
              </div>
              <span className="nav-link-text ms-1 text-[1.2rem]">
                Đăng xuất
              </span>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
