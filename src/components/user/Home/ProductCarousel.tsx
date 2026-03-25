import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

interface Product {
  id?: number;
  productId?: number;
  displayName?: string;
  name?: string;
  price: number;
  primaryImageUrl?: string;
  images?: { imageUrl: string; isPrimary: boolean }[];
  soldQuantity?: number;
  totalQuantitySold?: number;
}

const ProductCarousel: React.FC<{ products: Product[] }> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(4);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchMoved = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragMoved = useRef(0);

  const cloned = [
    ...products.slice(-itemsPerView),
    ...products,
    ...products.slice(0, itemsPerView),
  ];
  const realStart = itemsPerView;

  useEffect(() => {
    setCurrentIndex(realStart);
  }, [products, itemsPerView]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w <= 768) setItemsPerView(2);
      else if (w <= 1024) setItemsPerView(2);
      else setItemsPerView(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stopAuto = useCallback(() => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);
  }, [stopAuto]);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
  }, [startAuto, stopAuto]);

  // Xử lý infinite loop sau transition
  useEffect(() => {
    if (isTransitioning) return;
    if (currentIndex >= products.length + realStart) {
      setTimeout(() => setCurrentIndex(realStart), 0);
    }
    if (currentIndex < realStart) {
      setTimeout(
        () => setCurrentIndex(products.length + realStart - itemsPerView),
        0,
      );
    }
  }, [currentIndex, isTransitioning]);

  const next = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const translateX = -(currentIndex * (100 / itemsPerView));

  return (
    <div
      className="carousel-container"
      style={{ position: "relative", overflow: "hidden" }}
      onMouseEnter={stopAuto}
      onMouseLeave={startAuto}
      // Touch
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        touchMoved.current = 0;
        stopAuto();
      }}
      onTouchMove={(e) => {
        touchMoved.current = e.touches[0].clientX - touchStartX.current;
      }}
      onTouchEnd={() => {
        if (touchMoved.current > 50) prev();
        else if (touchMoved.current < -50) next();
        startAuto();
      }}
      // Mouse drag
      onMouseDown={(e) => {
        isDragging.current = true;
        dragStartX.current = e.pageX;
        dragMoved.current = 0;
        stopAuto();
      }}
      onMouseMove={(e) => {
        if (!isDragging.current) return;
        dragMoved.current = e.pageX - dragStartX.current;
      }}
      onMouseUp={() => {
        if (!isDragging.current) return;
        isDragging.current = false;
        if (dragMoved.current > 50) prev();
        else if (dragMoved.current < -50) next();
        startAuto();
      }}
    >
      <button
        id="prev-btn"
        onClick={() => {
          prev();
          stopAuto();
          setTimeout(startAuto, 1000);
        }}
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: "rgba(0,0,0,0.4)",
          border: "none",
          color: "white",
          width: 36,
          height: 36,
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        ‹
      </button>

      {/* Slide track */}
      <div
        style={{
          display: "flex",
          transform: `translateX(${translateX}%)`,
          transition: isTransitioning ? "transform 0.5s ease" : "none",
          userSelect: "none",
        }}
      >
        {cloned.map((p, idx) => (
          <div
            key={idx}
            style={{
              minWidth: `${100 / itemsPerView}%`,
              padding: "0 8px",
              boxSizing: "border-box",
            }}
            onDragStart={(e) => e.preventDefault()}
          >
            <Link
              to={`/product-detailed/${p.id}`}
              className="container__block"
              style={{ display: "block" }}
            >
              <div className="container__block--item">
                <div className="container__img">
                  <img
                    src={p.primaryImageUrl || "/img/default.jpg"}
                    className="container__img--w"
                    alt="p"
                  />
                  <img
                    src={p.images?.[1]?.imageUrl || p.primaryImageUrl}
                    className="container__img--h"
                    alt="p"
                  />
                  <span className="container__right">
                    <img
                      src="https://cdn.pnj.io/images/image-update/tag-product/new-icon-3-w29.svg"
                      alt="New"
                    />
                  </span>
                </div>
                <div className="container__name">
                  <p>{p.displayName}</p>
                </div>
                <div className="container__price">
                  <p>{new Intl.NumberFormat("vi-VN").format(p.price)}đ</p>
                </div>
                <div className="container__sales">
                  {p.soldQuantity! > 0 && <p>{p.soldQuantity} đã bán</p>}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <button
        id="next-btn"
        onClick={() => {
          next();
          stopAuto();
          setTimeout(startAuto, 1000);
        }}
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: "rgba(0,0,0,0.4)",
          border: "none",
          color: "white",
          width: 36,
          height: 36,
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        ›
      </button>
    </div>
  );
};

export default ProductCarousel;
