import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../../types";
import { useProductFilter } from "../../hooks/useProductFilter";
import { SkeletonProductGrid } from "../../components/Skeleton";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else if (currentPage <= 2) {
    pages.push(0, 1, 2, "...", totalPages - 1);
  } else if (currentPage >= totalPages - 3) {
    pages.push(0, "...", totalPages - 3, totalPages - 2, totalPages - 1);
  } else {
    pages.push(
      0,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages - 1,
    );
  }

  return (
    <ul className="pagination-list">
      <li className={`pagination-item ${currentPage === 0 ? "disabled" : ""}`}>
        <button
          onClick={() => currentPage > 0 && onPageChange(currentPage - 1)}
        >
          &laquo;
        </button>
      </li>
      {pages.map((p, idx) => (
        <li
          key={idx}
          className={`pagination-item ${p === currentPage ? "active" : ""} ${p === "..." ? "disabled" : ""}`}
        >
          {typeof p === "number" ? (
            <button onClick={() => onPageChange(p)}>{p + 1}</button>
          ) : (
            <span>...</span>
          )}
        </li>
      ))}
      <li
        className={`pagination-item ${currentPage >= totalPages - 1 ? "disabled" : ""}`}
      >
        <button
          onClick={() =>
            currentPage < totalPages - 1 && onPageChange(currentPage + 1)
          }
        >
          &raquo;
        </button>
      </li>
    </ul>
  );
};

interface ProductCardProps {
  product: Product;
  formatPrice: (price: number) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product: p,
  formatPrice,
}) => (
  <Link
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
        {(p.soldQuantity ?? 0) > 0 && <p>{p.soldQuantity} đã bán</p>}
      </div>
    </div>
  </Link>
);

const Containers: React.FC = () => {
  const {
    products,
    pageData,
    goldTypes,
    loading,
    categoryInfo,
    selectedGoldType,
    selectedPriceRange,
    selectedSort,
    sortDir,
    isFilterPanelOpen,
    isSortPanelOpen,
    setIsFilterPanelOpen,
    setIsSortPanelOpen,
    setSelectedGoldType,
    setSelectedPriceRange,
    handleSortChange,
    handleReset,
    loadProducts,
    formatPrice,
  } = useProductFilter();

  const sortValue = selectedSort === "price" ? `price_${sortDir}` : "newest";

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
                  value={sortValue}
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

        {/* Overlay (mobile) */}
        {(isFilterPanelOpen || isSortPanelOpen) && (
          <div
            className="overlay active"
            onClick={() => {
              setIsFilterPanelOpen(false);
              setIsSortPanelOpen(false);
            }}
          />
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
              {(["newest", "price_desc", "price_asc"] as const).map((mode) => (
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
              onClick={() => handleSortChange("newest")}
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
            <SkeletonProductGrid />
          ) : products.length > 0 ? (
            products.map((p) => (
              <ProductCard key={p.id} product={p} formatPrice={formatPrice} />
            ))
          ) : (
            <div className="no-products w-full text-center py-20">
              <p>Không tìm thấy sản phẩm nào phù hợp.</p>
            </div>
          )}
        </div>

        {/* Phân trang */}
        {pageData && (
          <nav className="pagination-wrapper" aria-label="Page navigation">
            <Pagination
              currentPage={pageData.number}
              totalPages={pageData.totalPages}
              onPageChange={loadProducts}
            />
          </nav>
        )}
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
        #footer { background: #fff;}
      `}</style>
    </div>
  );
};

export default Containers;
