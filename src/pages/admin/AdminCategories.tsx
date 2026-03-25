import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaFilter,
  FaList,
  FaCircleExclamation,
  FaPenToSquare,
  FaXmark,
  FaTrash,
  FaPlus,
} from "react-icons/fa6";
import { FaInfoCircle, FaCloudUploadAlt, FaSave } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { categoryApi } from "../../apis";
import { Category } from "../../types";

// --- Interfaces ---
interface PageData {
  content: Category[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

const AdminCategories: React.FC = () => {
  // --- States ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentOptions, setParentOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filters
  const [filters, setFilters] = useState({
    name: "",
    pageSize: 10,
    pageNumber: 0,
  });

  // Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewBanner, setPreviewBanner] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await categoryApi.filter({
        name: filters.name || undefined,
        pageNumber: filters.pageNumber,
        pageSize: filters.pageSize,
      });
      setCategories(result.data.content);
      setPageData({
        content: result.data.content,
        totalPages: result.data.totalPages,
        totalElements: result.data.totalElements,
        number: filters.pageNumber,
        size: filters.pageSize,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadParentOptions = useCallback(async () => {
    try {
      const data = await categoryApi.getNonParent();
      setParentOptions(data.data || []);
    } catch (e) {
      console.error("Lỗi tải danh mục cha");
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // --- 2. Logic Xử lý trạng thái (Show/Hide) ---
  const handleToggleStatus = async (id: number, isDeleted: boolean) => {
    try {
      if (isDeleted) {
        await categoryApi.softDelete([id]);
      } else {
        await categoryApi.restore([id]);
      }
      toast.success("Cập nhật trạng thái thành công!");
      loadCategories();
    } catch (e: any) {
      toast.error(e.response?.data?.errorMessage || "Lỗi hệ thống");
    }
  };

  // --- 3. Xóa cứng (Hard Delete) ---
  const handleHardDelete = async (ids: number[]) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn ${ids.length} danh mục?`,
      )
    )
      return;

    try {
      await categoryApi.hardDelete(ids);
      toast.success("Đã xóa vĩnh viễn thành công!");
      setSelectedIds([]);
      loadCategories();
    } catch (e: any) {
      toast.error(e.response?.data?.errorMessage || "Lỗi khi xóa dữ liệu");
    }
  };

  // --- 4. Modal Handlers ---
  const openModal = (mode: "create" | "edit", id?: number) => {
    loadParentOptions();
    if (mode === "edit" && id) {
      setIsEditMode(true);
      setEditingId(id);
      const cat = categories.find((c) => c.id === id);
      if (cat) {
        setFormData({
          name: cat.name,
          description: cat.description || "",
          parentId: cat.parentId?.toString() || "",
        });
        setPreviewBanner(cat.bannerUrl);
      }
    } else {
      setIsEditMode(false);
      setFormData({ name: "", description: "", parentId: "" });
      setPreviewBanner("");
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.length < 2) {
      toast.error("Tên danh mục quá ngắn");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    if (formData.parentId) data.append("parentId", formData.parentId);
    if (selectedFile) data.append("bannerUrl", selectedFile);
    if (isEditMode) data.append("id", editingId!.toString());

    try {
      if (isEditMode && editingId) {
        await categoryApi.update(editingId, data);
      } else {
        await categoryApi.create(data);
      }
      toast.success(
        isEditMode ? "Cập nhật thành công!" : "Tạo mới thành công!",
      );
      setIsModalOpen(false);
      loadCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || "Thao tác thất bại");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* HEADER */}
        <div className="ms-3 mb-3 mt-4">
          <h3 className="mb-0 h4 font-weight-bolder text-dark !text-[2.4rem]">
            Quản lý danh mục
          </h3>
          <p className="text-[16px] text-muted">
            Tổ chức và phân loại sản phẩm trang sức.
          </p>
        </div>

        {/* FILTERS */}
        <div className="col-12 mt-4">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="mb-3 font-weight-bold text-[1.4rem] text-[#737373] flex items-center">
              <FaFilter className="me-2" /> Tìm kiếm và lọc danh mục
            </h6>
            <div className="row">
              <div className="col-12">
                <label className="text-[1.4rem] flex items-center text-[#737373] font-medium">
                  <FaList className="me-1" /> Tên danh mục
                </label>
                <input
                  type="text"
                  className="form-control h-[40px] text-[1.6rem]"
                  placeholder="Nhập tên danh mục cần tìm..."
                  value={filters.name}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      name: e.target.value,
                      pageNumber: 0,
                    })
                  }
                />
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
                  Danh sách danh mục
                </h6>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm bg-white flex items-center gap-2"
                    onClick={() => openModal("create")}
                  >
                    <FaPlus className="text-[#737373]" />
                    <span className="text-[#737373] font-medium">
                      Tạo danh mục
                    </span>
                  </button>
                  <button
                    className={`btn btn-sm btn-danger ${selectedIds.length === 0 ? "opacity-50" : ""}`}
                    disabled={selectedIds.length === 0}
                    onClick={() => handleHardDelete(selectedIds)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body px-0 pb-2">
              <div className="table-responsive p-0">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-center opacity-7">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            setSelectedIds(
                              e.target.checked
                                ? categories.map((c) => c.id)
                                : [],
                            )
                          }
                          checked={
                            selectedIds.length === categories.length &&
                            categories.length > 0
                          }
                        />
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        ID
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        Tên / Banner
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        Mô tả
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        ID Cha
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7">
                        Trạng thái
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
                    ) : categories.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          <FaCircleExclamation className="me-2" /> Không tìm
                          thấy dữ liệu
                        </td>
                      </tr>
                    ) : (
                      categories.map((c) => (
                        <tr key={c.id}>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(c.id)}
                              onChange={() =>
                                setSelectedIds((prev) =>
                                  prev.includes(c.id)
                                    ? prev.filter((id) => id !== c.id)
                                    : [...prev, c.id],
                                )
                              }
                            />
                          </td>
                          <td className="ps-4 text-[1.2rem] font-weight-bold">
                            #{c.id}
                          </td>
                          <td>
                            <div className="d-flex px-2 py-1 align-items-center">
                              <img
                                src={c.bannerUrl}
                                className="border-radius-lg me-3"
                                style={{
                                  width: "80px",
                                  height: "40px",
                                  objectFit: "cover",
                                }}
                                alt={c.name}
                              />
                              <h6 className="mb-0 text-[1.3rem] text-[#737373] font-bold">
                                {c.name}
                              </h6>
                            </div>
                          </td>
                          <td className="text-[1.3rem] text-[#737373]">
                            {c.description || "-"}
                          </td>
                          <td className="text-[1.3rem] text-[#737373] text-center">
                            {c.parentId ? `#${c.parentId}` : "Đơn"}
                          </td>
                          <td className="text-center">
                            <select
                              className={`form-select form-select-sm !text-[1.2rem] font-weight-bold ${!c.isDeleted ? "text-success" : "text-danger"}`}
                              value={c.isDeleted.toString()}
                              onChange={(e) =>
                                handleToggleStatus(
                                  c.id,
                                  e.target.value === "true",
                                )
                              }
                            >
                              <option value="false">Hiện (Show)</option>
                              <option value="true">Ẩn (Hide)</option>
                            </select>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn-link text-secondary mb-0 mr-[6px]"
                              onClick={() => openModal("edit", c.id)}
                            >
                              <FaPenToSquare size={16} />
                            </button>
                            <button
                              className="btn-link text-secondary mb-0 ml-[6px]"
                              onClick={() => handleHardDelete([c.id])}
                            >
                              <FaTrash size={16} />
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
          <div className="text-[1.3rem] text-muted flex items-center">
            <FaInfoCircle className="me-1" /> Hiển thị {categories.length} /{" "}
            {pageData?.totalElements || 0} danh mục
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
                {filters.pageNumber + 1} / {pageData?.totalPages || 1}
              </span>
              <button
                disabled={filters.pageNumber >= (pageData?.totalPages || 1) - 1}
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

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="modal-custom-overlay flex items-center justify-center">
          <div className="modal-custom-content animate__animated animate__zoomIn">
            <div className="modal-header d-flex justify-content-between p-4 border-bottom !bg-white">
              <h5 className="!text-[1.8rem] font-bold flex items-center">
                <FaList className="me-2" />
                {isEditMode ? "Sửa danh mục" : "Tạo danh mục mới"}
              </h5>
              <button
                className="border-0 bg-transparent text-[#737373]"
                onClick={() => setIsModalOpen(false)}
              >
                <FaXmark size={24} />
              </button>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="p-4 overflow-y-auto max-h-[80vh]"
            >
              <div className="mb-3">
                <label className="text-[1.4rem]">Tên danh mục *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="text-[1.4rem]">Mô tả</label>
                <textarea
                  className="form-control !h-auto"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="text-[1.4rem]">Danh mục cha</label>
                <select
                  className="form-select"
                  value={formData.parentId}
                  onChange={(e) =>
                    setFormData({ ...formData, parentId: e.target.value })
                  }
                >
                  <option value="">Danh mục đơn</option>
                  {parentOptions.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      disabled={isEditMode && p.id === editingId}
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="text-[1.4rem]">Banner</label>
                <div className="d-flex align-items-center gap-3 mt-2">
                  <img
                    src={previewBanner || "/img/default-banner.jpg"}
                    className="border-radius-lg shadow"
                    style={{
                      width: "150px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                    alt="preview"
                  />
                  <label className="btn btn-outline-primary btn-sm mb-0 cursor-pointer">
                    <FaCloudUploadAlt className="me-2" /> Chọn ảnh
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          setPreviewBanner(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaSave className="me-2" />{" "}
                  {isEditMode ? "Lưu thay đổi" : "Tạo danh mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        body { display: block; }
        p { margin: 0; }
        .modal-custom-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; }
        .modal-custom-content { background: white; width: 90%; max-width: 600px; border-radius: 12px; }
        .form-control, .form-select { border: 1px solid #ddd !important; padding: 8px 12px; border-radius: 6px; }
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

export default AdminCategories;
