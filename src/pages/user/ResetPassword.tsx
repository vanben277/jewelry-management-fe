import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authApi } from "../../apis/auth.api";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const otpFromUrl = searchParams.get("otp") || "";

  // --- States ---
  const [formData, setFormData] = useState({
    otp: otpFromUrl,
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass, setShowPass] = useState({ new: false, confirm: false });

  // --- Logic Helper ---
  const isValidPassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    return passwordRegex.test(password);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    if (password.length >= 12) strength++;
    return strength;
  };

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "otp") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      setFormData({ ...formData, [name]: onlyNums });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { otp: "", newPassword: "", confirmPassword: "" };

    if (formData.otp.trim() === "") {
      newErrors.otp = "Vui lòng nhập mã OTP!";
      isValid = false;
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = "Mã OTP phải gồm 6 số!";
      isValid = false;
    }

    if (formData.newPassword.trim() === "") {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới!";
      isValid = false;
    } else if (!isValidPassword(formData.newPassword)) {
      newErrors.newPassword =
        "Mật khẩu phải có 8-16 ký tự, chứa ít nhất: 1 chữ thường, 1 chữ hoa, 1 số, 1 ký tự đặc biệt (@$!%*?&)";
      isValid = false;
    }

    if (formData.confirmPassword.trim() === "") {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu!";
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp!";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        otpSku: formData.otp,
        newPassword: formData.newPassword,
      });

      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại sau.";

      const errorCode = error.response?.data?.errorCode;
      const errorMessageFromBe = error.response?.data?.message;

      if (errorMessageFromBe) {
        errorMessage = errorMessageFromBe;
      } else {
        switch (Number(errorCode)) {
          case 400026:
            errorMessage = "Mã OTP không hợp lệ.";
            break;
          case 400027:
            errorMessage = "Mã OTP đã hết hạn.";
            break;
          case 400022:
            errorMessage = "Tài khoản đã bị vô hiệu hóa.";
            break;
          case 400023:
            errorMessage = "Tài khoản đã bị khóa.";
            break;
          case 400024:
            errorMessage = "Tài khoản chưa được xác thực.";
            break;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app">
      <div className="form">
        <div className="form__user">
          <div className="logo">
            <Link to="/">
              <img
                src="https://www.pnj.com.vn/my_profile_asset/logo.svg"
                alt="PNJ Logo"
              />
            </Link>
          </div>
          <form className="form__block" onSubmit={handleSubmit}>
            {/* --- MÃ OTP --- */}
            <div className="mb-3">
              <label className="form-label">Mã OTP</label>
              <input
                type="text"
                className="form-control"
                name="otp"
                id="otpInput"
                maxLength={6}
                placeholder="Nhập mã OTP 6 số"
                value={formData.otp}
                onChange={handleInputChange}
              />
              {errors.otp && (
                <div className="error-message" style={{ display: "block" }}>
                  {errors.otp}
                </div>
              )}
              <div className="form-text">
                Nhập mã OTP được gửi qua email của bạn
              </div>
            </div>

            {/* --- MẬT KHẨU MỚI --- */}
            <div className="form-group mb-3">
              <label className="form-label block mb-1 text-sm font-medium">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="password-input-wrapper relative">
                <input
                  type={showPass.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full h-[40px] border border-gray-300 rounded-[5px] pl-[12px] pr-[40px] text-[1.4rem] focus:outline-none block"
                  placeholder="Nhập mật khẩu mới"
                />
                <div
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 cursor-pointer w-[18px] h-[18px] flex items-center justify-center z-10"
                  onClick={() =>
                    setShowPass({ ...showPass, new: !showPass.new })
                  }
                >
                  {showPass.new ? (
                    <FaEye size={18} color="#6c757d" />
                  ) : (
                    <FaEyeSlash size={18} color="#6c757d" />
                  )}
                </div>
              </div>

              {/* Hiển thị lỗi newPassword */}
              {errors.newPassword && (
                <div className="error-message" style={{ display: "block" }}>
                  {errors.newPassword}
                </div>
              )}

              {/* THANH ĐO ĐỘ MẠNH */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-gray-200 rounded">
                    <div
                      className={`h-full rounded transition-all duration-500 ${
                        getPasswordStrength(formData.newPassword) <= 2
                          ? "bg-red-500"
                          : getPasswordStrength(formData.newPassword) <= 4
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${(getPasswordStrength(formData.newPassword) / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-[1.2rem] mt-1 font-medium">
                    Độ mạnh:{" "}
                    <span
                      className={
                        getPasswordStrength(formData.newPassword) <= 2
                          ? "text-red-500"
                          : getPasswordStrength(formData.newPassword) <= 4
                            ? "text-yellow-600"
                            : "text-green-600"
                      }
                    >
                      {getPasswordStrength(formData.newPassword) <= 2
                        ? "Yếu"
                        : getPasswordStrength(formData.newPassword) <= 4
                          ? "Trung bình"
                          : "Mạnh"}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* --- NHẬP LẠI MẬT KHẨU --- */}
            <div className="form-group mb-3">
              <label className="form-label block mb-1 text-sm font-medium">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="password-input-wrapper relative">
                <input
                  type={showPass.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full h-[40px] border border-gray-300 rounded-[5px] pl-[12px] pr-[40px] text-[1.4rem] focus:outline-none block"
                  placeholder="Xác nhận mật khẩu"
                />
                <div
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 cursor-pointer w-[18px] h-[18px] flex items-center justify-center z-10"
                  onClick={() =>
                    setShowPass({ ...showPass, confirm: !showPass.confirm })
                  }
                >
                  {showPass.confirm ? (
                    <FaEye size={18} color="#6c757d" />
                  ) : (
                    <FaEyeSlash size={18} color="#6c757d" />
                  )}
                </div>
              </div>

              {/* Hiển thị lỗi confirmPassword */}
              {errors.confirmPassword && (
                <div className="error-message" style={{ display: "block" }}>
                  {errors.confirmPassword}
                </div>
              )}

              {!errors.confirmPassword &&
                formData.confirmPassword &&
                formData.newPassword === formData.confirmPassword && (
                  <p className="text-green-500 text-[1.2rem] mt-1 font-medium italic">
                    Mật khẩu đã trùng khớp
                  </p>
                )}
              {!errors.confirmPassword &&
                formData.confirmPassword &&
                formData.newPassword !== formData.confirmPassword && (
                  <p className="text-red-500 text-[1.2rem] mt-1 font-medium italic">
                    Mật khẩu chưa khớp
                  </p>
                )}
            </div>

            <div className="form__align">
              <button
                type="submit"
                className="btn btn-primary flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        body { display: block; }
        .form { width: 100%; display: flex; justify-content: center; background-color: #f8fafc; min-height: 100vh; }
        .form__user { border-radius: 5px; background-color: #ffffff; position: relative; width: 60%; max-width: 420px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-top: 50px; height: fit-content; padding-bottom: 10px; }
        .logo { display: flex; width: 100%; justify-content: center; margin: 20px 0; }
        .logo img { width: 92px; height: 48px; }
        .form__block { width: auto; margin-top: 8px; border-radius: 3px; font-size: 1.5rem; }
        .form__align { margin: 10px 19px 20px 19px; }
        .form-control { padding: 8px 12px; font-size: 14px; border-radius: 5px; border: 1px solid #ddd; width: 100%; }
        .form-label { font-size: 1.4rem; font-weight: 500; margin-bottom: 8px; display: block; }
        .btn { font-size: 1.5rem; color: white; background-color: #003468; border: none; width: 100%; min-height: 40px; border-radius: 5px; font-weight: 500; cursor: pointer; transition: 0.3s; }
        .btn:hover { background-color: #0056b3; }
        .btn:disabled { background-color: #6c757d; cursor: not-allowed; }
        .mb-3 { margin: 18px 19px 15px 19px; }
        .error-message { color: #dc3545; font-size: 1.2rem; margin-top: 0.25rem; display: none; }
        .form-text { font-size: 1.1rem; color: #6c757d; margin-top: 5px; line-height: 1.4; }
        #otpInput { text-align: center; font-size: 18px; font-weight: 500; letter-spacing: 3px; }
        @media(max-width: 739px) { .form__user { min-width: 95vw; margin: 10px; } }
      `}</style>
    </div>
  );
};

export default ResetPassword;
