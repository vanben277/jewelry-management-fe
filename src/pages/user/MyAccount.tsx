import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaCircleUser,
  FaKey,
  FaEnvelope,
  FaPhone,
  FaCakeCandles,
  FaMarsAndVenus,
  FaLocationDot,
  FaUserPen,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa6";
import { GoHome } from "react-icons/go";
import { IoLogOutOutline } from "react-icons/io5";
import BottomNav from "../../components/user/BottomNav";
import { accountApi, authApi } from "../../apis";
import { STORAGE_KEYS, ACCOUNT_STATUS } from '../../constants';
import { isStrongPassword, getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthTextClass } from "../../utils";

interface UserData {
  id: number;
  avatar: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  status: string;
}

const MyAccount: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // State cho form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const auth = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

  // 1. Load thông tin User
  useEffect(() => {
    if (!auth || !userId) {
      toast.error("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await accountApi.getById(Number(userId));

        if (res.data) {
          if (res.data.status !== ACCOUNT_STATUS.ACTIVE) {
            handleAccountStatus(res.data.status);
            return;
          }
          setUser(res.data);
        }
      } catch (error) {
        toast.error("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [auth, userId, navigate]);

  const handleAccountStatus = (status: string) => {
    const msgs: Record<string, string> = {
      BANNED: "Tài khoản đã bị cấm!",
      INACTIVE: "Tài khoản đã bị vô hiệu hóa!",
      PENDING: "Tài khoản đang chờ xác thực!",
    };
    toast.error(msgs[status] || "Lỗi không xác định");
    localStorage.clear();
    navigate("/exception?code=403");
  };

  // 2. Xử lý Đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn chắc chắn muốn đăng xuất?")) {
      localStorage.clear();
      toast.success("Đã đăng xuất");
      navigate("/login");
    }
  };

  // 3. Xử lý Đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrongPassword(passwordForm.newPassword)) {
      toast.error("Mật khẩu mới không đúng định dạng!");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      localStorage.clear();
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  if (loading)
    return <div className="p-10 text-center text-xl">Đang tải...</div>;

  return (
    <div className="app">
      <div className="my-account w-[420px]">
        {/* Header */}
        <div className="account-header">
          <div className="account-left">
            <span className="account-title font-medium">Tài khoản</span>
          </div>
          <Link to="/my-home" className="account-right">
            <div className="h-6 bg-[rgba(145,158,171,0.08)] rounded-full flex items-center justify-center">
              <GoHome color="#000" />
            </div>
          </Link>
        </div>

        {/* Profile Info */}
        <div className="account-info">
          <img
            src={
              user?.avatar ||
              "https://cdn.pnj.io/images/customer/home/new_avatar_default.svg"
            }
            alt="Avatar"
            className="account-img"
          />
          <div className="account-info-item">
            <div className="account-name">
              {user?.firstName} {user?.lastName}
              <button
                className="edit-profile-btn ml-2"
                onClick={() => navigate("/edit-personal-info")}
              >
                <FaUserPen size={16} />
              </button>
            </div>
            <div className="account-code">
              Mã: <span>{user?.id.toString().padStart(10, "0")}</span>
            </div>
            <div className="account-user-tags">
              <span className="account-user-tag-rank">
                Hạng thẻ
                <span className="account-user-tag ml-1">Kết nối</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="account-section-list">
          <div className="account-actions mb-0">
            <button
              className={`account-action-btn ${activeTab === "info" ? "action-active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              <FaCircleUser className="mr-[0.6rem]" />{" "}
              <span>Thông tin tài khoản</span>
            </button>
            <button
              className={`account-action-btn ${activeTab === "password" ? "action-active" : ""}`}
              onClick={() => setActiveTab("password")}
            >
              <FaKey className="mr-2" /> Thay đổi mật khẩu
            </button>
          </div>
        </div>

        {/* Tab 1: Info */}
        {activeTab === "info" && (
          <div id="accountInfo">
            <div className="account-personal-list">
              {[
                {
                  icon: <FaEnvelope className="text-[1.4rem] text-[#212B36]" />,
                  label: "Email",
                  val: user?.email,
                },
                {
                  icon: <FaPhone className="text-[1.4rem] text-[#212B36]" />,
                  label: "Số điện thoại",
                  val: user?.phone,
                },
                {
                  icon: (
                    <FaCakeCandles className="text-[1.4rem] text-[#212B36]" />
                  ),
                  label: "Ngày sinh",
                  val: user?.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                    : "-",
                },
                {
                  icon: (
                    <FaMarsAndVenus className="text-[1.4rem] text-[#212B36]" />
                  ),
                  label: "Giới tính",
                  val:
                    user?.gender === "MALE"
                      ? "Nam"
                      : user?.gender === "FEMALE"
                        ? "Nữ"
                        : "Khác",
                },
                {
                  icon: (
                    <FaLocationDot className="text-[1.4rem] text-[#212B36]" />
                  ),
                  label: "Địa chỉ",
                  val: user?.address,
                },
              ].map((item, idx) => (
                <div className="account-personal" key={idx}>
                  <div className="text-[#637381]">{item.icon}</div>
                  <div className="account-personal-info">
                    <div className="account-personal-name">{item.label}</div>
                    <div className="account-personal-content">
                      {item.val || "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="logout-btn flex items-center justify-center py-[12px] px-[16px]"
              onClick={handleLogout}
            >
              <IoLogOutOutline size={20} /> Đăng xuất
            </button>
          </div>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === "password" && (
          <form
            id="changePassword"
            onSubmit={handleChangePassword}
            className="p-4"
          >
            <div className="form-group mb-4">
              <label className="block mb-1 text-sm">
                Mật khẩu cũ <span className="text-red-500">*</span>
              </label>
              <div className="password-input-wrapper relative">
                <input
                  type={showPass.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full h-[40px] border border-gray-300 rounded-[5px] pl-[12px] pr-[40px] text-[1.6rem] focus:outline-none block"
                />
                <div
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 cursor-pointer w-[18px] h-[18px] flex items-center justify-center z-10"
                  onClick={() =>
                    setShowPass({ ...showPass, current: !showPass.current })
                  }
                >
                  {showPass.current ? (
                    <FaEye className="text-[1.8rem]" />
                  ) : (
                    <FaEyeSlash className="text-[1.8rem]" />
                  )}
                </div>
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="block mb-1 text-sm">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="password-input-wrapper relative">
                <input
                  type={showPass.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full h-[40px] border border-gray-300 rounded-[5px] pl-[12px] pr-[40px] text-[1.6rem] focus:outline-none block"
                />
                <div
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 cursor-pointer w-[18px] h-[18px] flex items-center justify-center z-10"
                  onClick={() =>
                    setShowPass({ ...showPass, new: !showPass.new })
                  }
                >
                  {showPass.new ? (
                    <FaEye className="text-[1.8rem]" />
                  ) : (
                    <FaEyeSlash className="text-[1.8rem]" />
                  )}
                </div>
              </div>

              {/* Password Strength Bar */}
              {passwordForm.newPassword && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-gray-200 rounded">
                    <div
                      className={`h-full rounded transition-all ${getPasswordStrengthTextClass(passwordForm.newPassword).replace('text-', 'bg-')}`}
                      style={{
                        width: `${(getPasswordStrength(passwordForm.newPassword) / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1">
                    Độ mạnh: {getPasswordStrengthLabel(passwordForm.newPassword)}
                  </p>
                </div>
              )}
            </div>

            <div className="form-group mb-6">
              <label className="block mb-1 text-sm">
                Nhập lại mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="password-input-wrapper relative">
                <input
                  type={showPass.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full h-[40px] border border-gray-300 rounded-[5px] pl-[12px] pr-[40px] text-[1.6rem] focus:outline-none block"
                />
                <div
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 cursor-pointer w-[18px] h-[18px] flex items-center justify-center z-10"
                  onClick={() =>
                    setShowPass({ ...showPass, confirm: !showPass.confirm })
                  }
                >
                  {showPass.confirm ? (
                    <FaEye className="text-[1.8rem]" />
                  ) : (
                    <FaEyeSlash className="text-[1.8rem]" />
                  )}
                </div>
              </div>
              {passwordForm.confirmPassword &&
                passwordForm.newPassword === passwordForm.confirmPassword && (
                  <p className="text-green-500 text-xs mt-1">Mật khẩu khớp</p>
                )}
            </div>

            <button type="submit" className="save-btn">
              Đổi Mật Khẩu
            </button>
          </form>
        )}

        <BottomNav />
      </div>
    </div>
  );
};

export default MyAccount;
