import React from "react";

const BrandIntro: React.FC = () => {
  const commitments = [
    {
      img: "https://cdn.pnj.io/images/image-update/2020/key_points/icon-circle-tragop.svg",
      name: "Trả góp 0% lãi suất",
      desc: "Áp dụng dễ dàng qua thẻ tín dụng của hơn 20 ngân hàng",
    },
    {
      img: "https://cdn.pnj.io/images/image-update/2022/10/pnjfast/PNJfast-Giaotrong3h-circleicon.svg",
      name: "Giao hàng 3h",
      desc: "Sở hữu ngay món trang sức yêu thích chỉ trong vòng 3 giờ",
    },
    {
      img: "https://cdn.pnj.io/images/image-update/2020/key_points/icon-circle-nbv.svg",
      name: "Người bạn vàng",
      desc: "Giải pháp tài chính cầm đồ; thu mua kim cương, túi hiệu và đồng hồ cơ",
    },
  ];

  return (
    <div className="footer__shop m-16 m-32">
      <div className="footer__imgitem">
        <img src="/img/xem-dia-chi-he-thong.png" alt="Map" />
      </div>
      <div className="footer__video">
        <video
          className="video"
          controls
          style={{ width: "100%", height: "100%" }}
        >
          <source
            src="https://cdn.pnj.io/images/2024/16x9_35s_BrandFilm.mp4"
            type="video/mp4"
          />
        </video>
      </div>
      <div className="footer__cotact">
        <div className="footer__header">
          <h1>Tại sao nên chọn pnj ?</h1>
        </div>
        <div className="footer__blist">
          {commitments.map((item, index) => (
            <div key={index} className="footer__bitem">
              <div className="footer__bitem--img">
                <img src={item.img} alt={item.name} />
              </div>
              <div className="footer__bitem--name">
                <span>{item.name}</span>
              </div>
              <div className="footer__bitem--desc">
                <span>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandIntro;
