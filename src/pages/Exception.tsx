import React from "react";
import { Link, useSearchParams } from "react-router-dom";

const codeMap: Record<string, [string, string]> = {
  "400": ["Bad Request", "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại."],
  "401": ["Unauthorized", "Bạn chưa đăng nhập hoặc không có quyền truy cập."],
  "403": ["Forbidden", "Bạn không được phép truy cập tài nguyên này."],
  "404": ["Not Found", "Không tìm thấy trang bạn yêu cầu."],
  "500": [
    "Internal Server Error",
    "Đã có lỗi xảy ra từ hệ thống. Vui lòng thử lại sau.",
  ],
  "503": [
    "Service Unavailable",
    "Dịch vụ hiện không khả dụng. Hãy quay lại sau.",
  ],
};

const Exception: React.FC = () => {
  // Lấy params từ URL (ví dụ: ?code=404)
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") || "500";

  // Lấy tiêu đề và tin nhắn tương ứng, nếu không có thì mặc định là lỗi 500
  const [errorTitle, errorMessage] = codeMap[code] || codeMap["500"];

  return (
    <div className="error-page-wrapper">
      <div className="error-container">
        <div className="error-box">
          <div className="error-icon">
            <i className="fa-solid fa-ban"></i>
          </div>
          <h1 id="errorCode">{code}</h1>
          <h4 id="errorTitle">{errorTitle}</h4>
          <p id="errorMessage">{errorMessage}</p>
          <Link to="/" className="btn-home">
            <i className="fas fa-home"></i> Về trang chủ
          </Link>
        </div>
      </div>

      <style>{`
        .error-page-wrapper {
            background: #f8fafc;
            height: 100vh;
            width: 100%;
        }

        .error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
        }

        .error-box {
            background: #f0f0f0;
            padding: 40px 50px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 90%;
        }

        .error-box h1 {
            font-size: 72px;
            font-weight: bold;
            color: #e74c3c;
            margin: 0;
        }

        .error-box h4 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }

        .error-box p {
            color: #6c757d;
            margin-bottom: 25px;
            font-size: 1rem;
            line-height: 1.5;
        }

        .btn-home {
            padding: 10px 25px;
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white !important;
            border: none;
            border-radius: 25px;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .btn-home:hover {
            background: linear-gradient(135deg, #2980b9, #21618c);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
        }

        .error-icon {
            font-size: 48px;
            color: #e74c3c;
            margin-bottom: 15px;
        }

        @media (max-width: 576px) {
            .error-box {
                padding: 30px 20px;
            }
            .error-box h1 {
                font-size: 50px;
            }
        }
      `}</style>
    </div>
  );
};

export default Exception;
