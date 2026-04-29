import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa6";
import { GoHome } from "react-icons/go";
import { orderApi } from "../../apis";
import { Order } from "../../types";
import { STORAGE_KEYS } from '../../constants';
import { ACCOUNT_STATUS } from '../../constants';
import "../../assets/css/orders.css";

const statusMapping: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Hoàn tất",
  cancelled: "Đã hủy",
};

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState("all");

  const accountId = localStorage.getItem(STORAGE_KEYS.USER_ID);

  const fetchOrders = async (status: string) => {
    setLoading(true);
    try {
      const res = await orderApi.getMyOrders(Number(accountId), status);
      console.log("Orders API response:", res); // Debug log
  
      if (res.data) {
        const allOrders: Order[] = res.data.content ?? [];
        console.log("Orders loaded:", allOrders.length); // Debug log
        setOrders(allOrders);
      } else {
        console.warn("No data in response"); // Debug log
        setOrders([]);
      }
    } catch (error: any) {
      console.error("Lỗi tải đơn hàng:", error);
      setOrders([]); // Set empty array on error
      if (error.response?.data?.status && error.response.data.status !== ACCOUNT_STATUS.ACTIVE) {
        handleAccountIssue(error.response.data.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccountIssue = (status: string) => {
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
      default:
        msg = "Lỗi không xác định";
    }
    alert(msg);
    localStorage.clear();
    navigate("/exception?code=403");
  };

  useEffect(() => {
    if (!accountId) {
      navigate("/login");
      return;
    }
    fetchOrders(currentStatus);
  }, [currentStatus]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="app">
      <div className="order-modern">
        {/* Header */}
        <div className="order-header pb-0 !border-b-0">
          <Link to="/my-home" className="order-left">
            <div className="order-back">
              <FaChevronLeft />
            </div>
            <span className="order-title mb-0 !text-[1.4rem]">Đơn hàng</span>
          </Link>
          <Link to="/my-home" className="order-right">
            <div className=" h-6 bg-[rgba(145,158,171,0.08)] rounded-full overflow-hidden flex items-center justify-center">
              <GoHome />
            </div>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="order-filter">
          {[
            "all",
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
          ].map((status) => (
            <button
              key={status}
              className={`order-filter-btn ${currentStatus === status ? "active" : ""}`}
              onClick={() => setCurrentStatus(status)}
            >
              {status === "all" ? "Tất cả" : statusMapping[status]}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="order-list">
          {loading ? (
            <div className="order-no-card">
              <p>Đang tải...</p>
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <Link
                key={order.id}
                to={`/bill-order/${order.id}`}
                className="order-link"
              >
                <div className="order-card">
                  <div className="order-card-row order-card-top">
                    <div className="order-card-left">
                      <span className="order-card-date">
                        {formatDate(order.createAt)}
                      </span>
                      <div className="order-card-sku">
                        <span className="order-card-channel">
                          {"Kênh Online"}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1.1em"
                          height="1.1em"
                          viewBox="0 0 48 48"
                        >
                          <path
                            fill="#919eab"
                            stroke="#919eab"
                            strokeWidth="4"
                            d="M24 33a9 9 0 1 0 0-18a9 9 0 0 0 0 18Z"
                          />
                        </svg>
                        <span className="order-card-id">#{order.id}</span>
                      </div>
                    </div>
                    <span
                      className={`order-card-status ${order.status.toLowerCase()}`}
                    >
                      {statusMapping[order.status.toLowerCase()] ||
                        order.status}
                    </span>
                  </div>

                  <div className="order-card-row order-card-product">
                    <img
                      src={
                        order.items[0]?.image ||
                        "https://via.placeholder.com/150"
                      }
                      alt={order.items[0]?.productName}
                      className="order-card-img"
                    />
                    <span className="order-card-name">
                      {order.items[0]?.quantity}x {order.items[0]?.productName}
                    </span>
                  </div>

                  <div className="order-card-row order-card-total">
                    <span className="order-card-total-label">Tổng tiền:</span>
                    <span className="order-card-total-value">
                      {order.totalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="order-no-card">
              <p>Không có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
