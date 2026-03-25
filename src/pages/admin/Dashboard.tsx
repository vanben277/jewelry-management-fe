import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { MdWarehouse } from "react-icons/md";
import { FaCartShopping } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa6";
import { BiSolidBank } from "react-icons/bi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { orderApi } from "../../apis";

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // --- STATES ---
  const [metrics, setMetrics] = useState({
    moneyMonthly: 0,
    orderMonthly: 0,
    productMonthly: 0,
    productInventory: 0,
  });

  const [chartData, setChartData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgRevenue, setAvgRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- LOGIC 1: LOAD THỐNG KÊ 4 THẺ ---
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const result = await orderApi.getMonthlyRevenue();
        setMetrics({
          moneyMonthly: result.data.totalMoneyMonthly,
          orderMonthly: result.data.totalOrderMonthly,
          productMonthly: result.data.totalProductMonthly,
          productInventory: result.data.totalInventory,
        });
      } catch (err: any) {
        if (err.response?.data) {
          handleApiError(err.response.data);
        } else {
          toast.error("Không thể kết nối tới máy chủ thống kê");
        }
      }
    };
    loadMetrics();
  }, []);

  // --- LOGIC 2: LOAD DỮ LIỆU BIỂU ĐỒ THEO NĂM ---
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const result = await orderApi.getMonthlyData(selectedYear, true);
        const apiData = result.data;
        setChartData({
          labels: apiData.map((item: any) => item.month),
          datasets: [
            {
              label: "Doanh thu (triệu VND)",
              data: apiData.map((item: any) => item.revenue),
              backgroundColor: "rgba(94, 114, 228, 0.8)",
              borderRadius: 8,
            },
          ],
        });

        // Tính tổng và trung bình doanh thu
        const total = apiData.reduce(
          (sum: number, item: any) => sum + (item.revenue || 0),
          0,
        );
        setTotalRevenue(total);
        setAvgRevenue(total / (apiData.length || 1));
      } catch (error) {
        console.error("Lỗi biểu đồ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [selectedYear]);

  // --- XỬ LÝ LỖI API ---
  const handleApiError = (result: any) => {
    const errorMap: Record<string, string> = {
      "400022": "Tài khoản bị vô hiệu hóa!",
      "400023": "Tài khoản bị khóa!",
      "400024": "Chưa xác thực email!",
    };
    const msg = errorMap[result.errorCode] || "Lỗi truy cập dữ liệu";
    toast.error(msg);
    if (["400022", "400023", "400024"].includes(result.errorCode)) {
      navigate("/exception?code=403");
    }
  };

  // --- CẤU HÌNH CHART OPTIONS (Y HỆT BẢN CŨ) ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            `Doanh thu: ${context.parsed.y.toLocaleString("vi-VN")} triệu VND`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.1)", drawBorder: false },
        ticks: {
          color: "#8392ab",
          font: { size: 11 },
          callback: (value: any) => value + "M",
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#8392ab", font: { size: 11 } },
      },
    },
  };

  // --- DỮ LIỆU RENDER CARD ---
  const cards = [
    {
      label: "Tiền tháng",
      val: metrics.moneyMonthly.toLocaleString() + " VND",
      icon: BiSolidBank,
      link: "/admin/orders",
    },
    {
      label: "Đơn hàng tháng",
      val: metrics.orderMonthly,
      icon: FaBoxOpen,
      link: "/admin/orders",
    },
    {
      label: "Sản phẩm đã bán",
      val: metrics.productMonthly,
      icon: FaCartShopping,
      link: "/admin/orders",
    },
    {
      label: "Sản phẩm tồn kho",
      val: metrics.productInventory,
      icon: MdWarehouse,
      link: "/admin/products",
    },
  ];

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl font-bold text-[#1a237e]">
          Đang tải dữ liệu báo cáo...
        </div>
      </div>
    );

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Header Title */}
        <div className="ms-3 mb-3 mt-4">
          <h3 className="mb-0 h4 font-weight-bolder text-dark !text-[2.4rem]">
            Bảng điều khiển
          </h3>
          <p className="text-[16px] text-muted">
            Kiểm tra doanh số và giá trị tăng trưởng.
          </p>
        </div>

        {/* 4 Statistical Cards */}
        {cards.map((card, i) => (
          <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4" key={i}>
            <Link
              to={card.link}
              className="card text-decoration-none border-0 shadow-sm"
            >
              <div className="card-header p-3 bdr-12 bg-white">
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="text-[14px] mb-0 text-capitalize text-muted">
                      {card.label}
                    </p>
                    <h4 className="mb-0 text-[16px] text-dark font-weight-bolder">
                      {card.val}
                    </h4>
                  </div>
                  <div className="icon-sm icon-shape bg-gradient-dark shadow-dark text-center border-radius-lg flex items-center justify-center">
                    <card.icon className="text-white text-[18px]" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* Chart Section */}
        <div className="col-lg-12 col-md-12 mt-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 font-weight-bold text-[14px]">
                    Doanh thu theo tháng
                  </h6>
                  <p className="text-[14px] text-muted mb-0">
                    Hiệu suất năm {selectedYear}
                  </p>
                </div>
                <select
                  className="form-select w-auto border-radius-md !border-[#ddd] !border-[1px] !border-solid min-w-[7rem]"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              <div className="pe-2 mt-4" style={{ height: "360px" }}>
                {chartData && <Bar data={chartData} options={chartOptions} />}
              </div>

              <hr
                className="my-4"
                style={{ border: "0", borderTop: "1px solid #eee" }}
              />

              <div className="d-flex gap-5 mt-2">
                <p className="text-[14px] text-muted mb-0">
                  Tổng doanh thu:{" "}
                  <span className="font-weight-bolder text-dark ml-1">
                    {totalRevenue.toFixed(1)}M VND
                  </span>
                </p>
                <p className="text-[14px] text-muted mb-0">
                  Trung bình:{" "}
                  <span className="font-weight-bolder text-dark ml-1">
                    {Math.round(avgRevenue)}M VND
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        p { margin: 0; }
        .bdr-12 { border-radius: 12px; }
        .icon-shape img { max-width: 100%; filter: brightness(0) invert(1); }
        .card { transition: all 0.25s ease-in-out; border-radius: 1rem; }
        .card:hover { transform: translateY(-7px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
        .bg-gradient-dark { background: linear-gradient(195deg, #42424a 0%, #191919 100%); }
        .shadow-dark { box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(64, 64, 64, 0.4); }
        .form-select option {
          background: unset;
          color: #737373;
        }
        @media (min-width: 1199.98px) {
          
          /* Đảm bảo Sidenav luôn hiện trên PC */
          .sidenav {
            transform: translateX(0) !important;
            visibility: visible !important;
          }
        }

        @media (max-width: 1199.98px) {
          #sidenav-main {
            position: absolute;
            margin: 8px 0 8px 8px;
          }
        }

        .g-sidenav-pinned .sidenav {
          transform: translateX(0) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
