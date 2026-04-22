import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { AiFillDelete } from "react-icons/ai";
import { productApi } from "../../apis";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateCart } = useCart();

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [productDetails, setProductDetails] = useState<Record<number, any>>({});

  useEffect(() => {
    const loadProductDetails = async () => {
      const missingIds = cart
        .filter((item) => !productDetails[item.productId])
        .map((item) => item.productId);

      const uniqueIds = Array.from(new Set(missingIds));
      if (uniqueIds.length === 0) return;

      const results = await Promise.allSettled(
        uniqueIds.map((id) => productApi.getById(id)),
      );

      const newDetails: Record<number, any> = {};

      results.forEach((result, index) => {
        const id = uniqueIds[index];
        if (result.status === "fulfilled") {
          newDetails[id] = result.value.data;
        } else {
          console.error("Lỗi lấy thông tin sp:", id);
        }
      });
      setProductDetails((prev) => ({ ...prev, ...newDetails }));
    };

    loadProductDetails();
  }, [cart]);

  // 2. Logic Checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIndexes(cart.map((_, index) => index));
    } else {
      setSelectedIndexes([]);
    }
  };

  const handleSelectItem = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  // 3. Logic Cập nhật số lượng
  const handleUpdateQuantity = (index: number, delta: number) => {
    const item = cart[index];
    const newQty = Math.max(1, item.quantity + delta);
    if (newQty === item.quantity) return;

    const productData = productDetails[item.productId];
    if (!productData) {
      toast.error("Đang tải dữ liệu tồn kho, vui lòng thử lại sau.");
      return;
    }

    if (item.size && item.size !== "N/A") {
      const sizes = productData.sizes ?? [];
      const sizeObj = sizes.find(
        (s: any) => s.size.toString() === item.size?.toString(),
      );

      if (!sizeObj || newQty > sizeObj.quantity) {
        toast.error("Số lượng vượt quá tồn kho của size này.");
        return;
      }
    } else {
      if (newQty > (productData.quantity ?? 0)) {
        toast.error("Số lượng vượt quá tồn kho.");
        return;
      }
    }

    const newCart = [...cart];
    newCart[index].quantity = newQty;
    updateCart(newCart);
  };

  // 4. Đổi Size
  const handleUpdateSize = (index: number, newSize: string) => {
    const productData = productDetails[cart[index].productId];
    if (!productData) {
      toast.error("Đang tải dữ liệu sản phẩm.");
      return;
    }
    const sizes = productData.sizes ?? [];
    const sizeObj = sizes.find(
      (s: any) => s.size.toString() === newSize.toString(),
    );

    if (sizeObj) {
      const newCart = [...cart];
      newCart[index].size = newSize;
      if (newCart[index].quantity > sizeObj.quantity) {
        newCart[index].quantity = sizeObj.quantity;
      }
      updateCart(newCart);
    }
  };

  const handleRemove = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    updateCart(newCart);
    setSelectedIndexes((prev) => prev.filter((i) => i !== index));
  };

  const handleRemoveSelected = () => {
    if (selectedIndexes.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để xóa.");
      return;
    }
    const newCart = cart.filter((_, i) => !selectedIndexes.includes(i));
    updateCart(newCart);
    setSelectedIndexes([]);
  };

  const handleContinue = () => {
    const user = localStorage.getItem("userInfo");
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }
    const selectedItems = cart.filter((_, i) => selectedIndexes.includes(i));
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để tiếp tục.");
      return;
    }
    localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
    navigate("/order-info");
  };

  // Tính toán tiền dựa trên mục được chọn
  const selectedItems = cart.filter((_, i) => selectedIndexes.includes(i));
  const currentSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (cart.length === 0) {
    return (
      <div className="no-cart-wrapper">
        <h2 className="cart-title">Giỏ Hàng</h2>
        <div className="no-cart-center">
          <img
            src="https://cdn.pnj.io/images/2023/relayout-pdp/empty_product_line.png"
            alt="empty"
            className="inline"
            width="278"
            height="200"
          />
          <p>Giỏ hàng trống</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="cart-wrapper">
        <h2 className="cart-title">Giỏ Hàng</h2>
        <div className="cart-table">
          <div className="cart-table-header">
            <div>
              <input
                type="checkbox"
                id="selectAll"
                checked={
                  selectedIndexes.length === cart.length && cart.length > 0
                }
                onChange={handleSelectAll}
              />{" "}
              Tất cả ({cart.length} sản phẩm)
            </div>
            <div className="cart-table-empty"></div>
            <div className="cart-table-empty"></div>
            <div className="cart-table-empty"></div>
            <div className="cart-col cart-col-action cart-col-right">
              <button className="cart-remove" onClick={handleRemoveSelected}>
                <AiFillDelete />
              </button>
            </div>
          </div>

          <div className="cart-items">
            {cart.map((item, index) => (
              <div className="cart-row" key={`${item.productId}-${index}`}>
                <div className="cart-col cart-col-main">
                  <input
                    type="checkbox"
                    className="cart-item-checkbox"
                    checked={selectedIndexes.includes(index)}
                    onChange={() => handleSelectItem(index)}
                  />
                  <img className="cart-img" src={item.image} alt={item.name} />
                  <div className="cart-info">
                    <div className="cart-name">{item.name}</div>
                    <div className="cart-code">Mã: {item.sku}</div>

                    <div className="cart-row-size-group">
                      {item.size && item.size !== "N/A" && (
                        <div className="cart-size-group">
                          <select
                            className="cart-size-select"
                            value={item.size}
                            onChange={(e) =>
                              handleUpdateSize(index, e.target.value)
                            }
                          >
                            {productDetails[item.productId]?.sizes?.map(
                              (s: any) => (
                                <option key={s.size} value={s.size}>
                                  {s.size}
                                </option>
                              ),
                            ) || <option value={item.size}>{item.size}</option>}
                          </select>
                        </div>
                      )}

                      <div className="cart-col cart-col-qty">
                        <div className="cart-qty-group">
                          <button
                            className="cart-qty-btn"
                            onClick={() => handleUpdateQuantity(index, -1)}
                          >
                            -
                          </button>
                          <input
                            className="cart-qty-input"
                            type="text"
                            value={item.quantity}
                            readOnly
                          />
                          <button
                            className="cart-qty-btn"
                            onClick={() => handleUpdateQuantity(index, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-col cart-col-action">
                        <button
                          className="cart-remove"
                          onClick={() => handleRemove(index)}
                        >
                          <AiFillDelete />
                        </button>
                      </div>
                    </div>

                    <div className="cart-col cart-col-price">
                      <span className="cart-price">
                        {item.price.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Tạm tính</span>
              <span>{currentSubtotal.toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Tổng tiền</span>
              <span>{currentSubtotal.toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="cart-summary-note">
              (Giá tham khảo đã bao gồm VAT)
            </div>
          </div>
          <button className="cart-continue" onClick={handleContinue}>
            Tiếp tục
          </button>
        </div>
      </div>
      <style>{`
        .app { background: #f1f0f1; min-height: unset;}
        body { background: #fff; display: unset; }
        .m-12, .m-32 { margin: 0 !important; }
        #footer { background: #fff;}
      `}</style>
    </div>
  );
};

export default Cart;
