import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaUser,
  FaKey,
  FaEdit,
  FaEyeSlash,
  FaEye,
  FaCheck,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import { accountApi, authApi } from "../../apis";
import { Account } from "../../types";

const AdminProfile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  // --- State cho Form đổi mật khẩu ---
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

  const userId = localStorage.getItem("userId");

  // 1. Load thông tin tài khoản
  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await accountApi.getById(Number(userId));
        if (response.data) {
          if (response.data.status !== "ACTIVE") {
            toast.error("Tài khoản không khả dụng");
            navigate("/exception?code=403");
            return;
          }
          setUser(response.data);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        } else {
          toast.error(error.response?.data?.errorMessage || "Lỗi tải thông tin tài khoản");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, navigate]);

  // 2. Logic kiểm tra độ mạnh mật khẩu (Port từ jQuery sang React)
  const getRequirements = (pass: string) => ({
    length: pass.length >= 8 && pass.length <= 16,
    lowercase: /[a-z]/.test(pass),
    uppercase: /[A-Z]/.test(pass),
    number: /\d/.test(pass),
    special: /[@$!%*?&]/.test(pass),
  });

  const getStrength = (pass: string) => {
    const reqs = getRequirements(pass);
    return Object.values(reqs).filter(Boolean).length;
  };

  // 3. Xử lý đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const strength = getStrength(passwordForm.newPassword);

    if (strength < 5) {
      toast.error("Mật khẩu mới chưa đủ mạnh!");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      localStorage.clear();
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;

  const reqs = getRequirements(passwordForm.newPassword);
  const strengthScore = getStrength(passwordForm.newPassword);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* TIÊU ĐỀ CHUẨN KHUÔN DASHBOARD */}
        <div className="ms-3 mb-3 mt-4">
          <h3 className="mb-0 h4 font-weight-bolder text-dark !text-[2.4rem]">
            Thông tin cá nhân
          </h3>
          <p className="text-[16px] text-muted">
            Quản lý thông tin và bảo mật tài khoản quản trị.
          </p>
        </div>

        <div className="col-12 mt-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header p-4 bg-white border-bottom">
              <h6 className="mb-0 font-weight-bold text-[18px]">
                Cài đặt tài khoản
              </h6>
            </div>

            <div className="card-body p-4">
              {/* Tabs Switcher */}
              <div className="account-actions mb-4">
                <button
                  className={`account-action-btn !text-[1.4rem] ${activeTab === "info" ? "action-active" : ""}`}
                  onClick={() => setActiveTab("info")}
                >
                  <FaUser className="me-2" /> Thông tin tài khoản
                </button>
                <button
                  className={`account-action-btn !text-[1.4rem] ${activeTab === "password" ? "action-active" : ""}`}
                  onClick={() => setActiveTab("password")}
                >
                  <FaKey className="me-2" /> Thay đổi mật khẩu
                </button>
              </div>

              {/* TAB 1: THÔNG TIN CHI TIẾT */}
              {activeTab === "info" && (
                <div
                  id="accountInfo"
                  className="animate__animated animate__fadeIn"
                >
                  <div className="account-info-card border rounded-3 p-4">
                    <div className="profile-header d-flex align-items-center mb-4">
                      <img
                        src={
                          user?.avatar ||
                          "https://cdn.pnj.io/images/customer/home/new_avatar_default.svg"
                        }
                        alt="Avatar"
                        className="profile-avatar rounded-circle border shadow-sm"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="profile-info ms-4">
                        <h3 className="mb-1 font-weight-bold text-[22px]">
                          {user?.firstName} {user?.lastName}
                        </h3>
                        <div className="user-id text-muted">
                          <span>
                            ID:{" "}
                            <span className="font-monospace text-primary">
                              {user?.id.toString().padStart(10, "0")}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="info-grid">
                      {[
                        { label: "Email", value: user?.email },
                        { label: "Số điện thoại", value: user?.phone },
                        {
                          label: "Ngày sinh",
                          value: user?.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString(
                                "vi-VN",
                              )
                            : "-",
                        },
                        {
                          label: "Giới tính",
                          value:
                            user?.gender === "MALE"
                              ? "Nam"
                              : user?.gender === "FEMALE"
                                ? "Nữ"
                                : "Khác",
                        },
                        { label: "Địa chỉ", value: user?.address },
                      ].map((item, idx) => (
                        <div className="mb-3" key={idx}>
                          <div className="info-item border-bottom pb-2">
                            <span className="info-label d-block text-[1.4rem] text-muted !font-medium m-0">
                              {item.label}
                            </span>
                            <span className="info-value text-dark font-weight-bold text-[1.5rem]">
                              {item.value || "-"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="action-buttons mt-4 justify-center">
                      <button
                        className="btn btn-outline-primary edit-profile-btn"
                        onClick={() => {
                          localStorage.setItem(
                            "editAccount",
                            JSON.stringify(user),
                          );
                          navigate("/edit-personal-info?from=profile");
                        }}
                      >
                        <FaEdit className="me-2" /> Chỉnh sửa thông tin
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ĐỔI MẬT KHẨU */}
              {activeTab === "password" && (
                <div
                  id="changePassword"
                  className="animate__animated animate__fadeIn"
                >
                  <div className="account-info-card border rounded-3 p-4">
                    <h4 className="font-weight-bold text-dark mb-4">
                      Thay Đổi Mật Khẩu
                    </h4>

                    <form
                      id="changePasswordForm"
                      onSubmit={handleChangePassword}
                    >
                      {/* Mật khẩu hiện tại */}
                      <div className="form-group mb-3">
                        <label className="block mb-1 text-sm font-medium">
                          Mật khẩu hiện tại{" "}
                          <span className="text-red-500">*</span>
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
                              setShowPass({
                                ...showPass,
                                current: !showPass.current,
                              })
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

                      {/* Mật khẩu mới */}
                      <div className="form-group mb-3">
                        <label className="block mb-1 text-sm font-medium">
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

                        {/* Thanh độ mạnh */}
                        {passwordForm.newPassword && (
                          <div className="password-strength mt-2">
                            <div
                              className="strength-bar bg-light rounded-pill overflow-hidden"
                              style={{ height: "6px" }}
                            >
                              <div
                                className={`h-full transition-all duration-500 ${
                                  strengthScore <= 2
                                    ? "bg-danger"
                                    : strengthScore <= 4
                                      ? "bg-warning"
                                      : "bg-success"
                                }`}
                                style={{
                                  width: `${(strengthScore / 5) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-[12px] mt-1 text-muted">
                              Độ mạnh:{" "}
                              {strengthScore <= 2
                                ? "Yếu"
                                : strengthScore <= 4
                                  ? "Trung bình"
                                  : "Mạnh"}
                            </div>
                          </div>
                        )}

                        {/* Checklist yêu cầu */}
                        <div className="password-requirements mt-3 p-3 bg-light rounded">
                          {[
                            {
                              id: "req-length",
                              label: "8-16 ký tự",
                              valid: reqs.length,
                            },
                            {
                              id: "req-lowercase",
                              label: "Ít nhất 1 chữ thường",
                              valid: reqs.lowercase,
                            },
                            {
                              id: "req-uppercase",
                              label: "Ít nhất 1 chữ hoa",
                              valid: reqs.uppercase,
                            },
                            {
                              id: "req-number",
                              label: "Ít nhất 1 số",
                              valid: reqs.number,
                            },
                            {
                              id: "req-special",
                              label: "1 ký tự đặc biệt (@$!%*?&)",
                              valid: reqs.special,
                            },
                          ].map((req) => (
                            <div
                              key={req.id}
                              className={`requirement d-flex align-items-center text-[13px] ${req.valid ? "text-success" : "text-danger"}`}
                            >
                              {req.valid ? (
                                <FaCheck className="me-2" />
                              ) : (
                                <FaTimes className="me-2" />
                              )}
                              <span>{req.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Xác nhận mật khẩu */}
                      <div className="form-group mb-4">
                        <label className="block mb-1 text-sm font-medium">
                          Xác nhận mật khẩu mới{" "}
                          <span className="text-red-500">*</span>
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
                              setShowPass({
                                ...showPass,
                                confirm: !showPass.confirm,
                              })
                            }
                          >
                            {showPass.confirm ? (
                              <FaEye className="text-[1.8rem]" />
                            ) : (
                              <FaEyeSlash className="text-[1.8rem]" />
                            )}
                          </div>
                        </div>

                        {passwordForm.confirmPassword && (
                          <div
                            className={`text-[12px] mt-1 ${
                              passwordForm.newPassword ===
                              passwordForm.confirmPassword
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {passwordForm.newPassword ===
                            passwordForm.confirmPassword
                              ? "Mật khẩu khớp"
                              : "Mật khẩu không khớp"}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-full font-weight-bold shadow-sm justify-center"
                      >
                        <FaSave className="me-2" /> Lưu thay đổi
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        body {
            display: block;
        }
        p { margin: 0; }
        .action-active {
          background-color: #007bff !important;
          color: white !important;
        }
        .account-action-btn {
          border: 1px solid #ddd;
          padding: 8px 20px;
          border-radius: 8px;
          margin-right: 10px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          background: white;
        }
        .account-action-btn:hover {
          background: #f8f9fa;
        }
        .btn-primary {
          background-image: linear-gradient(195deg, #42424a 0%, #191919 100%);
          border: none;
        }
        .form-control:focus {
          border-color: #e91e63 !important;
          box-shadow: none !important;
        }
        .requirement i { font-size: 10px; }
      `}</style>
    </div>
  );
};

export default AdminProfile;
