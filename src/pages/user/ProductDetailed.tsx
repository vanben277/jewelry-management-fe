import React, { useState, useEffect, TouchEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DOMPurify from 'dompurify';
import { FaStar, FaCircleCheck, FaBox } from "react-icons/fa6";
import { useCart } from "../../context/CartContext";
import { productApi } from "../../apis";
import { Product } from "../../types";
import { STORAGE_KEYS } from '../../constants';
import { saveCheckoutWithChecksum } from "../../utils";

const ProductDetailed: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- States ---
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState("");
  const [currentThumbIndex, setCurrentThumbIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [stockStatus, setStockStatus] = useState({
    text: "",
    isOutOfStock: false,
  });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const { addToCart } = useCart();

  // Logic for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    // 1. Kiểm tra id có tồn tại và có phải là một chuỗi số không
    if (!id || isNaN(Number(id))) {
      console.error("ID sản phẩm không hợp lệ:", id);
      toast.error("Sản phẩm không tồn tại hoặc đường dẫn sai.");
      navigate("/"); // Chuyển về trang chủ nếu ID là NaN
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        // 2. Chỉ gọi API khi ID đã chắc chắn là số hợp lệ
        const res = await productApi.getById(Number(id));

        if (res.data) {
          const productData: Product = res.data;
          setProduct(productData);

          const primary =
            productData.images?.find((img) => img.isPrimary) ||
            productData.images?.[0];
          setMainImage(primary?.imageUrl || "");

          // Xử lý size và kho hàng
          if (productData.sizes && productData.sizes.length > 0) {
            setSelectedSize(String(productData.sizes[0].size));
            updateStockInfo(productData.sizes[0].quantity);
          } else {
            setSelectedSize("");
            updateStockInfo(productData.quantity || 0);
          }
          setLoading(false);
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
        navigate("/exception?code=404");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // --- Helper Functions ---
  const updateStockInfo = (qty: number) => {
    if (qty > 0) {
      setStockStatus({ text: `Còn ${qty} sản phẩm`, isOutOfStock: false });
    } else {
      setStockStatus({ text: "Hết hàng", isOutOfStock: true });
    }
  };

  const handleSizeClick = (size: string, qty: number) => {
    setSelectedSize(size);
    updateStockInfo(qty);
  };

  const formatPrice = (price: number) => {
    return price ? price.toLocaleString("vi-VN") + " ₫" : "Liên hệ";
  };

  // --- Desktop Navigation ---
  const nextThumbnails = () => {
    if (product && currentThumbIndex < product.images.length - 6) {
      setCurrentThumbIndex((prev) => prev + 1);
    }
  };

  const previousThumbnails = () => {
    if (currentThumbIndex > 0) {
      setCurrentThumbIndex((prev) => prev - 1);
    }
  };

  // --- Mobile Slider Logic ---
  const nextMobileSlide = () => {
    if (product && currentSlide < product.images.length) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevMobileSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  // --- Swipe Handlers ---
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextMobileSlide();
    } else if (isRightSwipe) {
      prevMobileSlide();
    }
  };

  const handleAddToCart = (isBuyNow: boolean = false) => {
    if (!product) return;

    let stockQty = 0;
    if (product.sizes && product.sizes.length > 0) {
      const currentSizeObj = product.sizes.find(
        (s) => String(s.size) === String(selectedSize),
      );
      stockQty = currentSizeObj ? currentSizeObj.quantity : 0;
    } else {
      stockQty = product.quantity ?? 0;
    }

    if (stockQty <= 0) {
      toast.error("Sản phẩm hiện đang hết hàng");
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.displayName || product.name,
      sku: product.sku,
      image: mainImage,
      price: product.price,
      size: selectedSize || "N/A",
      quantity: 1,
    };

    if (isBuyNow) {
      const user = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      if (!user) {
        toast.error("Vui lòng đăng nhập để tiếp tục mua hàng");
        navigate("/login");
        return;
      }

      // ✅ Save with checksum to prevent tampering
      const checkoutItem = { ...cartItem, selected: true };
      saveCheckoutWithChecksum([checkoutItem], STORAGE_KEYS.CHECKOUT_ITEMS, 'checkoutChecksum');
      
      navigate("/order-info");
    } else {
      addToCart(cartItem);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-xl font-bold">
        Đang tải thông tin sản phẩm...
      </div>
    );
  if (!product) return null;

  return (
    <>
      <div className="b__container m-32 mt-unset-16">
        <div className="grid wide">
          <div className="row">
            {/* LEFT: Gallery */}
            <div id="image" className="col c-12 m-12 l-6 b__container--list">
              <div className="desktop-gallery">
                <div className="main-image-container">
                  <img
                    id="mainImage"
                    className="main-image"
                    src={mainImage}
                    alt={`Ảnh chính sản phẩm ${product.name}`}
                    loading="eager"
                    decoding="async"
                  />
                  <div className="b__container--right">
                    <img
                      src="https://cdn.pnj.io/images/image-update/tag-product/new-icon-3-w29.svg"
                      alt="New"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>

                <div className="thumbnail-container">
                  <button
                    className="nav-button"
                    onClick={previousThumbnails}
                    disabled={currentThumbIndex === 0}
                  >
                    <img
                      src="https://www.pnj.com.vn/site/assets/images/previous.svg"
                      alt="prev"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>

                  <div
                    className="thumbnail-wrapper"
                    style={{
                      transform: `translateX(-${currentThumbIndex * 90}px)`,
                      display: "flex",
                      transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {product.images.map((img, idx) => (
                      <img
                        key={idx}
                        className={`thumbnail ${mainImage === img.imageUrl ? "active" : ""}`}
                        src={img.imageUrl}
                        alt={`Ảnh thu nhỏ ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        onClick={() => {
                          setMainImage(img.imageUrl);
                          setCurrentSlide(idx + 1);
                        }}
                      />
                    ))}
                  </div>

                  <button
                    className="nav-button nav-button-next"
                    onClick={nextThumbnails}
                    disabled={currentThumbIndex >= product.images.length - 6}
                  >
                    <img
                      src="https://www.pnj.com.vn/site/assets/images/previous.svg"
                      alt="next"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                </div>
              </div>

              {/* Mobile Gallery with Swipe Logic */}
              <div className="mobile-gallery">
                <div
                  className="mobile-slider overflow-hidden relative"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <div
                    className="mobile-slides flex transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${(currentSlide - 1) * 100}%)`,
                    }}
                  >
                    {product.images.map((img, idx) => (
                      <div key={idx} className="mobile-slide min-w-full">
                        <img
                          src={img.imageUrl}
                          alt={`Ảnh sản phẩm ${idx + 1}`}
                          className="w-full h-auto object-contain"
                          loading={idx === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Floating Counter */}
                  <div className="slide-counter">
                    <span>{currentSlide}</span>/
                    <span>{product.images.length}</span>
                  </div>

                  {/* Icon New for mobile */}
                  <div className="b__container--right">
                    <img
                      src="https://cdn.pnj.io/images/image-update/tag-product/new-icon-3-w29.svg"
                      alt="New"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>

                {/* Mobile Navigation Buttons - Only show if images > 1 */}
              </div>
            </div>

            {/* RIGHT: Product Info */}
            <div
              id="product-info"
              className="col c-12 m-12 l-6 b__container--list ml-12 mr-12"
            >
              <div className="b__container--head">
                <div className="b__container--logo">
                  <img
                    src="https://cdn.pnj.io/images/image-update/2022/10/pnjfast/PNJfast-Giaotrong3h.svg"
                    alt="PNJ Fast"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="b__container--name">
                  <h1>{product.displayName || product.name}</h1>
                </div>
              </div>

              <div className="b__container--text">
                <div className="b__container--a">Mã: {product.sku}</div>
                <div className="b__container--b">
                  <div className="container__b--icon flex items-center gap-1">
                    <FaStar color="#ffc107" /> <span>(0)</span>
                  </div>
                  <div className="container__b--sales">
                    {(product.soldQuantity ?? 0) > 0 &&
                      `${product.soldQuantity} đã bán`}
                  </div>
                </div>
              </div>

              <div className="b__container--price items-center">
                <div className="container__price--a">
                  {formatPrice(product.price)}
                </div>
                {product.price > 0 && (
                  <div className="container__price--b">
                    Chỉ cần trả{" "}
                    {Math.round(product.price / 12).toLocaleString("vi-VN")}{" "}
                    ₫/tháng
                  </div>
                )}
              </div>

              <span className="b__container--note">
                (Giá sản phẩm thay đổi tùy trọng lượng vàng và đá)
              </span>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="b__container--size">
                  Vui lòng chọn size *
                  <div className="container__size--num">
                    {product.sizes.map((s, idx) => (
                      <span
                        key={idx}
                        className={
                          String(selectedSize) === String(s.size)
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          handleSizeClick(String(s.size), s.quantity)
                        }
                      >
                        {s.size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <span className="b__container--stock">
                {stockStatus.text} -
                <a href="https://www.facebook.com/" className="ml-1">
                  <i className="fa-brands fa-facebook"></i>
                </a>{" "}
                Nhấn để được tư vấn và nhận ưu đãi
              </span>

              {/* Endows */}
              <div className="b__container--endow">
                <p>Ưu đãi:</p>
                {[
                  {
                    text: "Giảm đến 300K khi thanh toán bằng VpBank-QR",
                    link: "https://www.vpbank.com.vn",
                  },
                  {
                    text: "Giảm 800.000VNĐ cho đơn hàng từ 20tr qua thẻ VPBank",
                    link: "#",
                  },
                  {
                    text: "Ưu đãi thêm lên đến 1.5tr khi thanh toán bằng TECHCOMBANK",
                    link: "#",
                  },
                ].map((e, i) => (
                  <div key={i} className="container__endow--1 items-center">
                    <div className="b__icon">
                      <FaCircleCheck color="#28a745" />
                    </div>
                    <div className="b__name">
                      {e.text}. <a href={e.link}>Xem chi tiết</a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery */}
              <div className="b__container--delivery">
                <div className="container__delivery--item">
                  <div className="delivery__icon">
                    <img
                      src="https://www.pnj.com.vn/site/assets/images/shipping-icon.svg"
                      width="25"
                      alt="shipping"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="delivery__name">
                    Miễn phí giao hàng trong 3 giờ
                  </div>
                </div>
                <div className="container__delivery--item">
                  <div className="delivery__icon">
                    <img
                      src="https://www.pnj.com.vn/site/assets/images/shopping 247-icon.svg"
                      alt="247"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="delivery__name">Phục vụ 24/7</div>
                </div>
                <div className="container__delivery--item">
                  <div className="delivery__icon">
                    <FaBox />
                  </div>
                  <div className="delivery__name">Thu đổi 48h</div>
                </div>
              </div>

              {/* Actions Footer */}
              <footer className="b__container--footer">
                <div className="b__btnred">
                  <button
                    disabled={stockStatus.isOutOfStock}
                    onClick={() => handleAddToCart(true)}
                    className={stockStatus.isOutOfStock ? "opacity-50" : ""}
                  >
                    <p>Mua ngay</p>
                    <span>
                      (Giao hàng miễn phí tận nhà hoặc nhận tại cửa hàng)
                    </span>
                  </button>
                </div>
                <div className="b__list">
                  <button
                    className={`b__btnblue ${stockStatus.isOutOfStock ? "opacity-50" : ""}`}
                    disabled={stockStatus.isOutOfStock}
                    onClick={() => handleAddToCart(false)}
                  >
                    <div className="btn--item">
                      <span>Thêm vào giỏ hàng</span>
                    </div>
                  </button>
                  <div className="b__btnblue">
                    <div className="btn--item">Gọi ngay (miễn phí)</div>
                  </div>
                </div>
              </footer>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="product-description mt-10 p-4 border-t">
              <h3 className="text-xl font-bold mb-4">Mô tả sản phẩm:</h3>
              <div dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(product.description) 
              }} />
            </div>
          )}
        </div>
      </div>
      <style>{`
        .app {
            background: #fff;
        }
        body {
            background: #fff;
            display: unset;
        }
        .m-12, .m-32
        {
            margin: 0 !important;
        }
      `}</style>
    </>
  );
};

export default ProductDetailed;
