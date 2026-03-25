import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../apis";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (email.trim() === "") {
      setEmailError("Vui lòng nhập email của bạn!");
      return false;
    } else if (!isValidEmail(email)) {
      setEmailError("Vui lòng nhập địa chỉ email hợp lệ!");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      await authApi.forgotPassword(email);
      toast.success(
        "Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
      );
      navigate("/login");
    } catch (error: any) {
      console.error("Lỗi:", error);
      const status = error.response?.status || 503;
      const data = error.response?.data || {};
      handleRequestError(status, data);
    }
  };

  const handleRequestError = (status: number, data: any) => {
    let errorMessage = "Khôi phục thất bại: Vui lòng thử lại sau.";
    const errorCode = data.errorMessage || status;

    const errorMessages: Record<string, string> = {
      "400022": "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên!",
      "400023": "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên!",
      "400024": "Tài khoản chưa được xác thực. Vui lòng kiểm tra email!",
      "404005": "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại!",
    };

    if (errorMessages[data.errorMessage]) {
      errorMessage = errorMessages[data.errorMessage];
    } else {
      switch (status) {
        case 400:
          errorMessage = "Khôi phục thất bại: Email chưa đăng ký!";
          break;
        case 404:
          errorMessage = "Tài nguyên không tồn tại.";
          break;
        case 500:
          errorMessage = "Khôi phục thất bại: Lỗi máy chủ.";
          break;
        default:
          errorMessage = data.message || "Hệ thống đang bảo trì.";
      }
    }

    toast.error(errorMessage);
    navigate(
      `/exception?code=${status}&message=${encodeURIComponent(errorMessage)}`,
    );
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
          <form
            id="forgotPasswordForm"
            className="form__block"
            onSubmit={handleSubmit}
          >
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Nhập email của bạn
              </label>
              <input
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
              />
              {emailError && (
                <div
                  id="accountError"
                  className="error-message"
                  style={{ display: "block" }}
                >
                  {emailError}
                </div>
              )}
              <div id="emailHelp" className="form-text">
                Vui lòng nhập email mà bạn đã đăng ký với chúng tôi
              </div>
            </div>
            <div className="form__align">
              <button type="submit" className="btn btn-primary">
                Gửi
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .form {
            width: 100%;
            display: flex;
            margin: 0 auto;
            justify-content: center;
            background-color: #f8fafc;
            min-height: 100vh;
        }
        .form__user {
            border-radius: 5px;
            background-color: #ffffff;
            position: relative;
            width: 100%;
            max-width: 420px;
            height: fit-content;
            margin-top: 50px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .logo {
            display: flex;
            width: 100%;
            justify-content: center;
            margin: 20px 0;
        }
        .logo img {
            width: 92px;
            height: 48px;
        }
        .form__block {
            width: auto;
            margin-top: 8px;
            border-radius: 3px;
            font-size: 1.5rem;
            color: var(--text-color);
        }
        .form__align {
            margin: 0 19px 20px 19px;
        }
        .form-control {
            padding: 4px 8px;
            font-size: 14px;
            border-radius: 5px;
            border: 1px solid #ddd;
            background: #fff;
            color: var(--text-color);
        }

        input[type="email"] {
            padding: 8px 12px;
        }
        .form-control:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            outline: none;
            background: #fff;
            color: var(--text-color);
        }
        .form-label {
            font-size: 1.4rem;
            font-weight: 400;
            margin-bottom: 8px;
            color: var(--text-color);
        }
        .btn {
            font-size: 1.5rem;
            color: white;
            background-color: var(--text-blue, #003468);
            border: none;
            width: 100%;
            min-height: 32px;
            border-radius: 5px;
            display: inline-block;
            font-weight: 500;
            transition: background-color 0.3s ease;
            cursor: pointer;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .mb-3 {
            margin: 18px 19px 0 19px;
        }
        .error-message {
            color: red;
            font-size: 1.2rem;
            margin-top: 0.25rem;
        }
        .form-text {
            font-size: 1.2rem;
            color: #6c757d;
            margin-top: 5px;
        }
        @media(max-width: 739px) {
            .form__user {
                min-width: 95vw;
                margin-top: 0;
            }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
