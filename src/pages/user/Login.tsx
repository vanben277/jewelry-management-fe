import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authApi } from "../../apis";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // States
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    userName: "",
    password: "",
    captcha: "",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("userInfo");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "ADMIN") navigate("/admin/dashboard");
      else if (user.role === "STAFF") navigate("/staff/home");
      else navigate("/my-home");
    }
  }, [navigate]);

  const handleRedirect = (role: string) => {
    if (role === "ADMIN") navigate("/admin/dashboard");
    else if (role === "STAFF") navigate("/staff/home");
    else navigate("/my-home");
  };

  const checkUserStatus = (status: string) => {
    if (["BANNED", "INACTIVE", "PENDING"].includes(status)) {
      let msg = "";
      switch (status) {
        case "BANNED":
          msg = "Tài khoản đã bị cấm!";
          break;
        case "INACTIVE":
          msg = "Tài khoản đã bị vô hiệu hóa!";
          break;
        case "PENDING":
          msg = "Tài khoản đang chờ xác thực!";
          break;
      }
      toast.error(msg);
      localStorage.removeItem("auth");
      localStorage.removeItem("userId");
      localStorage.removeItem("userInfo");
      setTimeout(() => navigate("/exception?code=403"), 1500);
      return false;
    }
    return true;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { userName: "", password: "", captcha: "" };

    if (!userName.trim()) {
      newErrors.userName = "Tài khoản không được bỏ trống!";
      isValid = false;
    }
    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được bỏ trống!";
      isValid = false;
    }

    // const captchaValue = recaptchaRef.current?.getValue();
    // if (!captchaValue) {
    //   newErrors.captcha = "Vui lòng xác nhận CAPTCHA!";
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warn("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const result = await authApi.login(userName, password);

      if (result.data) {
        const userInfo = result.data;
        if (!checkUserStatus(userInfo.status)) return;

        // Lưu thông tin với JWT token
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        localStorage.setItem("accessToken", userInfo.accessToken);
        localStorage.setItem("userId", userInfo.id.toString());

        // Xóa auth cũ (Basic Auth) nếu có
        localStorage.removeItem("auth");

        toast.success(result.message || "Đăng nhập thành công!");

        // Chuyển hướng sau 1 giây để user kịp nhìn thấy Toast thành công
        setTimeout(() => handleRedirect(userInfo.role), 1000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.errorMessage;
      const errorCodes: any = {
        "400021": "Tài Khoản hoặc Mật Khẩu không đúng. Vui lòng thử lại!",
        "400022": "Tài khoản đã bị vô hiệu hóa!",
        "400023": "Tài khoản đã bị khóa!",
        "400024": "Tài khoản chưa được xác thực!",
      };
      toast.error(
        errorCodes[errorMessage] ||
          error.response?.data?.message ||
          "Đăng nhập thất bại!",
      );
    }
  };

  // GIỮ NGUYÊN GIAO DIỆN CỦA BẠN 100%
  return (
    <div className="w-full min-h-screen flex justify-center bg-[#f8fafc]">
      <ToastContainer position="top-right" autoClose={3000} closeOnClick />

      <div className="bg-white relative max-w-[500px] w-full max-sm:w-full">
        <div className="flex w-full justify-center py-[10px]">
          <Link to="/">
            <img
              src="https://www.pnj.com.vn/my_profile_asset/logo.svg"
              className="w-[92px] h-[48px]"
              alt="PNJ Logo"
            />
          </Link>
        </div>

        <form
          className="mt-2 rounded-[3px] text-[1.5rem] p-[0px]"
          onSubmit={handleSubmit}
        >
          <div className="flex justify-center text-[#333] text-[2.5rem] font-semibold px-[5px] mb-[10px] max-sm:text-[2rem] max-sm:mb-1">
            Chào mừng bạn trở lại
          </div>
          <div className="flex justify-center px-[5px] text-[1.6rem] mb-5 max-sm:text-[1.2rem]">
            Vui lòng đăng nhập để tiếp tục
          </div>

          <div className="mt-[18px] mx-[19px]">
            <label className="block text-[1.6rem] mb-2">Tài khoản</label>
            <input
              type="text"
              className="w-full h-[33px] p-[24px] text-[14px] border border-gray-300 !rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:ring-offset-2 transition-all"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            {errors.userName && (
              <div className="text-[#dc3545] text-[1.2rem] mt-1 animate-in fade-in duration-300">
                {errors.userName}
              </div>
            )}
          </div>

          <div className="mt-[18px] mx-[19px]">
            <label className="block text-[1.6rem] mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-[33px] p-[24px] pr-[45px] text-[14px] border border-gray-300 !rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:ring-offset-2 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="absolute right-[15px] top-1/2 -translate-y-1/2 cursor-pointer text-[#6c757d] text-[16px] z-10 hover:text-[#495057]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
            {errors.password && (
              <div className="text-[#dc3545] text-[1.2rem] mt-1 animate-in fade-in duration-300">
                {errors.password}
              </div>
            )}
          </div>

          <div className="mt-[18px] mx-[19px] flex justify-end">
            <Link
              to="/forgot-password"
              title="Quên mật khẩu"
              className="text-[1.4rem] no-underline text-[#0d6efd] hover:underline"
            >
              Quên mật khẩu ?
            </Link>
          </div>

          {/* <div className="mt-[18px] mx-[19px]">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LfaQWssAAAAANtyv4Ql9tVpHybh6KT3-XQH_5Dq"
            />
            {errors.captcha && (
              <div className="text-[#dc3545] text-[1.2rem] mt-1 animate-in fade-in duration-300">
                {errors.captcha}
              </div>
            )}
          </div> */}

          <div className="w-full flex justify-center mb-5 mt-5">
            <button
              type="submit"
              className="min-w-[95%] min-h-[40px] text-[1.5rem] bg-[#0d6efd] text-white rounded-[5px] hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all font-medium"
            >
              Đăng nhập
            </button>
          </div>

          <hr
            className="absolute w-full bottom-[156px] md:bottom-[132px]"
            style={{ borderTop: "var(--bs-border-width) solid" }}
          />

          <div className="mx-[19px] mb-[15px] text-center text-[1.4rem]">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-[#0d6efd] no-underline hover:underline"
            >
              Đăng ký
            </Link>{" "}
            hoặc về{" "}
            <Link
              to="/"
              className="text-[#0d6efd] no-underline hover:underline"
            >
              Trang chủ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
