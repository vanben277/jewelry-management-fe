import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaChevronLeft, FaCamera } from "react-icons/fa";
import { GoHome } from "react-icons/go";
import { accountApi } from "../../apis";

const EditPersonalInfo: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
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

  const editAccountRaw = localStorage.getItem("userInfo");

  useEffect(() => {
    if (!editAccountRaw) {
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
  }, [editAccountRaw, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(editAccountRaw!);

      const submitData = new FormData();
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("dateOfBirth", formData.dateOfBirth);
      submitData.append("gender", formData.gender);
      submitData.append("email", formData.email);
      submitData.append("address", formData.address);
      submitData.append("phone", formData.phone);
      if (selectedFile) {
        submitData.append("avatar", selectedFile);
      }

      await accountApi.update(user.id, submitData);

      // Lấy lại data mới
      const res = await accountApi.getById(user.id);
      localStorage.setItem("userInfo", JSON.stringify(res.data));

      toast.success("Cập nhật thành công!");
      setTimeout(() => navigate(-1), 1500);
    } catch (error: any) {
      toast.error("Cập nhật thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit-container">
      <div className="order-header !border-b-0">
        <div
          className="order-left"
          onClick={() => navigate(-1)}
          style={{ cursor: "pointer" }}
        >
          <div className="order-back">
            <FaChevronLeft />
          </div>
          <span className="order-title mb-0 !text-[1.4rem]">
            Chỉnh sửa thông tin
          </span>
        </div>
        <Link to="/" className="order-right no-underline">
          <GoHome color="#000" />
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="avatar-section">
          <div className="avatar-container">
            <img src={formData.avatar} className="avatar-img" alt="avatar" />
            <div
              className="camera-icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaCamera />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="form-row flex gap-4">
          <div className="form-group flex-1">
            <label>Họ</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group flex-1">
            <label>Tên</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
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
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? "Đang xử lý..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
};

export default EditPersonalInfo;
