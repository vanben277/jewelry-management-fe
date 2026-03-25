import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useCart } from "../../context/CartContext";
import { FaDeleteLeft } from "react-icons/fa6";
import ChatBot from "../../components/user/ChatBot";
// 1. Import API và Types tập trung
import { categoryApi, productApi } from "../../apis";
import { Category, Product, Account } from "../../types";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<Account | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const { cart, totalQuantity, totalPrice, removeFromCart } = useCart();

  // ── Search states ────────────────────────────────────────────────────────
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [noResult, setNoResult] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Load categories + user info
  useEffect(() => {
    // Sửa fetch thành categoryApi
    categoryApi
      .getTree()
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch((err) => console.error("Lỗi tải danh mục:", err));

    const loadUser = () => {
      const saved = localStorage.getItem("userInfo");
      setUser(saved ? JSON.parse(saved) : null);
    };

    loadUser();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "userInfo") loadUser();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // 2. Search overlay logic (giữ nguyên)
  useEffect(() => {
    document.body.style.overflow = isSearchOpen ? "hidden" : "auto";
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSearchOpen]);

  const openSearchBox = () => setIsSearchOpen(true);
  const closeSearchBox = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setNoResult(false);
  };

  // Sửa fetch search thành productApi.search
  const searchProducts = async (query: string) => {
    try {
      const res = await productApi.search(query, 0, 5);
      if (res.data && res.data.content.length > 0) {
        setSearchResults(res.data.content);
        setNoResult(false);
      } else {
        setSearchResults([]);
        setNoResult(true);
      }
    } catch {
      setSearchResults([]);
      setNoResult(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 0) searchProducts(q.trim());
    else {
      setSearchResults([]);
      setNoResult(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/containers?search=${encodeURIComponent(searchQuery.trim())}`);
      closeSearchBox();
    }
  };

  // Sửa id từ string sang number cho đồng bộ
  const selectProduct = (productId: number) => {
    navigate(`/product-detailed/${productId}`);
    closeSearchBox();
  };

  // ── Category helpers ─────────────────────────────────────────────────────
  const toggleSubmenu = (catId: number) => {
    setOpenSubmenu(openSubmenu === catId ? null : catId);
  };

  const handleCategoryClick = (cat: Category) => {
    const data = {
      id: cat.id,
      name: cat.name,
      bannerUrl: cat.bannerUrl || "",
    };
    localStorage.setItem("selectedCategory", JSON.stringify(data));
  };

  // ── User helpers ─────────────────────────────────────────────────────────
  const getGreeting = (): string => {
    if (!user) return "Tài khoản của tôi";

    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.userName ||
      "Khách hàng";

    const prefix =
      user.gender === "MALE"
        ? "Chào anh"
        : user.gender === "FEMALE"
          ? "Chào chị"
          : "Chào bạn";

    return `${prefix} ${fullName}`;
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.userName ||
      "Khách hàng"
    : "Tài khoản của tôi";

  const avatarSrc =
    user?.avatar || "https://cdn.pnj.io/images/2023/user-regular.svg";

  // ── Render PC Category Menu ──────────────────────────────────────────────
  const renderPCCategoryMenu = () =>
    categories.map((cat) =>
      cat.children && cat.children.length > 0 ? (
        <li key={cat.id} className="header__narbar--item has-dropdown">
          <span className="header__narbar--link">{cat.name}</span>
          <ul className="header__dropdown">
            {cat.children.map((child) => (
              <li key={child.id}>
                <Link
                  to={`/containers?category=${child.id}`}
                  className="header__narbar--item"
                  onClick={() => handleCategoryClick(child)}
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ) : (
        <li key={cat.id} className="header__narbar--item">
          <Link
            to={`/containers?category=${cat.id}`}
            className="header__narbar--link"
            onClick={() => handleCategoryClick(cat)}
          >
            {cat.name}
          </Link>
        </li>
      ),
    );

  // ── Render Tablet Category Menu ──────────────────────────────────────────
  const renderTabletCategoryMenu = () =>
    categories.map((cat) =>
      cat.children && cat.children.length > 0 ? (
        <li
          key={cat.id}
          className={`navbar__tablet--link has-children ${openSubmenu === cat.id ? "active" : ""}`}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => toggleSubmenu(cat.id)}
          >
            <span>{cat.name}</span>
            <MdKeyboardArrowDown
              style={{
                transition: "transform 0.3s ease",
                transform:
                  openSubmenu === cat.id ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>
          <ul
            className="tablet__submenu"
            style={{
              maxHeight: openSubmenu === cat.id ? "500px" : "0",
              overflow: "hidden",
              transition: "max-height 0.3s ease",
            }}
          >
            {cat.children.map((child) => (
              <li key={child.id}>
                <Link
                  to={`/containers?category=${child.id}`}
                  className="navbar__tablet--link"
                  onClick={() => handleCategoryClick(child)}
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ) : (
        <li key={cat.id}>
          <Link
            to={`/containers?category=${cat.id}`}
            className="navbar__tablet--link"
            onClick={() => handleCategoryClick(cat)}
          >
            {cat.name}
          </Link>
        </li>
      ),
    );

  return (
    <>
      <div id="header" className="header">
        <div className="grid wide">
          {/* TOP NAV */}
          <nav className="row header__nav">
            <div className="l-5 header__nav--div">
              <ul className="header__nav--list">
                <li className="header__nav--item">
                  <Link to="/ir">
                    <img
                      src="https://cdn.pnj.io/images/image-update/layout/icon-relationship-new.svg"
                      width="19"
                      height="14.23"
                      alt=""
                    />
                    Quan hệ cổ đông (IR)
                  </Link>
                </li>
                <li className="header__nav--item">
                  <Link to="/shop">
                    <img
                      src="https://cdn.pnj.io/images/image-update/layout/icon-stores-new.svg"
                      width="19"
                      height="18.97"
                      alt=""
                    />
                    Cửa hàng
                  </Link>
                </li>
                <li className="header__nav--item cursor">
                  <img
                    src="https://cdn.pnj.io/images/image-update/layout/icon-hotline-new.svg"
                    width="19"
                    height="17.94"
                    alt=""
                  />
                  03643986
                </li>
              </ul>
            </div>

            <div className="l-3 m-2 c-3 header__nav--div center">
              <Link to="/">
                <img
                  src="https://cdn.pnj.io/images/logo/pnj.com.vn.png"
                  className="header__logo"
                  alt="Logo"
                />
              </Link>
            </div>

            {/* SEARCH TRIGGER (PC + Mobile) */}
            <div className="m-9 c-8 header__btn" onClick={openSearchBox}>
              <input
                type="text"
                className="header__with--input"
                placeholder="Tìm kiếm nhanh"
                readOnly
              />
              <div className="header__search">
                <IoIosSearch className="header__with--search" />
              </div>
            </div>

            <div className="l-4 m-1 c-1 header__nav--div right">
              <ul className="header__nav--list">
                <li className="header__nav--item">
                  <Link to={user ? "/my-home" : "/login"}>
                    <img
                      src={avatarSrc}
                      className="opacity-50"
                      alt="User avatar"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://cdn.pnj.io/images/2023/user-regular.svg";
                      }}
                    />
                    <span className="ml-1">{getGreeting()}</span>
                  </Link>
                </li>

                {/* Giỏ hàng - giữ nguyên hoặc bạn có thể cải thiện sau */}
                <li className="header__nav--item">
                  <Link to="/cart" className="hidden">
                    <img
                      src="https://cdn.pnj.io/images/image-update/layout/icon-cart-new.svg"
                      alt="Cart Mobile"
                    />
                    <span className="header__nav--icon">{totalQuantity}</span>
                  </Link>

                  <div className="cart__item">
                    <img
                      src="https://cdn.pnj.io/images/image-update/layout/icon-cart-new.svg"
                      alt="Cart PC"
                    />
                    <span>Giỏ hàng</span>
                    <span className="header__nav--icon">{totalQuantity}</span>

                    <div className="cart__h">
                      <h2 className="cart__head">Giỏ hàng của bạn</h2>
                      <div className="cart__list">
                        {cart.length === 0 ? (
                          <div className="p-4 text-center text-[1.4rem] text-gray-500">
                            Giỏ hàng trống
                          </div>
                        ) : (
                          cart.map((item, index) => (
                            <div
                              className="cart__cont"
                              key={`${item.productId}-${index}`}
                            >
                              <div className="cart__img">
                                <img src={item.image} alt={item.name} />
                              </div>
                              <div className="cart__name">
                                <div className="cart__block">
                                  {/* Tên sản phẩm */}
                                  <span className="cart__desc">
                                    {item.name}
                                  </span>
                                  {/* Nút xóa - Giữ đúng class cart__icon của bạn */}
                                  <div
                                    className="cart__icon cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      removeFromCart(index);
                                    }}
                                  >
                                    <FaDeleteLeft />
                                  </div>
                                </div>

                                {/* Size & Chất liệu (Chỉ hiện khi có dữ liệu) */}
                                {(item.size || item.goldType) && (
                                  <div className="cart__size">
                                    {item.size && (
                                      <span className="mr-2">
                                        Size: {item.size}
                                      </span>
                                    )}
                                    {item.goldType && (
                                      <span>Chất liệu: {item.goldType}</span>
                                    )}
                                  </div>
                                )}

                                {/* Dòng số lượng và giá (Căn chỉnh theo ảnh bạn gửi) */}
                                <div className="cart__num">
                                  <span className="text-[1.2rem] text-gray-500">
                                    Số lượng: {item.quantity}
                                  </span>
                                  <div className="cart__price">
                                    {item.price.toLocaleString("vi-VN")} đ
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {cart.length > 0 && (
                        <div className="cart__footer">
                          <div className="cart__total">
                            <span className="cart__total--name">
                              Tổng tiền:
                            </span>
                            <span className="cart__total--price">
                              {totalPrice.toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                          <div className="cart__flink">
                            <Link to="/cart" className="cart__link">
                              Xem giỏ hàng
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </nav>

          {/* MAIN NAVBAR - PC */}
          <div className="row">
            <nav className="header__narbar">
              <ul className="header__narbar--list" id="category-menu">
                {renderPCCategoryMenu()}
              </ul>

              {/* Search button trong navbar PC */}
              <div className="header__btn" onClick={openSearchBox}>
                <input
                  type="text"
                  className="header__with--input"
                  placeholder="Tìm kiếm nhanh"
                  readOnly
                />
                <div className="header__search">
                  <IoIosSearch className="header__with--search" />
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* SEARCH OVERLAY - giữ nguyên code của bạn */}
      {isSearchOpen && (
        <div
          className={`search-overlay ${isSearchOpen ? "active" : ""}`}
          id="searchOverlay"
          onClick={closeSearchBox}
        >
          <div
            className="header__boxsearch"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="header__boxsearch--list">
              <button id="button-search" onClick={handleSearchSubmit}>
                <IoIosSearch />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                className="outline-none"
                placeholder="Tìm kiếm nhanh"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              />
              <button onClick={closeSearchBox}>
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 512 512"
                  height="1em"
                  width="1em"
                >
                  <path
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="32"
                    d="M368 368L144 144m224 0L144 368"
                  />
                </svg>
              </button>
            </div>

            <div className="header__boxsearch--listproduct">
              {searchQuery.length === 0 && (
                <div className="search-suggestions p-4">
                  <p className="text-[12px] font-bold text-gray-500 mb-4 uppercase tracking-wider">
                    Gợi ý tìm kiếm cho bạn
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      "Nhẫn Kim Cương",
                      "Dây chuyền Vàng",
                      "Bông tai",
                      "Vòng tay",
                      "Quà tặng",
                    ].map((text) => (
                      <span
                        key={text}
                        onClick={() => {
                          setSearchQuery(text);
                          searchProducts(text);
                        }}
                        className="px-4 py-2 text-[#4a479d] bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-blue-600 hover:text-[#003868] transition-all"
                      >
                        {text}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 opacity-60">
                    <p className="text-gray-400 text-center text-[14px] italic">
                      Nhập tên sản phẩm để tìm kiếm nhanh...
                    </p>
                  </div>
                </div>
              )}

              {searchQuery.length > 0 &&
                searchResults.length > 0 &&
                searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="header__boxsearch--item"
                    onClick={() => selectProduct(product.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={
                        product.primaryImageUrl ||
                        "https://via.placeholder.com/150"
                      }
                      alt=""
                    />
                    <div className="header__boxsearch--right">
                      <span>{product.displayName || product.name}</span>
                      <div className="header__boxsearch--number">
                        <span>
                          {product.price
                            ? product.price.toLocaleString("vi-VN") + " đ"
                            : "Liên hệ"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              {searchQuery.length > 0 && searchResults.length === 0 && (
                <div className="no__result flex flex-col items-center justify-center w-full">
                  <img
                    src="https://cdn.pnj.io/images/2025/rebuild/a60759ad1dabe909c46a817ecbf71878.png"
                    alt="No result"
                    className="w-48 h-auto mb-4"
                    style={{
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  />
                  <h3 className="text-gray-500">Không tìm thấy kết quả</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABLET / MOBILE BOTTOM NAV */}
      <div id="header_tablet" className="tablet__navbar">
        <div className="grid wide">
          <div className="row">
            <div className="tablet__navbar--list">
              <Link to="/" className="tablet__navbar--item">
                <div className="icon">
                  <img
                    src="https://cdn.pnj.io/images/image-update/layout/mobile/home-default.svg"
                    alt=""
                  />
                </div>
                <div className="name">
                  <p>Trang chủ</p>
                </div>
              </Link>

              <Link to="/promotion" className="tablet__navbar--item">
                <div className="icon">
                  <img
                    src="https://cdn.pnj.io/images/image-update/layout/mobile/tabsale-default.svg"
                    alt=""
                  />
                </div>
                <div className="name">
                  <p>Khuyến mãi</p>
                </div>
              </Link>

              <Link
                to={user ? "/my-home" : "/login"}
                className="tablet__navbar--item"
              >
                <div className="icon flex items-center justify-center w-[24px]">
                  <img
                    src="https://cdn.pnj.io/images/image-update/layout/mobile/ME-default.svg"
                    className="w-[24px]"
                    alt="User"
                  />
                </div>
                <div className="name">
                  <p>{displayName}</p>
                </div>
              </Link>

              <div className="tablet__navbar--item">
                <label htmlFor="nav__input" className="icon">
                  <img
                    src="https://cdn.pnj.io/images/image-update/layout/mobile/danhmuc-default.svg"
                    alt=""
                  />
                </label>
                <div className="name">
                  <p>Danh mục</p>
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              hidden
              className="nav__inputs"
              id="nav__input"
            />
            <label htmlFor="nav__input" className="navbar__overlay"></label>

            <nav className="navbar__tablet">
              <label htmlFor="nav__input" className="narbar__tablet--close">
                <i className="fa-solid fa-xmark"></i>
              </label>
              <ul className="navbar__tablet--list" id="tablet-category-menu">
                {renderTabletCategoryMenu()}

                {/* Mục tĩnh */}
                <li>
                  <Link to="/blog" className="navbar__tablet--link">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/exception" className="navbar__tablet--link color">
                    Khuyến mãi
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="navbar__tablet--link">
                    Hệ thống cửa hàng
                  </Link>
                </li>
                <li>
                  <Link to="/ir" className="navbar__tablet--link">
                    Quan hệ cổ đông (IR)
                  </Link>
                </li>
                <li>
                  <Link to="/exception" className="navbar__tablet--link">
                    Lịch sử đơn hàng
                  </Link>
                </li>
                <li className="navbar__tablet--link cursor">
                  Hotline: 0748187 (Miễn phí)
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <ChatBot />
      <style>{`
       ul {
        padding-left: 0;
       }
      `}</style>
    </>
  );
};

export default Header;
