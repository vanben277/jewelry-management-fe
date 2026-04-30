import React from "react";

const BannerCarousel: React.FC = () => {
  return (
    <div
      id="carouselExample"
      className="carousel slide"
      data-bs-ride="carousel"
      data-bs-interval="5000"
    >
      <div className="carousel-inner">
        {[
          "https://cdn.pnj.io/images/promo/292/tabsale-t4-26-1972x640CTA.jpg",
          "https://cdn.pnj.io/images/promo/271/tabsale-t10-25-1972x640CTA.jpg",
          "https://cdn.pnj.io/images/promo/270/pnvn-2010-25-1972X640-CTA.png",
          "https://cdn.pnj.io/images/promo/240/egift-t3-25-1972x640CTA.jpg",
          "https://cdn.pnj.io/images/promo/264/PNJ_fast_2025-_banner-1972x640-CTA.png",
        ].map((url, index) => (
          <div
            key={index}
            className={`carousel-item ${index === 0 ? "active" : ""}`}
          >
            <img
              src={url}
              className="d-block w-100"
              alt={`Banner ${index + 1}`}
            />
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default BannerCarousel;
