import React from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa6";
import { GoHome } from "react-icons/go";

const Benefits: React.FC = () => {
  return (
    <div className="app bg-[#f8fafc] min-h-screen">
      <div className="order-modern max-w-[480px] w-[480px] mx-auto bg-white pt-6 px-[18px] pb-3 min-h-screen max-[739px]:max-w-[99vw] max-[739px]:px-[2vw] max-[739px]:py-2 max-[739px]:m-0 max-[739px]:rounded-none">
        {/* Header */}
        <div className="order-header flex items-center justify-between gap-[10px] text-[1.4rem] !border-b-0 mb-[18px] max-[739px]:mb-0 max-[739px]:py-[14px]">
          <Link
            to="/my-home"
            className="order-left flex items-center no-underline"
          >
            <div className="order-back text-[#212121] text-[1.4rem] mr-1.5">
              <FaChevronLeft />
            </div>
            <span className="order-title font-medium text-[#212121] !mb-0 !text-[1.4rem]">
              Mã giảm giá
            </span>
          </Link>

          <Link
            to="/my-home"
            className="order-right flex items-center justify-center rounded-full bg-[#f6f7f8] w-5 h-5 no-underline"
          >
            <div className="h-6 bg-[rgba(145,158,171,0.08)] rounded-full overflow-hidden flex items-center justify-center max-[739px]:scale-125">
              <GoHome />
            </div>
          </Link>
        </div>

        {/* Content List */}
        <div className="order-list mt-0">
          <div className="order-no-card flex justify-center items-center h-full mt-[88px] text-[1.4rem] color-[#637381] text-center ml-0">
            <p className="text-[1.4rem]">Không có mã giảm giá nào</p>
          </div>
        </div>
      </div>

      <style>{`
        .order-title {
            font-family: 'Roboto', sans-serif;
        }
        .order-no-card p {
            color: #637381;
        }
      `}</style>
    </div>
  );
};

export default Benefits;
