import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa6";
import { GoHome } from "react-icons/go";
import toast from "react-hot-toast";
import { orderApi } from "../../apis";
import { Order } from "../../types";
import BankTransferQR from "../../components/user/BankTransferQR";

const statusMapping: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  delivered: "Hoàn tất",
  cancelled: "Đã hủy",
};

const BillOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    if (!id) {
      toast.error("Không tìm thấy mã đơn hàng");
      navigate("/exception?code=404");
      return;
    }

    const loadOrderDetail = async () => {
      try {
        const res = await orderApi.getById(Number(id));
        setOrder(res.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          toast.error("Không tìm thấy thông tin đơn hàng");
          navigate("/exception?code=404");
        } else if (error.response?.status === 403 || error.response?.status === 401) {
          toast.error("Bạn không có quyền xem đơn hàng này");
          navigate("/exception?code=403");
        } else {
          toast.error("Lỗi tải thông tin đơn hàng");
          navigate("/exception?code=500");
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetail();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="p-10 text-center">Đang tải thông tin đơn hàng...</div>
    );
  if (!order) return null;

  return (
    <div className="app">
      <div className="order-modern">
        {/* Header */}
        <div className="order-header !border-b-0">
          <Link to="/orders" className="order-left no-underline">
            <div className="order-back">
              <FaChevronLeft />
            </div>
            <span className="order-title mb-0 !text-[1.4rem]">
              Thông tin đơn hàng
            </span>
          </Link>
          <Link to="/my-home" className="order-right no-underline">
            <GoHome />
          </Link>
        </div>

        <div className="order-section-list">
          {/* Section: Trạng thái */}
          <div className="order-section order-status">
            <div className="order-row flex justify-between items-center">
              <div>
                <span className="order-label">Đơn hàng</span>
              </div>
              <span className="order-status-badge">
                {statusMapping[order.status?.toLowerCase()] || order.status}
              </span>
            </div>
            <div>
              <span className="order-label-sku">Mã đơn hàng:</span>{" "}
              <span className="order-id">#{order.id}</span>
            </div>
            <div>
              <span className="order-label-created-at">
                Thời gian đặt hàng:
              </span>{" "}
              <span>{formatDateTime(order.createAt)}</span>
            </div>
            <div className="order-actions">
              <button
                className="order-action-btn"
                onClick={() =>
                  toast.success("Hệ thống đang chuẩn bị hóa đơn điện tử...")
                }
              >
                <i className="fa fa-file-invoice"></i> Hóa đơn điện tử
              </button>
              <button
                className="order-action-btn"
                onClick={() =>
                  toast.error("Vui lòng liên hệ hotline để thực hiện đổi trả")
                }
              >
                <i className="fa fa-heart"></i> Chính sách đổi trả
              </button>
            </div>
          </div>

          {/* Section: Khách hàng */}
          <div className="order-section order-customer">
            <div className="order-label">Khách hàng</div>
            <div className="order-customer-info">
              <div className="order-customer-name">{order.customerName}</div>
              <div className="order-customer-phone">
                Số điện thoại: {order.customerPhone}
              </div>
              <div className="order-customer-address">
                Địa chỉ: {order.customerAddress}
              </div>
            </div>
          </div>

          {/* Section: Danh sách sản phẩm */}
          <div className="order-section order-products">
            <div className="order-label">Đơn hàng</div>
            <div className="order-product-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-product-item-hr">
                  <div className="order-product-item">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="order-product-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/60x60?text=No+Image";
                      }}
                    />
                    <div className="order-product-info">
                      <div className="order-product-name">
                        {item.quantity}x {item.productName}
                      </div>
                      <div className="order-product-code">
                        {item.sku || "N/A"}
                      </div>
                      <div className="order-product-price">
                        {item.price ? item.price.toLocaleString("vi-VN") : "0"}đ
                      </div>
                    </div>
                  </div>
                  <div className="order-product-policy">
                    Chính sách hậu mãi & hướng dẫn sử dụng
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total-row">
              <span className="order-total-label">Tổng tiền:</span>
              <span className="order-total-value">
                {order.totalPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          {/* Section: QR Code for Bank Transfer */}
          {order.paymentMethod === "BANK_TRANSFER" && order.qrCodeUrl && (
            <div className="order-section">
              <BankTransferQR
                qrCodeUrl={order.qrCodeUrl}
                orderId={order.id}
                amount={order.totalPrice}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillOrder;
