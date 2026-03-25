import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaChevronLeft, FaCamera, FaCheckCircle } from "react-icons/fa";
import { GoHome } from "react-icons/go";
import { accountApi } from "../../apis";

interface UserForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  address: string;
  phone: string;
  avatar: string;
}

const EditPersonalInfo: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State quản lý dữ liệu form
  const [formData, setFormData] = useState<UserForm>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "MALE",
    email: "",
    address: "",
    phone: "",
    avatar: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const auth = localStorage.getItem("accessToken");
  const editAccountRaw = localStorage.getItem("userInfo");

  // 1. Khởi tạo dữ liệu
  useEffect(() => {
    if (!auth || !editAccountRaw) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }

    const user = JSON.parse(editAccountRaw);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      dateOfBirth: user.dateOfBirth || "",
      gender: user.gender || "MALE",
      email: user.email || "",
      address: user.address || "",
      phone: user.phone || "",
      avatar:
        user.avatar ||
        "https://cdn.pnj.io/images/customer/home/new_avatar_default.svg",
    });
  }, [auth, editAccountRaw, navigate]);

  // 2. Xác định URL quay lại
  const fromPage = searchParams.get("from");
  const backUrl = fromPage === "profile" ? "/profile" : "/my-account";

  // 3. Xử lý thay đổi Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. Xử lý Ảnh đại diện
  const handleCameraClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          avatar: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 5. Validate Form
  const validate = () => {
    if (!formData.firstName.trim()) return "Họ là bắt buộc";
    if (!formData.lastName.trim()) return "Tên là bắt buộc";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return "Email không đúng định dạng";
    if (!formData.address.trim()) return "Địa chỉ là bắt buộc";
    if (
      formData.phone &&
      !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      return "Số điện thoại không hợp lệ";
    }
    return null;
  };

  // 6. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    const user = JSON.parse(editAccountRaw!);
    const submitData = new FormData();
    submitData.append("firstName", formData.firstName.trim());
    submitData.append("lastName", formData.lastName.trim());
    submitData.append("dateOfBirth", formData.dateOfBirth);
    submitData.append("gender", formData.gender);
    submitData.append("email", formData.email.trim());
    submitData.append("address", formData.address.trim());
    submitData.append("phone", formData.phone.trim());
    if (selectedFile) submitData.append("avatar", selectedFile);

    try {
      const response = await accountApi.update(user.id, submitData);
      
      setShowSuccess(true);
      
      // Tải lại thông tin mới để cập nhật LocalStorage
      const newData = await accountApi.getById(user.id);

      if (newData.data.status && newData.data.status !== "ACTIVE") {
        localStorage.clear();
        navigate("/exception?code=403");
        return;
      }

      localStorage.setItem("userInfo", JSON.stringify(newData.data));
      localStorage.removeItem("editAccount");

      toast.success("Cập nhật thông tin thành công!");
      setTimeout(() => navigate(backUrl), 1500);
    } catch (error: any) {
      const errorCode = error.response?.data?.errorMessage;
      const status = error.response?.status || 500;
      handleErrorCode(errorCode, status);
    } finally {
      setLoading(false);
    }
  };

  const handleErrorCode = (errCode: string, status: number) => {
    const errorMessages: Record<string, string> = {
      "400019": "Email này đã tồn tại!",
      "400025": "Số điện thoại này đã tồn tại!",
      "404005": "Không tìm thấy tài khoản!",
    };
    const msg = errorMessages[errCode] || "Có lỗi xảy ra khi cập nhật.";
    toast.error(msg);
    if (status === 403 || status === 404) navigate(`/exception?code=${status}`);
  };

  return (
    <div className="profile-edit-container">
      {/* Header */}
      <div className="order-header !border-b-0">
        <Link to={backUrl} className="order-left no-underline">
          <div className="order-back">
            <FaChevronLeft />
          </div>
          <span className="order-title mb-0 !text-[1.4rem]">
            Chỉnh sửa thông tin
          </span>
        </Link>
        <Link to="/" className="order-right no-underline">
          <GoHome color="#000" />
        </Link>
      </div>

      {/* Success Message Banner */}
      {showSuccess && (
        <div className="success-message" style={{ display: "block" }}>
          <FaCheckCircle className="inline mr-2" /> Cập nhật thông tin thành
          công!
        </div>
      )}

      <form id="profileForm" onSubmit={handleSubmit}>
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-container">
            <img
              src={formData.avatar}
              className="avatar-img"
              alt="avatar"
              id="avatarImg"
            />
            <div className="camera-icon" onClick={handleCameraClick}>
              <FaCamera />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="form-row flex gap-4">
          <div className="form-group flex-1">
            <label>
              Họ <span className="required">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Vui lòng nhập họ"
            />
          </div>
          <div className="form-group flex-1">
            <label>
              Tên <span className="required">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Vui lòng nhập tên"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Ngày sinh</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Giới tính</label>
          <div className="gender-group flex gap-6 mt-2">
            {["MALE", "FEMALE", "OTHER"].map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={handleInputChange}
                />
                {g === "MALE" ? "Nam" : g === "FEMALE" ? "Nữ" : "Khác"}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Vui lòng nhập email"
          />
        </div>

        <div className="form-group">
          <label>
            Địa chỉ <span className="required">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Vui lòng nhập địa chỉ"
          />
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Vui lòng nhập số điện thoại"
          />
        </div>

        <button
          type="submit"
          className={`save-btn ${loading ? "opacity-70" : ""}`}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
      </form>
    </div>
  );
};

export default EditPersonalInfo;
