import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FocusTrap } from "focus-trap-react";
import {
  FaFilter,
  FaPhone,
  FaUserTag,
  FaCircleInfo,
  FaCircleExclamation,
  FaVenusMars,
  FaXmark,
  FaEye,
} from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { accountApi } from "../../apis";
import { Account } from "../../types";
import { PAGINATION } from "../../constants";

const AdminAccounts: React.FC = () => {
  const navigate = useNavigate();

  // --- States ---
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter States
  const [filters, setFilters] = useState({
    phone: "",
    role: "",
    gender: "",
    status: "",
    pageSize: PAGINATION.ADMIN_PAGE_SIZE as number,
    pageNumber: 0,
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingAccount, setViewingAccount] = useState<Account | null>(null);

  // Form Data State (removed - not needed anymore)
  // Options from API
  const [roles, setRoles] = useState<string[]>([]);
  const [genders, setGenders] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  // --- 1. Load Data Functions ---
  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountApi.filter({
        phone: filters.phone || undefined,
        role: filters.role || undefined,
        gender: filters.gender || undefined,
        status: filters.status || undefined,
        pageSize: filters.pageSize,
        pageNumber: filters.pageNumber,
      });
      setAccounts(data.data.content);
      setTotalPages(data.data.totalPages);
      setTotalElements(data.data.totalElements);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else if (error.response?.status === 403) {
        navigate("/exception?code=403");
      } else {
        toast.error(
          error.response?.data?.errorMessage || "Lỗi kết nối máy chủ",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [filters, navigate]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [r, g, s] = await Promise.all([
          accountApi.getRoles(),
          accountApi.getGenders(),
          accountApi.getStatuses(),
        ]);
        setRoles(r.data || []);
        setGenders(g.data || []);
        setStatuses(s.data || []);
      } catch (error) {
        console.error("Lỗi lấy options:", error);
      }
    };
    fetchOptions();
  }, []);

  // --- 2. Inline Updates (Role/Status) ---
  const updateAccountField = async (
    id: number,
    field: "role" | "status",
    value: string,
  ) => {
    try {
      if (field === "role") {
        await accountApi.updateRole(id, value);
      } else {
        await accountApi.updateStatus(id, value);
      }
      toast.success(`Cập nhật ${field} thành công!`);
      loadAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // --- 3. Modal Handlers ---
  const openViewModal = async (id: number) => {
    try {
      const data = await accountApi.getById(id);
      setViewingAccount(data.data);
      setIsModalOpen(true);
    } catch (e: any) {
      toast.error(e.response?.data?.errorMessage || "Không lấy được dữ liệu");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setViewingAccount(null);
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return "Not Login";
    return d.replace("T", " ").substring(0, 16);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* HEADER */}
        <div className="ms-3 mb-3 mt-4">
          <h3 className="mb-0 h4 font-weight-bolder text-dark !text-[2.4rem]">
            Quản lý tài khoản
          </h3>
          <p className="text-[16px] text-muted">
            Xem, tìm kiếm và phân quyền người dùng hệ thống.
          </p>
        </div>

        {/* FILTERS */}
        <div className="col-12 mt-4">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="mb-3 font-weight-bold text-[1.4rem] text-[#737373] flex items-center">
              <FaFilter className="me-2" />
              Tìm kiếm và lọc tài khoản
            </h6>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="text-[1.4rem] flex items-center text-[#737373] font-medium">
                  <FaPhone className="me-1" />
                  Số điện thoại
                </label>
                <input
                  type="text"
                  className="form-control h-[40px] text-[1.6rem] !text-[#737373]"
                  placeholder="Tìm..."
                  value={filters.phone}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      phone: e.target.value,
                      pageNumber: 0,
                    })
                  }
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="text-[1.4rem] flex items-center text-[#737373] font-medium">
                  <FaUserTag className="me-1" />
                  Vai trò
                </label>
                <select
                  className="form-select h-[40px] text-[1.6rem]"
                  value={filters.role}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      role: e.target.value,
                      pageNumber: 0,
                    })
                  }
                >
                  <option value="">Tất cả</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label className="text-[1.4rem] flex items-center text-[#737373] font-medium">
                  <FaVenusMars className="me-1" />
                  Giới tính
                </label>
                <select
                  className="form-select h-[40px] text-[1.6rem]"
                  value={filters.gender}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      gender: e.target.value,
                      pageNumber: 0,
                    })
                  }
                >
                  <option value="">Tất cả</option>
                  {genders.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label className="text-[1.4rem] flex items-center text-[#737373] font-medium">
                  <FaCircleInfo className="me-1" />
                  Trạng thái
                </label>
                <select
                  className="form-select h-[40px] text-[1.6rem]"
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

        {/* TABLE CARD */}
        <div className="col-12 mt-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
              <div className="bg-gradient-dark shadow-dark border-radius-lg pt-4 pb-3 d-flex justify-content-between align-items-center px-3">
                <h6 className="text-white text-capitalize text-[1.6rem]">
                  Danh sách tài khoản
                </h6>
              </div>
            </div>

            <div className="card-body px-0 pb-2">
              <div className="table-responsive p-0">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        ID
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        Họ Tên
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        SĐT
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        Vai trò
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        Trạng thái
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        Đăng nhập cuối
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
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
                    ) : accounts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          <FaCircleExclamation className="me-2" />
                          Không tìm thấy tài khoản
                        </td>
                      </tr>
                    ) : (
                      accounts.map((a) => (
                        <tr key={a.id}>
                          <td className="ps-4 text-[12px] font-weight-bold">
                            #{a.id}
                          </td>
                          <td>
                            <div className="d-flex px-2 py-1">
                              <img
                                src={a.avatar || "/img/default-avatar.jpg"}
                                className="avatar avatar-sm me-3"
                                alt="user"
                              />
                              <div className="d-flex flex-column justify-content-center">
                                <h6 className="mb-0 text-[1.4rem] font-medium">
                                  {a.firstName} {a.lastName}
                                </h6>
                                <p className="text-[1.3rem] text-secondary mb-0">
                                  {a.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-[1.3rem]">{a.phone || "-"}</td>
                          <td>
                            <select
                              className={`form-select form-select-sm !text-[1.2rem] font-weight-bold ${a.role.toLowerCase()}-role`}
                              value={a.role}
                              onChange={(e) =>
                                updateAccountField(a.id, "role", e.target.value)
                              }
                            >
                              {roles.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              className={`form-select form-select-sm !text-[1.2rem] font-weight-bold ${a.status.toLowerCase()}-status`}
                              value={a.status}
                              onChange={(e) =>
                                updateAccountField(
                                  a.id,
                                  "status",
                                  e.target.value,
                                )
                              }
                            >
                              {statuses.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-[1.2rem]">
                            {formatDate(a.lastLoginAt)}
                          </td>
                          <td>
                            <button
                              className="btn-link text-info mb-0 !ml-[35px]"
                              onClick={() => openViewModal(a.id)}
                              title="Xem chi tiết"
                            >
                              <FaEye size={16} />
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
            <FaInfoCircle className="me-1" />
            Hiển thị {accounts.length} / {totalElements} tài khoản
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
              <span className="btn btn-sm btn-dark mb-0 mx-2 !bg-transparent !text-[#737373]">
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

      {/* --- VIEW MODAL --- */}
      {isModalOpen && viewingAccount && (
        <FocusTrap active={isModalOpen}>
          <div className="modal-custom-overlay flex items-center justify-center">
            <div className="modal-custom-content animate__animated animate__zoomIn">
              <div className="modal-header d-flex justify-content-between p-4 border-bottom !bg-white">
                <h5 className="!text-[1.6rem] font-semibold">
                  Chi tiết tài khoản
                </h5>
                <button
                  className="border-0 text-[#333]"
                  onClick={closeModal}
                >
                  <FaXmark size={24} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[80vh]">
                {/* Avatar */}
                <div className="mb-4 text-center">
                  <img
                    src={viewingAccount.avatar || "/img/default-avatar.jpg"}
                    className="avatar avatar-xxl border-radius-lg shadow mx-auto"
                    alt="avatar"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Info Grid */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">ID</label>
                    <p className="text-[1.4rem] font-medium">
                      #{viewingAccount.id}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">
                      Tên đăng nhập
                    </label>
                    <p className="text-[1.4rem] font-medium">
                      {viewingAccount.userName}
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">Họ</label>
                    <p className="text-[1.4rem] font-medium">
                      {viewingAccount.firstName}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">Tên</label>
                    <p className="text-[1.4rem] font-medium">
                      {viewingAccount.lastName}
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">Email</label>
                    <p className="text-[1.4rem] font-medium">
                      {viewingAccount.email}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">
                      Số điện thoại
                    </label>
                    <p className="text-[1.4rem] font-medium">
                      {viewingAccount.phone || "-"}
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">
                      Ngày sinh
                    </label>
                    <p className="text-[1.4rem] font-medium">
                      {viewingAccount.dateOfBirth || "-"}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">
                      Giới tính
                    </label>
                    <p className="text-[1.4rem] font-medium">
                      {viewingAccount.gender === "MALE"
                        ? "Nam"
                        : viewingAccount.gender === "FEMALE"
                          ? "Nữ"
                          : "Khác"}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-[1.2rem] text-muted">Địa chỉ</label>
                  <p className="text-[1.4rem] font-medium">
                    {viewingAccount.address || "-"}
                  </p>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">Vai trò</label>
                    <p className="text-[1.4rem] font-medium">
                      <span
                        className={`badge ${viewingAccount.role.toLowerCase()}-role`}
                      >
                        {viewingAccount.role}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">
                      Trạng thái
                    </label>
                    <p className="text-[1.4rem] font-medium">
                      <span
                        className={`badge ${viewingAccount.status.toLowerCase()}-status`}
                      >
                        {viewingAccount.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">
                      Ngày tạo
                    </label>
                    <p className="text-[1.4rem] font-medium">
                      {formatDate(viewingAccount.createAt)}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.2rem] text-muted">
                      Đăng nhập cuối
                    </label>
                    <p className="text-[1.4rem] font-medium">
                      {formatDate(viewingAccount.lastLoginAt)}
                    </p>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={closeModal}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FocusTrap>
      )}

      <style>{`
        body { display: block; }
         p { margin: 0; }
        .modal-custom-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; }
        .modal-custom-content { background: white; width: 90%; max-width: 700px; border-radius: 12px; }
        .form-control, .form-select { border: 1px solid #ddd; padding: 8px 12px; border-radius: 6px; }
        .active-role { color: #1a237e; font-weight: bold; }
        .user-role { color: #4caf50; }
        .admin-role { color: #f44336; }
        .active-status { color: #2e7d32; background: #e8f5e9; }
        .banned-status { color: #c62828; background: #ffebee; } 
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

export default AdminAccounts;
