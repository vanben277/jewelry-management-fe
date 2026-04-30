import React from "react";
import { Link } from "react-router-dom";

const brands = [
  {
    img: "https://cdn.pnj.io/images/promo/284/style-t1-26-Artboard3.jpg",
    logo: "https://cdn.pnj.io/images/image-update/2021/tab-sale-v2/style-logo_1.svg",
    alt: "Style Lucky Me",
  },
  {
    img: "https://cdn.pnj.io/images/promo/283/banner_web-1x1_disney.jpg",
    logo: "https://cdn.pnj.io/images/image-update/2021/tab-sale-v2/pnj disney-01.png",
    alt: "Disney",
  },
  {
    img: "https://cdn.pnj.io/images/promo/283/Princess-Eng-ver.jpg",
    logo: "https://cdn.pnj.io/images/image-update/2021/tab-sale-v2/pnj-watch_1.svg",
    alt: "PNJ Watch",
  },
  {
    img: "https://cdn.pnj.io/images/promo/222/1200x1200_Sandrio.jpg",
    logo: "https://cdn.pnj.io/images/2023/04/hello-kitty/sanrio1.svg",
    alt: "Sanrio",
  },
];

const BrandSliders: React.FC = () => {
  return (
    <>
      {/* Desktop Slider */}
      <div className="grid wide hidden__mobile">
        <div id="slider" className="slider__img m-16 m-32">
          <div className="content__title">
            <h2>Thương hiệu nổi bật</h2>
          </div>
          <div className="slider__container">
            <div className="slider__box" id="desktopSlider">
              {brands.map((item, index) => (
                <Link
                  key={index}
                  to="/containers"
                  className="slider__box--item"
                >
                  <img
                    src={item.img}
                    className="slider__box--img"
                    alt={item.alt}
                  />
                  <div className="banner__shortcut">
                    <p className="banner__shortcut--item">
                      <img src={item.logo} alt="logo" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slider */}
      <div id="slider" className="sliderMobile__img hidden__table__pc">
        <div className="content__title">
          <h2>Thương hiệu nổi bật</h2>
        </div>
        <div className="sliderMobile__container">
          <div className="sliderMobile__box" id="mobileSlider">
            {brands.map((item, index) => (
              <Link
                key={index}
                to="/containers"
                className="sliderMobile__box--item"
              >
                <img
                  src={item.img}
                  className="sliderMobile__box--img"
                  alt={item.alt}
                />
                <div className="bannerMobile__shortcut">
                  <div className="bannerMobile__shortcut--item">
                    <img src={item.logo} alt="logo" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandSliders;
