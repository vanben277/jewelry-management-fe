import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FocusTrap } from "focus-trap-react";
import {
  FaFilter,
  FaBox,
  FaPenToSquare,
  FaXmark,
  FaTrash,
  FaPlus,
  FaEye,
} from "react-icons/fa6";
import { FaInfoCircle, FaCloudUploadAlt, FaSave } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { productApi, categoryApi } from "../../apis";
import { Product } from "../../types";
import { PAGINATION } from '../../constants';
import { PRODUCT_STATUS } from '../../constants';

interface ProductImage {
  imageUrl: string;
  isPrimary: boolean;
  file?: File;
}

interface ProductSize {
  size: number;
  quantity: number;
}

const AdminProducts: React.FC = () => {

  // --- States Quản lý Dữ liệu ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [goldTypes, setGoldTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // --- States Bộ lọc ---
  const [filters, setFilters] = useState({
    name: "",
    categoryId: "",
    status: "",
    goldType: "",
    isDeleted: "",
    pageSize: PAGINATION.ADMIN_PAGE_SIZE,
    pageNumber: 0,
  });

  // --- States Modal (Tạo/Sửa/Xem) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productType, setProductType] = useState<"no-size" | "with-size">(
    "no-size",
  );

  // --- States Form ---
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    price: "",
    costPrice: "",
    quantity: "0",
    dateOfEntry: "",
    goldType: "",
    categoryId: "",
    description: "",
  });
  const [formSizes, setFormSizes] = useState<ProductSize[]>([]);
  const [formImages, setFormImages] = useState<ProductImage[]>([]);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<
    string | null
  >(null);

  // --- 1. Load Data Functions ---
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await productApi.filter({
        name: filters.name || undefined,
        categoryId: filters.categoryId || undefined,
        status: filters.status || undefined,
        goldType: filters.goldType || undefined,
        isDeleted: filters.isDeleted || undefined,
        pageSize: filters.pageSize,
        pageNumber: filters.pageNumber,
      });
      setProducts(result.data.content || []);
      setTotalPages(result.data.totalPages || 0);
      setTotalElements(result.data.totalElements || 0);
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, goldRes, statusRes] = await Promise.all([
          categoryApi.getNonParent(),
          productApi.getGoldTypes(),
          productApi.getStatuses(),
        ]);
        setCategories(catRes.data || []);
        setGoldTypes(goldRes.data || []);
        setStatuses(statusRes.data || []);
      } catch (error) {
        toast.error("Lỗi tải dữ liệu");
      }
    };
    fetchOptions();
  }, []);

  // --- 2. Inline Actions ---
  const handleInlineUpdate = async (id: number, field: string, value: any) => {
    try {
      if (field === "status") {
        await productApi.updateStatus(id, value);
      } else if (value === "TRUE") {
        await productApi.softDelete([id]);
      } else {
        await productApi.restore([id]);
      }
      toast.success("Cập nhật thành công");
      loadProducts();
    } catch (e) {
      toast.error("Lỗi hệ thống");
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const data = await productApi.getById(id);
      if (data.data) {
        setSelectedProduct(data.data);
        setIsViewModalOpen(true);
      } else {
        toast.error("Không tìm thấy dữ liệu chi tiết");
      }
    } catch (e) {
      toast.error("Lỗi khi tải chi tiết sản phẩm");
    }
  };

  const handleHardDelete = async (ids: number[]) => {
    if (!window.confirm(`Xác nhận xóa vĩnh viễn ${ids.length} sản phẩm?`))
      return;
    try {
      await productApi.hardDelete(ids);
      toast.success("Đã xóa vĩnh viễn");
      setSelectedIds([]);
      loadProducts();
    } catch (e) {
      toast.error("Lỗi xóa dữ liệu");
    }
  };

  // --- 3. Modal & Form Logic ---
  const openCreateModal = () => {
    setIsEditMode(false);
    setProductType("no-size");
    setFormData({
      sku: "",
      name: "",
      price: "",
      costPrice: "",
      quantity: "0",
      dateOfEntry: "",
      goldType: "",
      categoryId: "",
      description: "",
    });
    setFormSizes([]);
    setFormImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = async (id: number) => {
    try {
      const data = await productApi.getById(id);
      const p = data.data;
      setIsEditMode(true);
      setSelectedProduct(p);
      setFormData({
        sku: p.sku,
        name: p.name,
        price: p.price.toString(),
        costPrice: p.costPrice != null ? p.costPrice.toString() : "",
        quantity: p.quantity.toString(),
        dateOfEntry: p.dateOfEntry.split("T")[0],
        goldType: p.goldType || "",
        categoryId: p.categoryId.toString(),
        description: p.description || "",
      });
      setProductType(p.sizes && p.sizes.length > 0 ? "with-size" : "no-size");
      setFormSizes(p.sizes || []);
      setFormImages(
        p.images.map((img: any) => ({
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
        })),
      );
      setIsModalOpen(true);
    } catch (e) {
      toast.error("Lỗi tải chi tiết");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      imageUrl: URL.createObjectURL(file),
      isPrimary: false,
      file: file,
    }));
    const updatedImages = [...formImages, ...newImages];
    if (
      updatedImages.length > 0 &&
      !updatedImages.some((img) => img.isPrimary)
    ) {
      updatedImages[0].isPrimary = true;
    }
    setFormImages(updatedImages);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("sku", formData.sku);
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("costPrice", formData.costPrice);
    data.append("dateOfEntry", formData.dateOfEntry);
    data.append("categoryId", formData.categoryId);
    data.append("goldType", formData.goldType);
    data.append("description", formData.description);

    if (productType === "no-size") {
      data.append("quantity", formData.quantity);
    } else {
      formSizes.forEach((s, i) => {
        data.append(`sizes[${i}].size`, s.size.toString());
        data.append(`sizes[${i}].quantity`, s.quantity.toString());
      });
    }

    if (formImages.length > 0 && !formImages.some(img => img.isPrimary)) {
  formImages[0].isPrimary = true;
}

  if (isEditMode) {
    const imagesToKeep = formImages.filter(img => !img.file);
    imagesToKeep.forEach((img, i) => {
      data.append(`images[${i}].imageUrl`, img.imageUrl);
      data.append(`images[${i}].isPrimary`, img.isPrimary.toString());
    });
    
    const newImages = formImages.filter(img => img.file);
    newImages.forEach(img => {
      data.append('imageFiles', img.file!);
    });
  } else {
    formImages.forEach(img => {
      if (img.file) {
        data.append('images', img.file);
      }
    });
  }

    try {
      if (isEditMode && selectedProduct) {
        await productApi.update(selectedProduct.id, data);
        toast.success("Cập nhật thành công!");
      } else {
        await productApi.create(data);
        toast.success("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.errorMessage || "Thất bại");
    }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("vi-VN").format(p) + "đ";

  return (
    <div className="container-fluid">
      <div className="row">
        {/* HEADER */}
        <div className="ms-3 mb-3 mt-4">
          <h3 className="mb-0 h4 font-weight-bolder text-dark !text-[2.4rem]">
            Quản lý sản phẩm
          </h3>
          <p className="text-[16px] text-muted">
            Quản lý kho hàng, kích cỡ và hình ảnh trang sức.
          </p>
        </div>

        {/* FILTERS */}
        <div className="col-12 mt-4">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="mb-3 font-weight-bold text-[1.4rem] text-[#737373] flex items-center">
              <FaFilter className="me-2" /> Tìm kiếm và lọc sản phẩm
            </h6>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="text-[1.4rem] text-[#737373] font-medium">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  className="form-control h-[40px] text-[1.6rem]"
                  placeholder="Nhập tên..."
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
              <div className="col-md-3">
                <label className="text-[1.4rem] text-[#737373] font-medium">
                  Danh mục
                </label>
                <select
                  className="form-select h-[40px] text-[1.6rem]"
                  value={filters.categoryId}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      categoryId: e.target.value,
                      pageNumber: 0,
                    })
                  }
                >
                  <option value="">Tất cả</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="text-[1.4rem] text-[#737373] font-medium">
                  Tuổi vàng
                </label>
                <select
                  className="form-select h-[40px] text-[1.6rem]"
                  value={filters.goldType}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      goldType: e.target.value,
                      pageNumber: 0,
                    })
                  }
                >
                  <option value="">Tất cả</option>
                  {goldTypes.map((g) => (
                    <option key={g} value={g}>
                      {g.replace("GOLD_", "")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="text-[1.4rem] text-[#737373] font-medium">
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
                      {s === PRODUCT_STATUS.IN_STOCK ? "Còn hàng" : "Hết hàng"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="text-[1.4rem] text-[#737373] font-medium">
                  Tình trạng
                </label>
                <select
                  className="form-select h-[40px] text-[1.6rem]"
                  value={filters.isDeleted}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      isDeleted: e.target.value,
                      pageNumber: 0,
                    })
                  }
                >
                  <option value="">Tất cả</option>
                  <option value="false">Hiện</option>
                  <option value="true">Ẩn</option>
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
                <h6 className="text-white text-[1.6rem]">Danh sách kho hàng</h6>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm bg-white flex items-center gap-2"
                    onClick={openCreateModal}
                  >
                    <FaPlus className="text-[#737373]" />{" "}
                    <span className="text-[#737373] font-medium">
                      Tạo sản phẩm
                    </span>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
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
                              e.target.checked ? products.map((p) => p.id) : [],
                            )
                          }
                          checked={
                            selectedIds.length === products.length &&
                            products.length > 0
                          }
                        />
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7 ps-2">
                        Sản phẩm
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7 text-center">
                        Giá nhập
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7 text-center">
                        Giá bán
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7 text-center">
                        Tồn kho
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7 text-center">
                        Trạng thái
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7 text-center">
                        Show/Hide
                      </th>
                      <th className="text-uppercase text-secondary !text-[1.1rem] font-weight-bolder opacity-7 text-center">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5">
                          Đang tải...
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id}>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(p.id)}
                              onChange={() =>
                                setSelectedIds((prev) =>
                                  prev.includes(p.id)
                                    ? prev.filter((id) => id !== p.id)
                                    : [...prev, p.id],
                                )
                              }
                            />
                          </td>
                          <td>
                            <div className="d-flex px-2 py-1 align-items-center">
                              <img
                                src={p.primaryImageUrl}
                                className="avatar avatar-sm me-3 border-radius-lg"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                                alt="prod"
                              />
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-[1.4rem] font-bold">
                                  {p.name}
                                </h6>
                                <p className="text-[1.2rem] text-secondary mb-0">
                                  {p.sku}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center text-[1.3rem] font-bold">
                            {p.costPrice != null ? formatPrice(p.costPrice) : "-"}
                          </td>
                          <td className="text-center text-[1.3rem] font-bold">
                            {formatPrice(p.price)}
                          </td>
                          <td className="text-center text-[1.3rem]">
                            {p.quantity}
                          </td>
                          <td className="text-center">
                            <select
                              className="form-select form-select-sm !text-[1.2rem]"
                              value={p.status}
                              onChange={(e) =>
                                handleInlineUpdate(
                                  p.id,
                                  "status",
                                  e.target.value,
                                )
                              }
                            >
                              <option value={PRODUCT_STATUS.IN_STOCK}>Còn hàng</option>
                              <option value={PRODUCT_STATUS.SOLD_OUT}>Hết hàng</option>
                            </select>
                          </td>
                          <td className="text-center">
                            <select
                              className="form-select form-select-sm !text-[1.2rem]"
                              value={p.isDeleted.toString().toUpperCase()}
                              onChange={(e) =>
                                handleInlineUpdate(
                                  p.id,
                                  "visibility",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="FALSE">Hiện</option>
                              <option value="TRUE">Ẩn</option>
                            </select>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn-link text-secondary mb-0 mr-[6px]"
                              onClick={() => handleViewDetail(p.id)}
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              className="btn-link text-secondary mb-0 mx-[6px]"
                              onClick={() => openEditModal(p.id)}
                            >
                              <FaPenToSquare size={16} />
                            </button>
                            <button
                              className="btn-link text-secondary mb-0 ml-[6px]"
                              onClick={() => handleHardDelete([p.id])}
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
            <FaInfoCircle className="me-1" /> Hiển thị {products.length} /{" "}
            {totalElements} sản phẩm
          </div>
          <div className="pagination-btns d-flex gap-1 align-items-center">
            <button
              disabled={filters.pageNumber === 0}
              className="btn btn-sm btn-outline-secondary mb-0 !rounded-[50%] !p-[10px]"
              onClick={() =>
                setFilters({ ...filters, pageNumber: filters.pageNumber - 1 })
              }
            >
              <MdChevronLeft size={20} />
            </button>
            <span className="mx-2 text-[1.3rem]">
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

      {/* --- MODAL CREATE/EDIT --- */}
      {isModalOpen && (
        <FocusTrap active={isModalOpen}>
          <div className="modal-custom-overlay flex items-center justify-center">
            <div className="modal-custom-content animate__animated animate__zoomIn !max-w-[800px]">
              <div className="modal-header d-flex justify-content-between p-4 border-bottom !bg-white">
                <h5 className="!text-[1.8rem] font-bold flex items-center">
                  <FaBox className="me-2" />
                  {isEditMode ? "Sửa sản phẩm" : "Tạo sản phẩm"}
                </h5>
                <button
                  className="border-0 text-[#737373]"
                  onClick={() => setIsModalOpen(false)}
                >
                  <FaXmark size={24} />
                </button>
              </div>

            <form
              onSubmit={handleFormSubmit}
              className="p-4 overflow-y-auto max-h-[80vh]"
            >
              {/* Loại sản phẩm */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <label className="text-[1.4rem] font-bold block mb-2">
                  Loại tồn kho
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={productType === "no-size"}
                      onChange={() => setProductType("no-size")}
                    />{" "}
                    Không có kích cỡ
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={productType === "with-size"}
                      onChange={() => setProductType("with-size")}
                    />{" "}
                    Có kích cỡ (Nhẫn, vòng...)
                  </label>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="text-[1.4rem]">Mã SKU *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="text-[1.4rem]">Tên sản phẩm *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="text-[1.4rem]">Giá nhập *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.costPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, costPrice: e.target.value })
                      }
                      required
                    />
                  </div>
                <div className="col-md-6 mb-3">
                  <label className="text-[1.4rem]">Giá bán *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {productType === "no-size" && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-[1.4rem]">Số lượng tổng *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Phần quản lý Size */}
              {productType === "with-size" && (
                <div className="mb-4 border p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[1.4rem] font-bold">
                      Quản lý kích cỡ
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-dark mb-0"
                      onClick={() =>
                        setFormSizes([...formSizes, { size: 0, quantity: 0 }])
                      }
                    >
                      <FaPlus className="me-1" /> Thêm size
                    </button>
                  </div>
                  {formSizes.map((s, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="number"
                        placeholder="Size"
                        className="form-control"
                        value={s.size}
                        onChange={(e) => {
                          const newS = [...formSizes];
                          newS[idx].size = parseFloat(e.target.value);
                          setFormSizes(newS);
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Số lượng"
                        className="form-control"
                        value={s.quantity}
                        onChange={(e) => {
                          const newS = [...formSizes];
                          newS[idx].quantity = parseInt(e.target.value);
                          setFormSizes(newS);
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-link text-danger mb-0"
                        onClick={() =>
                          setFormSizes(formSizes.filter((_, i) => i !== idx))
                        }
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="text-[1.4rem]">Danh mục *</label>
                  <select
                    className="form-select"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="text-[1.4rem]">Tuổi vàng</label>
                  <select
                    className="form-select"
                    value={formData.goldType}
                    onChange={(e) =>
                      setFormData({ ...formData, goldType: e.target.value })
                    }
                  >
                    <option value="">Không có</option>
                    {goldTypes.map((g) => (
                      <option key={g} value={g}>
                        {g.replace("GOLD_", "")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-[1.4rem]">Ngày nhập hàng *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.dateOfEntry}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfEntry: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="text-[1.4rem]">Mô tả</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Hình ảnh */}
              <div className="mb-3">
                <label className="text-[1.4rem] font-bold block mb-2">
                  Hình ảnh sản phẩm *
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {formImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group border rounded-lg p-1"
                    >
                      <img
                        src={img.imageUrl}
                        className="h-[7rem] object-cover rounded"
                        alt="prev"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hidden group-hover:block"
                        onClick={() =>
                          setFormImages(formImages.filter((_, i) => i !== idx))
                        }
                      >
                        <FaXmark size={12} />
                      </button>
                      <div className="mt-1 text-center">
                        <input
                          type="radio"
                          name="primary"
                          checked={img.isPrimary}
                          onChange={() => {
                            const updated = formImages.map((m, i) => ({
                              ...m,
                              isPrimary: i === idx,
                            }));
                            setFormImages(updated);
                          }}
                        />{" "}
                        <small>Chính</small>
                      </div>
                    </div>
                  ))}
                  <label className="w-20 h-20 border-2 border-dashed flex items-center justify-center cursor-pointer rounded-lg hover:bg-gray-50">
                    <FaCloudUploadAlt size={24} className="text-gray-400" />
                    <input
                      type="file"
                      multiple
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
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
                  {isEditMode ? "Cập nhật" : "Lưu sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
        </FocusTrap>
      )}

      {/* --- MODAL VIEW DETAIL --- */}
      {isViewModalOpen && selectedProduct && (
        <FocusTrap active={isViewModalOpen}>
          <div className="modal-custom-overlay flex items-center justify-center">
          <div className="modal-custom-content animate__animated animate__zoomIn !max-w-[800px]">
            <div className="modal-header d-flex justify-content-between p-4 border-bottom !bg-white">
              <h5 className="!text-[1.8rem] font-bold">
                Chi tiết: {selectedProduct.name || "Sản phẩm"}
              </h5>
              <button
                className="border-0 text-[#737373] cursor-pointer"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedProduct(null);
                  setSelectedPreviewImage(null);
                }}
              >
                <FaXmark size={24} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[80vh]">
              {/* Phần ảnh chính + thông tin */}
              <div className="row mb-6">
                <div className="col-md-5">
                  <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                    <img
                      src={
                        selectedPreviewImage || selectedProduct.primaryImageUrl
                      }
                      className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                      alt="Ảnh chính"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.jpg"; // fallback nếu ảnh lỗi
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-7 ps-4">
                  <h4 className="text-[#003468] font-bold mb-2 text-[2rem]">
                    {selectedProduct.displayName || selectedProduct.name}
                  </h4>
                  <p className="text-[1.4rem] mb-2 text-muted">
                    SKU: {selectedProduct.sku}
                  </p>
                  <h3 className="text-danger font-bold mb-4">
                    {formatPrice(selectedProduct.price)}
                  </h3>

                  <div className="space-y-2 text-[1.4rem]">
                    <p className="text-[1.4rem]">
                      <b>Danh mục:</b> {selectedProduct.categoryName || "N/A"}
                    </p>
                    <p className="text-[1.4rem]">
                      <b>Loại vàng:</b>{" "}
                      {selectedProduct.goldType
                        ? selectedProduct.goldType.replace("GOLD_", "")
                        : "Không có"}
                    </p>
                    <p className="text-[1.4rem]">
                      <b>Tổng tồn kho:</b> {selectedProduct.quantity} chiếc
                    </p>
                  </div>
                </div>
              </div>

              {/* Kích cỡ nếu có */}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="mb-6">
                  <h6 className="font-bold border-b pb-2 mb-3 text-[1.5rem]">
                    Bảng kích cỡ:
                  </h6>
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.sizes.map((s, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 bg-gray-100 rounded-lg text-[1.3rem] shadow-sm"
                      >
                        Size <b>{s.size}</b> - SL: <b>{s.quantity}</b>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery ảnh */}
              <div>
                <h6 className="font-bold border-b pb-2 mb-3 text-[1.5rem]">
                  Hình ảnh sản phẩm
                </h6>

                <div className="flex flex-wrap gap-3">
                  {/* Ảnh chính (luôn có trong gallery, click để quay về) */}
                  <div
                    className={`cursor-pointer rounded-lg border-2 p-1 transition-all duration-200 ${
                      selectedPreviewImage === null
                        ? "border-blue-600 shadow-lg scale-105"
                        : "border-gray-300 hover:border-blue-400 hover:scale-105"
                    }`}
                    onClick={() => setSelectedPreviewImage(null)}
                  >
                    <img
                      src={selectedProduct.primaryImageUrl}
                      className="h-20 object-cover rounded"
                      alt="Primary"
                    />
                  </div>

                  {/* Ảnh phụ */}
                  {selectedProduct.images?.map((img, i) => (
                    <div
                      key={i}
                      className={`cursor-pointer rounded-lg border-2 p-1 transition-all duration-200 ${
                        selectedPreviewImage === img.imageUrl
                          ? "border-blue-600 shadow-lg scale-105"
                          : "border-gray-300 hover:border-blue-400 hover:scale-105"
                      }`}
                      onClick={() => setSelectedPreviewImage(img.imageUrl)}
                    >
                      <img
                        src={img.imageUrl}
                        className="h-20 object-cover rounded"
                        alt={`Ảnh ${i + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </FocusTrap>
      )}

      <style>{`
        body { display: block; }
        p { margin: 0; }
        .modal-custom-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1050;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-custom-content {
            background: white;
            width: 95%;
            max-width: 900px;
            border-radius: 12px;
            max-height: 95vh;
            overflow-y: auto;
        }
        .form-control, .form-select { border: 1px solid #ddd !important; padding: 8px 12px; border-radius: 6px; font-size: 1.4rem; }
        .hidden-letter h6 { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px; }
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

export default AdminProducts;
