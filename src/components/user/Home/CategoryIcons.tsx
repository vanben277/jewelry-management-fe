import React from "react";
import { Link } from "react-router-dom";

const categories = [
  { title: "Nhẫn Kim cương", img: "223/kim_cuong.png" },
  { title: "Nhẫn Cưới", img: "223/nhan_cuoi.png" },
  { title: "Nhẫn Cầu hôn", img: "223/nhan_cau_hon.png" },
  { title: "Bông tai EZC", img: "223/bong_tai_ecz.png" },
  { title: "Dây chuyền vàng", img: "223/day_chuyen_vang.png" },
  { title: "Đồng hồ Kim cương", img: "223/dong_ho_kim_cuong.png" },
  { title: "Trang sức mới", img: "254/BANNER_AWI_t6_256x256.jpg" },
  {
    title: "Trang sức Cưới",
    img: "249/494359035_701314925707359_6381650686439066502_n.png",
  },
  { title: "Trang sức Nam", img: "223/trang_suc_nam.jpg" },
  { title: "Trang sức May mắn", img: "223/trang_suc_may_man.jpg" },
  { title: "Trang sức Vàng", img: "223/trang_suc_vang.jpg" },
  { title: "Trang sức bạc", img: "223/trang_suc_bac.jpg" },
];

const CategoryIcons: React.FC = () => {
  return (
    <div className="content m-16 m-32">
      <div className="grid wide">
        <div className="content__title">
          <img
            src="https://cdn.pnj.io/images/banner/homepage/banner_tim_gi_theme_gia_dinh_20250619.png"
            alt="Search Banner"
          />
        </div>
        <div className="content__search">
          <ul className="content__search--list">
            {categories.map((item, index) => (
              <li key={index} className="content__search--item">
                <Link
                  to={`/containers?search=${encodeURIComponent(item.title)}`}
                  className="content__search--link"
                >
                  <img
                    src={`https://cdn.pnj.io/images/promo/${item.img}`}
                    className="content--img"
                    alt={item.title}
                  />
                  <span className="content__search--title">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryIcons;
