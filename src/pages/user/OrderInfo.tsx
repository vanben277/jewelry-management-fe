import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { orderApi } from "../../apis";
import { PaymentMethod } from "../../types";

interface CheckoutItem {
  productId: number;
  name: string;
  sku: string;
  price: number;
  image: string;
  quantity: number;
  size?: string | number;
}

const OrderInfo: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD"); // ✅ thêm state

  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

    if (items.length === 0) {
      toast.error("Giỏ hàng trống. Vui lòng thêm sản phẩm.");
      navigate("/cart");
      return;
    }

    setCheckoutItems(items);
    setTotal(
      items.reduce(
        (acc: number, item: CheckoutItem) => acc + item.price * item.quantity,
        0,
      ),
    );

    if (userInfo) {
      setFormData({
        fullname:
          `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim(),
        phone: userInfo.phone || "",
        address: userInfo.address || "",
      });
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullname.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }

    setLoading(true);

    const orderData = {
      customerName: formData.fullname.trim(),
      customerPhone: formData.phone.trim(),
      customerAddress: formData.address.trim(),
      paymentMethod,
      items: checkoutItems.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        size: item.size === "N/A" || !item.size ? null : item.size,
      })),
    };

    try {
      const resData = await orderApi.create(orderData);
      localStorage.setItem("lastOrder", JSON.stringify(resData.data));
      localStorage.removeItem("checkoutItems");
      clearCart();
      navigate("/order-success");
    } catch (error: any) {
      const errorCode =
        error.response?.data?.errorCode || error.response?.status || "500";
      toast.error(error.response?.data?.message || "Đặt hàng thất bại");
      navigate(`/exception?code=${errorCode}`);
    } finally {
      setLoading(false);
    }
  };

  // UI helper
  const paymentOptions: {
    value: PaymentMethod;
    label: string;
    sub?: string;
    icon: string;
  }[] = [
    {
      value: "COD",
      label: "Thanh toán tiền mặt khi nhận hàng (COD)",
      icon: "fa-money-bill",
    },
    {
      value: "BANK_TRANSFER",
      label: "Thanh toán chuyển khoản",
      icon: "fa-building-columns",
    },
    {
      value: "ZALOPAY",
      label: "Thanh toán ZaloPay / Quét mã QR",
      icon: "fa-qrcode",
    },
  ];

  return (
    <div className="order-container">
      <h2
        className="or-header-center"
        style={{
          display: "flex",
          justifyContent: "center",
          color: "var(--text-blue)",
        }}
      >
        Thông tin đặt hàng
      </h2>

      {/* Danh sách sản phẩm */}
      <div className="order-list">
        {checkoutItems.map((item, index) => (
          <div className="order-item" key={index}>
            <img src={item.image} alt="Product" />
            <div className="item-details">
              <h4>{item.name}</h4>
              <p>Mã: {item.sku}</p>
              <p>
                Đơn giá: <strong>{item.price.toLocaleString("vi-VN")} đ</strong>
              </p>
              <div className="qty-control">
                Số lượng: <span>{item.quantity}</span>
              </div>
              {item.size && item.size !== "N/A" && (
                <div className="qty-control">
                  Kích cỡ: <span>{item.size}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="summary-section">
        <table className="summary-table">
          <tbody>
            <tr>
              <td>Tạm tính</td>
              <td style={{ color: "#b84b54" }}>
                {total.toLocaleString("vi-VN")} đ
              </td>
            </tr>
            <tr>
              <td>Giao hàng</td>
              <td>Miễn phí</td>
            </tr>
            <tr>
              <td>
                <strong style={{ color: "var(--text-color)" }}>
                  Tổng tiền
                </strong>
              </td>
              <td>
                <strong style={{ color: "#b84b54" }}>
                  {total.toLocaleString("vi-VN")} đ
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-color)",
            float: "right",
            margin: "0",
            fontStyle: "italic",
          }}
        >
          (Giá tham khảo đã bao gồm VAT)
        </p>
      </div>

      <form id="order-form" onSubmit={handleSubmit}>
        {/* Thông tin người mua */}
        <div className="buyer-info">
          <span>Thông tin người mua</span>
          <input
            type="text"
            name="fullname"
            placeholder="Họ và tên *"
            value={formData.fullname}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại *"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="address"
            placeholder="Địa chỉ *"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>

        <div className="payment-methods-section" style={{ marginTop: "20px" }}>
          <h4>Phương thức thanh toán</h4>
          {paymentOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => setPaymentMethod(opt.value)}
              style={{
                border: `2px solid ${paymentMethod === opt.value ? "#b84b54" : "#ccc"}`,
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "6px",
                cursor: "pointer",
                background:
                  paymentMethod === opt.value
                    ? "#fff6f6"
                    : opt.value === "ZALOPAY"
                      ? "#fff"
                      : "#fff",
                color: "var(--text-color)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "border 0.2s",
              }}
            >
              <i className={`fa-solid ${opt.icon}`}></i>
              <strong>{opt.label}</strong>
              {paymentMethod === opt.value && (
                <span style={{ marginLeft: "auto", color: "#b84b54" }}>✓</span>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="order-button enabled"
        >
          {loading ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG"}
        </button>
      </form>

      <style>{`
        .app { background: #fff; }
        body { background: #fff; display: unset; }
        .m-12, .m-32 { margin: 0 !important; }
        form { padding: 0; }
        input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; outline: none; margin-bottom: 10px; }
      `}</style>
    </div>
  );
};

export default OrderInfo;
