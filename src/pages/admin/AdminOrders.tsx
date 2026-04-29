import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaFilter,
  FaPhone,
  FaUser,
  FaCircleInfo,
  FaCircleExclamation,
  FaCartShopping,
  FaXmark,
  FaLocationDot,
} from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { orderApi } from "../../apis";
import { Order } from "../../types";
import { PAGINATION } from '../../constants';

const AdminOrders: React.FC = () => {
  // --- States ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statuses, setStatuses] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    status: "",
    pageSize: PAGINATION.ADMIN_PAGE_SIZE,
    pageNumber: 0,
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 1. Load Data Functions ---
  const fetchStatuses = useCallback(async () => {
    try {
      const data = await orderApi.getStatuses();
      setStatuses(data.data || []);
    } catch (e) {
      console.error("Lỗi tải trạng thái");
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderApi.filter({
        customerName: filters.customerName || undefined,
        customerPhone: filters.customerPhone || undefined,
        status: filters.status || undefined,
        pageSize: filters.pageSize,
        pageNumber: filters.pageNumber,
      });
      setOrders(data.data.content || []);
      setTotalPages(data.data.totalPages || 0);
      setTotalElements(data.data.totalElements || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStatuses();
    loadOrders();
  }, [loadOrders, fetchStatuses]);

  // --- 2. Logic Update Status ---
  const handleStatusChange = async (
    orderId: number,
    newStatus: string,
    currentStatus: string,
  ) => {
    if (newStatus === currentStatus) return;

    if (
      window.confirm(`Xác nhận chuyển đơn hàng #${orderId} sang ${newStatus}?`)
    ) {
      try {
        await orderApi.updateStatus(orderId, newStatus);
        toast.success("Cập nhật trạng thái thành công!");
        loadOrders();
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || "Cập nhật thất bại");
      }
    }
  };

  // Logic chặn trạng thái (Giữ đúng từ bản gốc của bạn)
  const getValidStatusOptions = (current: string) => {
    switch (current) {
      case "PENDING":
        return ["PENDING", "CONFIRMED", "CANCELLED"];
      case "CONFIRMED":
        return ["CONFIRMED", "SHIPPED", "CANCELLED"];
      case "SHIPPED":
        return ["SHIPPED", "DELIVERED"];
      case "DELIVERED":
      case "CANCELLED":
        return [current];
      default:
        return [current];
    }
  };

  // --- 3. Modal Chi tiết ---
  const openDetailModal = async (orderId: number) => {
    try {
      const data = await orderApi.getById(orderId);
      if (data.data) {
        setSelectedOrder(data.data);
        setIsModalOpen(true);
      }
    } catch (e: any) {
      toast.error(
        e.response?.data?.errorMessage || "Không thể tải chi tiết đơn hàng",
      );
    }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("vi-VN").format(p) + "đ";
  const formatDate = (d: string | null | undefined) => {
    if (!d) return "N/A";
    return d.replace("T", " ").substring(0, 16);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* HEADER */}
        <div className="ms-3 mb-3 mt-4">
          <h3 className="mb-0 h4 font-weight-bolder text-dark !text-[2.4rem]">
            Danh sách đơn hàng
          </h3>
          <p className="text-[16px] text-muted">
            Quản lý và cập nhật tiến độ giao hàng cho khách.
          </p>
        </div>

        {/* FILTERS */}
        <div className="col-12 mt-4">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="mb-3 font-weight-bold text-[1.4rem] text-[#737373] flex items-center">
              <FaFilter className="me-2" /> Tìm kiếm và lọc đơn hàng
            </h6>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="text-[1.4rem] flex items-center text-[#737373] font-medium">
                  <FaPhone className="me-1" /> Số điện thoại
                </label>
                <input
                  type="text"
                  className="form-control h-[40px] text-[1.6rem]"
                  placeholder="Nhập SĐT..."
                  value={filters.customerPhone}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      customerPhone: e.target.value,
                      pageNumber: 0,
                    })
                  }
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="text-[1.4rem] flex items-center text-[#737373] font-medium">
                  <FaUser className="me-1" /> Tên khách hàng
                </label>
                <input
                  type="text"
                  className="form-control h-[40px] text-[1.6rem]"
                  placeholder="Nhập tên..."
                  value={filters.customerName}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      customerName: e.target.value,
                      pageNumber: 0,
                    })
                  }
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="text-[1.4rem] flex items-center text-[#737373] font-medium">
                  <FaLocationDot className="me-1" /> Địa chỉ
                </label>
                <input
                  type="text"
                  className="form-control h-[40px] text-[1.6rem]"
                  placeholder="Nhập địa chỉ..."
                  value={filters.customerAddress}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      customerAddress: e.target.value,
                      pageNumber: 0,
                    })
                  }
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="text-[1.4rem] flex items-center text-[#737373] font-medium">
                  <FaCircleInfo className="me-1" /> Trạng thái
                </label>
                <select
                  className="form-select h-[40px] text-[1.6rem] !border-solid !border-[1px] !border-[#ddd]"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value,
                      pageNumber: 0,
                    })
                  }
                >
                  <option value="">Tất cả</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="col-12 mt-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
              <div className="bg-gradient-dark shadow-dark border-radius-lg pt-4 pb-3 d-flex justify-content-between align-items-center px-3">
                <h6 className="text-white text-capitalize text-[1.6rem]">
                  Danh sách đơn hàng
                </h6>
              </div>
            </div>
            <div className="card-body px-0 pb-2">
              <div className="table-responsive p-0">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7 ps-4">
                        ID
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        Khách hàng
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        SĐT
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        Trạng thái
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        Tổng tiền
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        Ngày đặt
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7 text-center">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5">
                          Đang tải...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          <FaCircleExclamation className="me-2" />
                          Không tìm thấy đơn hàng
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id}>
                          <td className="ps-4 text-[12px] font-weight-bold">
                            #{o.id}
                          </td>
                          <td className="text-[1.4rem] font-medium">
                            {o.customerName}
                          </td>
                          <td className="text-[1.3rem]">{o.customerPhone}</td>
                          <td>
                            <select
                              className={`form-select form-select-sm !text-[1.2rem] font-weight-bold !border-[#ddd] !border-[1px] !border-solid status-${o.status.toLowerCase()}`}
                              value={o.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  o.id,
                                  e.target.value,
                                  o.status,
                                )
                              }
                            >
                              {getValidStatusOptions(o.status).map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-[1.3rem] font-bold text-dark">
                            {formatPrice(o.totalPrice)}
                          </td>
                          <td className="text-[1.2rem]">
                            {formatDate(o.createAt)}
                          </td>
                          <td className="text-center">
                            <button
                              className="btn-link text-secondary mb-0"
                              onClick={() => openDetailModal(o.id)}
                            >
                              <FaInfoCircle size={18} title="Xem chi tiết" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="col-12 mt-4 d-flex justify-content-between align-items-center px-4 mb-5">
          <div className="text-[1.3rem] flex items-center text-muted">
            <FaInfoCircle className="me-1" /> Hiển thị {orders.length} /{" "}
            {totalElements} đơn hàng
          </div>
          <div className="d-flex align-items-center gap-3">
            <select
              className="form-select form-select-sm w-auto min-w-[85px] !bg-white !text-[#737373]"
              value={filters.pageSize}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  pageSize: Number(e.target.value),
                  pageNumber: 0,
                })
              }
            >
              {[10, 25, 50].map((v) => (
                <option key={v} value={v}>
                  Hiện {v}
                </option>
              ))}
            </select>
            <div className="pagination-btns d-flex gap-1">
              <button
                disabled={filters.pageNumber === 0}
                className="btn btn-sm btn-outline-secondary mb-0 !rounded-[50%] !p-[10px]"
                onClick={() =>
                  setFilters({ ...filters, pageNumber: filters.pageNumber - 1 })
                }
              >
                <MdChevronLeft size={20} />
              </button>
              <span className="btn btn-sm btn-dark mb-0 mx-2 !bg-transparent !text-[#737373] ">
                {filters.pageNumber + 1} / {totalPages || 1}
              </span>
              <button
                disabled={filters.pageNumber >= totalPages - 1}
                className="btn btn-sm btn-outline-secondary mb-0 !rounded-[50%] !p-[10px]"
                onClick={() =>
                  setFilters({ ...filters, pageNumber: filters.pageNumber + 1 })
                }
              >
                <MdChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL CHI TIẾT ĐƠN HÀNG --- */}
      {isModalOpen && selectedOrder && (
        <div className="modal-custom-overlay flex items-center justify-center">
          <div className="modal-custom-content animate__animated animate__zoomIn">
            <div className="modal-header d-flex justify-content-between items-center p-4 border-bottom !bg-white">
              <h5 className="!text-[1.8rem] font-bold flex items-center">
                <FaCartShopping className="me-2" />
                Chi tiết đơn hàng #{selectedOrder.id}
              </h5>
              <button
                className="border-0 text-[#737373]"
                onClick={() => setIsModalOpen(false)}
              >
                <FaXmark size={24} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[80vh]">
              <div className="row mb-4">
                <div className="col-md-6">
                  <p className="text-[1.4rem] font-bold text-dark mb-1">
                    Khách hàng:{" "}
                    <span className="font-normal">
                      {selectedOrder.customerName}
                    </span>
                  </p>
                  <p className="text-[1.4rem] font-bold text-dark mb-1">
                    SĐT:{" "}
                    <span className="font-normal">
                      {selectedOrder.customerPhone}
                    </span>
                  </p>
                </div>
                <div className="col-md-6 text-end">
                  <p className="text-[1.4rem] font-bold text-dark mb-1">
                    Ngày đặt:{" "}
                    <span className="font-normal">
                      {formatDate(selectedOrder.createAt)}
                    </span>
                  </p>
                  <p className="text-[1.4rem] font-bold text-dark mb-1">
                    Trạng thái:{" "}
                    <span
                      className={`status-badge status-${selectedOrder.status.toLowerCase()}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                </div>
                <div className="col-12 mt-2">
                  <p className="text-[1.4rem] font-bold text-dark">
                    Địa chỉ:{" "}
                    <span className="font-normal">
                      {selectedOrder.customerAddress}
                    </span>
                  </p>
                </div>
              </div>

              <div className="order-items-list">
                <h6 className="text-[1.5rem] font-bold border-bottom pb-2">
                  Danh sách sản phẩm
                </h6>
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="d-flex align-items-center gap-3 py-3 border-bottom"
                  >
                    <img
                      src={item.image}
                      className="avatar avatar-lg border-radius-lg"
                      alt="product"
                    />
                    <div className="flex-1">
                      <h6 className="text-[1.4rem] mb-0">{item.productName}</h6>
                      <p className="text-[1.2rem] text-muted">
                        Mã: {item.sku} {item.size ? `| Size: ${item.size}` : ""}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-[1.4rem] mb-0 font-bold">
                        {formatPrice(
                          item.price ? item.price * item.quantity : 0,
                        )}
                      </p>
                      <p className="text-[1.2rem] text-muted">
                        x{item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-end mt-4">
                <h4 className="text-[2rem] font-bold text-danger">
                  Tổng thanh toán: {formatPrice(selectedOrder.totalPrice)}
                </h4>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        body { display: block; }
        p { margin: 0; }
        .modal-custom-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; }
        .modal-custom-content { background: white; width: 90%; max-width: 800px; border-radius: 12px; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 1.2rem; font-weight: bold; }
        .status-pending { color: #f39c12; }
        .status-confirmed { color: #3498db; }
        .status-shipped { color: #9b59b6; }
        .status-delivered { color: #2ecc71; }
        .status-cancelled { color: #e74c3c; }
        input.form-control::placeholder {
            color: #737373 !important;
            opacity: 1;
        }
        .form-select option {
            background: unset;
            color: #737373;
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;
