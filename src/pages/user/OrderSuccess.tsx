import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { paymentApi } from "../../apis";
import { STORAGE_KEYS } from '../../constants';

interface OrderItem {
  productName: string;
  quantity: number;
  size?: string | number;
  total: number;
}

interface OrderData {
  id: number;
  createAt: string;
  totalPrice: number;
  paymentMethod?: string;
  items: OrderItem[];
}

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();

  const [order] = useState<OrderData | null>(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEYS.LAST_ORDER);
    if (savedOrder) {
      try {
        const parsedOrder: OrderData = JSON.parse(savedOrder);
        // Kiểm tra nếu có ID thì mới trả về dữ liệu
        return parsedOrder.id ? parsedOrder : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    // Nếu biến order ở trên bị null (sau khi đã khởi tạo) -> Không có đơn hàng -> Đá về trang chủ
    if (!order) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      navigate("/");
      return;
    }

    // Xóa localStorage ngay sau khi state đã giữ dữ liệu
    localStorage.removeItem(STORAGE_KEYS.LAST_ORDER);
  }, [order, navigate]);

  const handleZaloPay = async (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (!token) {
      toast.error("Bạn cần đăng nhập để thanh toán!");
      navigate("/login");
      return;
    }

    if (!order) return;

    try {
      const response = await paymentApi.createZaloPay({
        orderId: order.id,
        amount: order.totalPrice,
      });

      const paymentUrl =
        (response as any).paymentUrl ?? response.data?.paymentUrl;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error("Không thể tạo link thanh toán");
      }
    } catch (err) {
      toast.error("Không thể tạo đơn thanh toán ZaloPay");
    }
  };

  if (!order) return null;

  // Định dạng ngày tháng
  const formattedDate = new Date(order.createAt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="app">
      <div className="grid wide">
        <div className="row">
          <div className="c-12 l-12 m-12">
            <div className="header">
              <div className="header-text text-center">Hóa đơn bán hàng</div>
            </div>

            <div className="order-info">
              <div className="info-item">
                <div className="info-label">MÃ ĐƠN HÀNG</div>
                <div className="info-value">{order.id}</div>
              </div>
              <div className="info-item">
                <div className="info-label">NGÀY</div>
                <div className="info-value">{formattedDate}</div>
              </div>
              <div className="info-item">
                <div className="info-label">TỔNG CỘNG</div>
                <div className="info-value">
                  {order.totalPrice.toLocaleString("vi-VN")} VND
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">PHƯƠNG THỨC THANH TOÁN</div>
                <div className="info-value">
                  {order.paymentMethod || "Thanh toán qua ZaloPay"}
                </div>
              </div>
            </div>

            <div className="order-details">
              <div className="order-title">Chi tiết đơn hàng</div>

              <table>
                <thead>
                  <tr>
                    <th className="product-cell">Sản phẩm</th>
                    <th className="price-cell">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {item.productName} × {item.quantity}
                        {item.size ? ` (Size: ${item.size})` : ""}
                      </td>
                      <td className="price-cell">
                        {item.total.toLocaleString("vi-VN")} VND
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <strong>Tổng số phụ:</strong>
                    </td>
                    <td className="price-cell">
                      <strong>
                        {order.items
                          .reduce((sum, item) => sum + item.total, 0)
                          .toLocaleString("vi-VN")}{" "}
                        VND
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Phương thức thanh toán:</td>
                    <td className="price-cell">
                      {order.paymentMethod || "Thanh toán qua ZaloPay"}
                    </td>
                  </tr>
                  <tr style={{ borderTop: "2px solid #333" }}>
                    <td>
                      <strong>Tổng cộng:</strong>
                    </td>
                    <td className="price-cell">
                      <strong style={{ color: "#b84b54" }}>
                        {order.totalPrice.toLocaleString("vi-VN")} VND
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="note">
                <strong>Lưu ý:</strong> Tôi sẽ nhận hàng vào giờ hành chính. Quý
                công ty lưu ý giúp tôi.
              </div>
            </div>

            {order.paymentMethod === "ZALOPAY" && (
              <div className="qr-container">
                <h4>Thanh toán ZaloPay</h4>
                <button
                  id="zalopay-btn"
                  className="btn btn-primary cursor-pointer"
                  onClick={handleZaloPay}
                >
                  Thanh toán tại đây
                </button>
              </div>
            )}

            <div className="navigation">
              <Link to="/containers" className="btn btn-back">
                Quay lại
              </Link>
              <Link to="/" className="btn btn-continue">
                Tiếp tục mua hàng
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .app {
            background: #fff;
            min-height: unset;
        }
        body {
            background: #fff;
            display: unset;
        }  
        .header {
            margin-bottom: 20px;
        }

        .header::after {
            content: unset;
        }

        .header-text {
            font-size: 1.8rem;
            margin-bottom: 10px;
            color: #252B61;
            font-weight: 600;
        }
        .order-info {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 30px;
        }
        .info-item {
            padding: 5px 0;
        }
        .info-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 3px;
        }
        .info-value {
            font-size: 14px;
            font-weight: bold;
        }
        .order-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 12px 8px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background-color: #f9f9f9;
            font-weight: normal;
            font-size: 14px;
            color: #666;
        }
        td {
            font-size: 14px;
        }
        .product-cell {
            width: 60%;
        }
        .price-cell {
            width: 40%;
            text-align: right;
        }
        .note {
            margin-top: 10px;
            font-size: 14px;
            color: #666;
        }
        .navigation {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
        }

        .btn-back:hover, 
        .btn-continue:hover {
            background-color: #0c1aaa;
        }

        .btn {
            background-color: #1a237e;
            color: white !important;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            border: none;
        }
        .qr-container {
            text-align: center;
            margin-top: 30px;
        }

        .m-12 {
            margin: 0 !important;
        }



        @media (max-width: 768px) {
            .order-info {
                grid-template-columns: repeat(2, 1fr);
            }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;
