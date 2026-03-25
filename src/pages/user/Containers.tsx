import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { productApi } from "../../apis";
import { Product, PageResponse } from "../../types";

const Containers: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [pageData, setPageData] = useState<PageResponse<Product> | null>(null);
  const [goldTypes, setGoldTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // States cho Filter (Đồng bộ với URL)
  const [selectedGoldType, setSelectedGoldType] = useState(
    searchParams.get("goldType") || "",
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState(
    searchParams.get("priceRange") || "",
  );
  const [selectedSort, setSelectedSort] = useState(
    searchParams.get("sort") || "dateOfEntry",
  );
  const [sortDir, setSortDir] = useState(searchParams.get("dir") || "desc");

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false);

  const [categoryInfo, setCategoryInfo] = useState({
    name: "Sản phẩm",
    bannerUrl: "https://cdn.pnj.io/images/promo/235/1200x450-nhan-t01-25.jpg",
  });

  // --- 1. Lấy dữ liệu ban đầu ---
  useEffect(() => {
    productApi
      .getGoldTypes()
      .then((res) => {
        if (res.data) setGoldTypes(res.data);
      })
      .catch(() => console.error("Lỗi tải loại vàng"));

    const savedCat = localStorage.getItem("selectedCategory");
    if (savedCat) {
      const parsed = JSON.parse(savedCat);
      setCategoryInfo({
        name: parsed.name || "Sản phẩm",
        bannerUrl:
          parsed.bannerUrl ||
          "https://cdn.pnj.io/images/promo/235/1200x450-nhan-t01-25.jpg",
      });
    }
  }, [searchParams.get("category")]);

  // --- 2. Hàm Load sản phẩm ---
  const loadProducts = useCallback(
    async (pageNumber = 0) => {
      setLoading(true);
      const categoryId = searchParams.get("category") || "1";
      const searchQuery = searchParams.get("search") || "";

      try {
        const params: any = {
          pageNumber,
          pageSize: 12,
          name: searchQuery || undefined,
          goldType: selectedGoldType || undefined,
          sortBy: selectedSort,
          sortDirection: sortDir,
        };

        if (selectedPriceRange && selectedPriceRange.includes("-")) {
          const [from, to] = selectedPriceRange.split("-");
          params.fromPrice = from;
          if (to !== "999999999") params.toPrice = to;
        }

        let res;
        if (searchQuery && !searchParams.get("category")) {
          res = await productApi.search(searchQuery, pageNumber, 12);
        } else {
          res = await productApi.getByCategory(Number(categoryId), params);
        }

        if (res.data) {
          setProducts(res.data.content || []);
          setPageData(res.data);
        }
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        toast.error("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    },
    [searchParams, selectedGoldType, selectedPriceRange, selectedSort, sortDir],
  );

  // --- 3. Tự động gọi lại khi Filter thay đổi ---
  useEffect(() => {
    loadProducts(0);

    const newParams = new URLSearchParams(searchParams);
    if (selectedGoldType) newParams.set("goldType", selectedGoldType);
    else newParams.delete("goldType");
    if (selectedPriceRange) newParams.set("priceRange", selectedPriceRange);
    else newParams.delete("priceRange");
    newParams.set("sort", selectedSort);
    newParams.set("dir", sortDir);
    setSearchParams(newParams, { replace: true });
  }, [
    selectedGoldType,
    selectedPriceRange,
    selectedSort,
    sortDir,
    searchParams.get("category"),
    searchParams.get("search"),
  ]);

  // --- 4. Logic Phân trang ---
  const renderPagination = () => {
    if (!pageData || pageData.totalPages <= 1) return null;
    const current = pageData.number;
    const total = pageData.totalPages;
    const pages: (number | string)[] = [];

    if (total <= 5) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      if (current <= 2) pages.push(0, 1, 2, "...", total - 1);
      else if (current >= total - 3)
        pages.push(0, "...", total - 3, total - 2, total - 1);
      else
        pages.push(
          0,
          "...",
          current - 1,
          current,
          current + 1,
          "...",
          total - 1,
        );
    }

    return (
      <ul className="pagination-list">
        <li className={`pagination-item ${current === 0 ? "disabled" : ""}`}>
          <button onClick={() => current > 0 && loadProducts(current - 1)}>
            &laquo;
          </button>
        </li>
        {pages.map((p, idx) => (
          <li
            key={idx}
            className={`pagination-item ${p === current ? "active" : ""} ${p === "..." ? "disabled" : ""}`}
          >
            {typeof p === "number" ? (
              <button onClick={() => loadProducts(p)}>{p + 1}</button>
            ) : (
              <span>...</span>
            )}
          </li>
        ))}
        <li
          className={`pagination-item ${current >= total - 1 ? "disabled" : ""}`}
        >
          <button
            onClick={() => current < total - 1 && loadProducts(current + 1)}
          >
            &raquo;
          </button>
        </li>
      </ul>
    );
  };

  // --- 5. Handlers ---
  const handleSortChange = (val: string) => {
    if (val === "newest") {
      setSelectedSort("dateOfEntry");
      setSortDir("desc");
    } else if (val === "price_desc") {
      setSelectedSort("price");
      setSortDir("desc");
    } else if (val === "price_asc") {
      setSelectedSort("price");
      setSortDir("asc");
    }
  };

  const handleReset = () => {
    setSelectedGoldType("");
    setSelectedPriceRange("");
    setSelectedSort("dateOfEntry");
    setSortDir("desc");
    setSearchParams({ category: searchParams.get("category") || "1" });
    setIsFilterPanelOpen(false);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "đ";

  return (
    <div className="app">
      {/* Banner & Breadcrumb */}
      <div className="grid wide banner">
        <div className="row">
          <div className="block-back">
            <Link to="/" className="back-link">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="!ml-0 current-link"> {categoryInfo.name} </span>
          </div>
          <img
            src={categoryInfo.bannerUrl}
            width="100%"
            alt="Banner"
            className="bannerUrl"
          />
        </div>
      </div>

      <div className="grid wide container-item">
        <div className="row">
          {/* Mobile Filter Buttons */}
          <div className="mobile-filter-buttons">
            <button
              className="mobile-filter-btn"
              onClick={() => setIsFilterPanelOpen(true)}
            >
              <i className="fas fa-filter"></i> Bộ lọc
            </button>
            <button
              className="mobile-filter-btn"
              onClick={() => setIsSortPanelOpen(true)}
            >
              <i className="fas fa-sort"></i> Sắp xếp
            </button>
          </div>

          {/* Desktop Filter */}
          <div className="desktop-filter">
            <div className="filter">
              <h3 className="filter-title">Bộ lọc</h3>
              <div className="filter-group">
                <select
                  value={selectedGoldType}
                  onChange={(e) => setSelectedGoldType(e.target.value)}
                >
                  <option value="">Tuổi vàng</option>
                  {goldTypes.map((type) => (
                    <option key={type} value={type}>
                      Vàng {type.replace("GOLD_", "")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                >
                  <option value="">Giá</option>
                  <option value="0-1000000">Dưới 1 triệu</option>
                  <option value="1000000-3000000">1 - 3 triệu</option>
                  <option value="3000000-5000000">3 - 5 triệu</option>
                  <option value="5000000-10000000">5 - 10 triệu</option>
                  <option value="10000000-999999999">Trên 10 triệu</option>
                </select>
              </div>
            </div>
            <div className="sort">
              <h3 className="sort-title">Sắp xếp</h3>
              <div className="filter-group">
                <select
                  value={
                    selectedSort === "price" ? `price_${sortDir}` : "newest"
                  }
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="newest">Sản phẩm mới nhất</option>
                  <option value="price_desc">Giá từ cao đến thấp</option>
                  <option value="price_asc">Giá từ thấp đến cao</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {(isFilterPanelOpen || isSortPanelOpen) && (
          <div
            className="overlay active"
            onClick={() => {
              setIsFilterPanelOpen(false);
              setIsSortPanelOpen(false);
            }}
          ></div>
        )}

        {/* Mobile Filter Panel */}
        <div className={`mobile-panel ${isFilterPanelOpen ? "active" : ""}`}>
          <div className="panel-header">
            <h3>Bộ lọc</h3>
            <button
              className="close-btn"
              onClick={() => setIsFilterPanelOpen(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="panel-content">
            <div className="filter-section">
              <label>Tuổi vàng</label>
              <select
                value={selectedGoldType}
                onChange={(e) => setSelectedGoldType(e.target.value)}
              >
                <option value="">Chọn tuổi vàng</option>
                {goldTypes.map((type) => (
                  <option key={type} value={type}>
                    Vàng {type.replace("GOLD_", "")}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-section">
              <label>Giá</label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
              >
                <option value="">Chọn khoảng giá</option>
                <option value="0-1000000">Dưới 1 triệu</option>
                <option value="1000000-3000000">1 - 3 triệu</option>
                <option value="3000000-5000000">3 - 5 triệu</option>
                <option value="5000000-10000000">5 - 10 triệu</option>
                <option value="10000000-999999999">Trên 10 triệu</option>
              </select>
            </div>
          </div>
          <div className="panel-footer">
            <button className="btn-reset" onClick={handleReset}>
              Đặt lại
            </button>
            <button
              className="btn-apply"
              onClick={() => setIsFilterPanelOpen(false)}
            >
              Áp dụng
            </button>
          </div>
        </div>

        {/* Mobile Sort Panel */}
        <div className={`mobile-panel ${isSortPanelOpen ? "active" : ""}`}>
          <div className="panel-header">
            <h3>Sắp xếp</h3>
            <button
              className="close-btn"
              onClick={() => setIsSortPanelOpen(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="panel-content">
            <div className="sort-options">
              {["newest", "price_desc", "price_asc"].map((mode) => (
                <label key={mode} className="sort-option">
                  <input
                    type="radio"
                    name="sort_mobile"
                    value={mode}
                    checked={
                      mode === "newest"
                        ? selectedSort === "dateOfEntry"
                        : mode === "price_desc"
                          ? selectedSort === "price" && sortDir === "desc"
                          : selectedSort === "price" && sortDir === "asc"
                    }
                    onChange={() => handleSortChange(mode)}
                  />
                  <span>
                    {mode === "newest"
                      ? "Sản phẩm mới nhất"
                      : mode === "price_desc"
                        ? "Giá từ cao đến thấp"
                        : "Giá từ thấp đến cao"}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="panel-footer">
            <button
              className="btn-reset"
              onClick={() => {
                setSelectedSort("dateOfEntry");
                setSortDir("desc");
              }}
            >
              Đặt lại
            </button>
            <button
              className="btn-apply"
              onClick={() => setIsSortPanelOpen(false)}
            >
              Áp dụng
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div
          id="container__newitem"
          className="row container__newitem m-16 m-32"
        >
          {loading ? (
            <div className="loading-spinner w-full text-center py-20">
              <i className="fas fa-spinner fa-spin fa-2x"></i>{" "}
              <p>Đang tải...</p>
            </div>
          ) : products.length > 0 ? (
            products.map((p) => (
              <Link
                key={p.id}
                to={`/product-detailed/${p.id}`}
                className="col l-2-9 m-3-9 c-5-9 container__block__new"
              >
                <div className="container__blocknew--item">
                  <div className="container__img">
                    <img
                      src={p.primaryImageUrl || "/img/default-product.jpg"}
                      className="container__imgnew--w"
                      alt={p.name}
                    />
                    <img
                      src={
                        p.images?.find((img) => !img.isPrimary)?.imageUrl ||
                        p.primaryImageUrl
                      }
                      className="container__img--h"
                      alt={p.name}
                    />
                    {p.status === "IN_STOCK" && (
                      <span className="container__rightnew">
                        <img
                          src="https://cdn.pnj.io/images/image-update/tag-product/new-icon-3-w29.svg"
                          alt="New"
                        />
                      </span>
                    )}
                    <div className="container__leftnew">
                      <img
                        src="https://cdn.pnj.io/images/image-update/2022/10/pnjfast/PNJfast-Giaotrong3h.svg"
                        alt="Fast"
                      />
                    </div>
                  </div>
                  <div className="container__namenew">
                    <p>{p.displayName || p.name}</p>
                  </div>
                  <div className="container__pricenew">
                    <p>{formatPrice(p.price)}</p>
                  </div>
                  <div className="container__sales">
                    {(p.soldQuantity ?? 0) > 0 && (
                      <p>{p.soldQuantity} đã bán</p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-products w-full text-center py-20">
              <p>Không tìm thấy sản phẩm nào phù hợp.</p>
            </div>
          )}
        </div>

        {/* Phân trang */}
        <nav className="pagination-wrapper" aria-label="Page navigation">
          {renderPagination()}
        </nav>
      </div>

      <style>{`
        .app { background: #fff; }
        body { background: #fff; display: unset; }
        .m-12, .m-32 { margin: 0 !important; }
        .pagination-list { display: flex; list-style: none; gap: 10px; justify-content: center; padding: 40px 0; }
        .pagination-item button { padding: 8px 16px; border: 1px solid #eee; background: white; cursor: pointer; border-radius: 4px; transition: 0.3s; }
        .pagination-item.active button { background-color: #003468; color: white; border: 1px solid #003468; }
        .pagination-item.disabled { opacity: 0.4; pointer-events: none; }
        .pagination-item button:hover:not(.active) { background-color: #f8f9fa; }
      `}</style>
    </div>
  );
};

export default Containers;
