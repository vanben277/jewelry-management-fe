import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "../../components/user/BottomNav";
import { STORAGE_KEYS } from '../../constants';

interface UserInfo {
  firstName: string;
  lastName: string;
}

const MyHome: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>("Khách hàng");

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (!savedUser) {
      alert("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }

    const user: UserInfo = JSON.parse(savedUser);
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    setFullName(name || "Khách hàng");
  }, [navigate]);

  return (
    <div className="app">
      <div className="my-home">
        {/* Header Background */}
        <div className="home-header-bg scale-[1.1]">
          <img
            src="https://cdn.pnj.io/images/customer/home/bg_common_for_all_users.jpg"
            alt="Header Background"
          />
        </div>

        {/* Header Content */}
        <div className="home-header-content">
          <div className="home-header-row">
            <span className="home-title">My PNJ</span>
            <Link to="/" className="home-buy-link">
              <div className="home-buy-image">
                <img
                  src="https://cdn.pnj.io/images/customer/home/ic_ecommerce.svg"
                  alt="Cart Icon"
                />
              </div>
              <span>Mua hàng tại PNJ</span>
            </Link>
          </div>
          <div className="home-user-welcome">Xin chào !</div>
          <div className="home-user-name">{fullName.toUpperCase()}</div>
          <div className="home-user-tags">
            <span className="home-user-tag-rank">
              Hạng thẻ <span className="home-user-tag">Kết nối</span>
            </span>
          </div>
        </div>

        <div className="pd-12">
          {/* Point Card */}
          <div className="home-card home-point-card shadow-lg">
            <div className="home-point-row">
              <div className="home-point-label">Điểm hạng thẻ</div>
            </div>
            <div className="home-point-row">
              <div className="home-point-value">0 điểm</div>
              <div className="home-point-max">99 điểm</div>
            </div>
            <div className="home-point-bar-bg">
              <div className="home-point-bar" style={{ width: "0%" }}></div>
            </div>
            <div className="home-point-desc">
              Bạn cần 100 điểm nữa để tăng hạng
            </div>
          </div>

          {/* Feature List */}
          <div className="home-feature-list">
            <div className="home-feature-row">
              <Link to="/orders" className="home-feature-item">
                <div className="home-feature-name">
                  <span>Đơn hàng</span>
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="home-feature-border clip-bottom-0">
                  <div className="home-feature-icon">
                    <img
                      src="https://cdn.pnj.io/images/customer/home/shopping_bag.svg"
                      alt="Đơn hàng"
                      width="65"
                      height="62"
                    />
                  </div>
                </div>
              </Link>
              <Link to="/benefits" className="home-feature-item">
                <div className="home-feature-name">
                  <span>Quyền lợi của tôi</span>
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="home-feature-border clip-bottom-0">
                  <div className="home-feature-icon">
                    <img
                      src="https://cdn.pnj.io/images/customer/home/double_stars.svg"
                      alt="Quyền lợi"
                      width="62"
                      height="65"
                    />
                  </div>
                </div>
              </Link>
            </div>

            <div className="home-feature-row">
              <Link to="/promotions" className="home-feature-item">
                <div className="home-feature-name">
                  <span>Phiếu quà tặng</span>
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="home-feature-border clip-bottom-0">
                  <div className="home-feature-icon">
                    <img
                      src="https://cdn.pnj.io/images/customer/home/gift_box.svg"
                      alt="Phiếu quà tặng"
                      width="60"
                      height="60"
                    />
                  </div>
                </div>
              </Link>
              <Link to="/discount-code" className="home-feature-item">
                <div className="home-feature-name">
                  <span>Mã giảm giá</span>
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="home-feature-border clip-bottom-0">
                  <div className="home-feature-icon">
                    <img
                      src="https://cdn.pnj.io/images/customer/home/percent.svg"
                      alt="Mã giảm giá"
                      width="56"
                      height="56"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Banner */}
          <div className="home-banner">
            <img
              src="https://cdn.pnj.io/images/customer/home/banner_home_page_20250619.jpeg"
              alt="Banner PNJ"
            />
          </div>

          <BottomNav />
        </div>
      </div>
    </div>
  );
};

export default MyHome;
