import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BannerPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Kiểm tra xem banner đã bị đóng trong session này chưa
    const bannerClosed = sessionStorage.getItem("bannerClosed");

    if (!bannerClosed) {
      // Đợi 500ms rồi mới hiện (giống logic cũ của bạn)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("bannerClosed", "true");
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay: Lớp nền mờ */}
      <div
        className="banner-overlay"
        onClick={handleClose} // Click ra ngoài cũng đóng
      ></div>

      {/* Banner chính */}
      <div className="banner-container">
        <span className="close-btn" onClick={handleClose}>
          &times;
        </span>
        <br />
        <Link to="/containers">
          <img
            src="https://a.omappapi.com/users/c6e493b4ae43/images/d49a83ce4ad91756107252-popup.png?width=747"
            alt="Banner Image"
            className="banner-img"
          />
        </Link>
      </div>

      <style>{`
        .banner-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 26, 65, 0.5);
            z-index: 9998;
            animation: fadeIn 0.3s ease-in-out;
        }

        .banner-container {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #222;
            padding: 20px;
            border-radius: 5px;
            z-index: 9999;
            max-width: 465px;
            animation: fadeIn 0.4s ease-in-out;
        }

        .banner-img {
            max-width: 100%; 
            margin-top: 10px; 
            border-radius: 3px;
        }

        .close-btn {
            position: absolute;
            top: 12px;
            right: 15px;
            cursor: pointer;
            font-weight: bold;
            font-size: 26px;
            color: #fff;
            width: 30px;
            height: 30px;
            text-align: center;
            border-radius: 50%;
            background: #dddddd;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.2s;
        }

        .close-btn:hover {
            color: #ddd;
            background: #fff;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default BannerPopup;
