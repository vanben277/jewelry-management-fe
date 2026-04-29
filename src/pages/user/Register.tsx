import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { authApi } from "../../apis";
import { getPasswordRequirements, getPasswordStrength, getPasswordStrengthClass } from "../../utils";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    gender: "",
    phone: "",
    address: "",
    userName: "",
    password: "",
    confirmPassword: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength & requirements
  const [passwordReqs, setPasswordReqs] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const pass = formData.password;
    const reqs = getPasswordRequirements(pass);
    setPasswordReqs(reqs);

    const score = getPasswordStrength(pass);
    setPasswordStrength(score);
  }, [formData.password]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: onlyNums }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (event) =>
        setAvatarPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.userName.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      toast("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast("Mật khẩu xác nhận không khớp!");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (avatar) data.append("avatar", avatar);

    try {
      await authApi.register(data);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.errorMessage;
      const errorMsgs: Record<string, string> = {
        "400019": "Email đã tồn tại!",
        "400020": "Tài khoản đã tồn tại!",
        "400025": "Số điện thoại đã tồn tại!",
      };
      toast.error(
        errorMsgs[errorMessage] ||
          error.response?.data?.message ||
          "Đăng ký thất bại",
      );
    }
  };

  const getStrengthClass = () => {
    return getPasswordStrengthClass(formData.password);
  };

  return (
    <div className="w-full min-h-screen flex justify-center bg-[#f8fafc]">
      <div className="bg-white relative max-w-[500px] w-full max-sm:w-full border-x border-gray-100 shadow-sm">
        <div className="flex w-full justify-center py-[10px]">
          <Link to="/">
            <img
              src="https://www.pnj.com.vn/my_profile_asset/logo.svg"
              className="w-[92px] h-[48px]"
              alt="PNJ Logo"
            />
          </Link>
        </div>

        <form
          className="mt-2 rounded-[3px] text-[1.5rem] p-[0px]"
          onSubmit={handleSubmit}
        >
          <div className="flex justify-center text-[#333] text-[2.5rem] font-semibold px-[5px] mb-[10px] max-sm:text-[2rem] max-sm:mb-1">
            Đăng ký tài khoản
          </div>
          <div className="flex justify-center px-[5px] text-[1.6rem] mb-5 max-sm:text-[1.2rem]">
            Vui lòng điền thông tin để tạo tài khoản mới
          </div>

          {/* Họ và Tên */}
          <div className="mt-[18px] mx-[19px] flex gap-4 max-sm:flex-col max-sm:gap-0">
            <div className="flex-1">
              <label className="block text-[1.6rem] mb-2">
                Họ <span className="text-[#dc3545]">*</span>
              </label>
              <input
                type="text"
                className="w-full h-[33px] p-[24px] text-[14px] border border-gray-300 !rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:ring-offset-2 transition-all"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Nguyễn"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[1.6rem] mb-2">
                Tên <span className="text-[#dc3545]">*</span>
              </label>
              <input
                type="text"
                className="w-full h-[33px] p-[24px] text-[14px] border border-gray-300 !rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:ring-offset-2 transition-all"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Văn A"
              />
            </div>
          </div>

          {/* Email & Số điện thoại */}
          <div className="mt-[18px] mx-[19px] flex gap-4 max-sm:flex-col">
            <div className="flex-[2]">
              <label className="block text-[1.6rem] mb-2">
                Email <span className="text-[#dc3545]">*</span>
              </label>
              <input
                type="email"
                className="w-full h-[33px] p-[24px] text-[14px] border border-gray-300 !rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:ring-offset-2 transition-all"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@gmail.com"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[1.6rem] mb-2">
                SĐT <span className="text-[#dc3545]">*</span>
              </label>
              <input
                type="text"
                className="w-full h-[33px] p-[24px] text-[14px] border border-gray-300 !rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:ring-offset-2 transition-all"
                name="phone"
                maxLength={10}
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0987..."
              />
            </div>
          </div>

          {/* Ngày sinh & Giới tính */}
          <div className="mt-[18px] mx-[19px] flex gap-4 max-sm:flex-col max-sm:gap-0">
            <div className="flex-1">
              <label className="block text-[1.6rem] mb-2">Ngày sinh</label>
              <input
                type="date"
                className="w-full h-[33px] p-[24px] text-[14px] border border-gray-300 !rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:ring-offset-2 transition-all cursor-pointer"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[1.6rem] mb-2">Giới tính</label>
              <select
                className="w-full h-[33px] px-3 text-[14px] border pt-0 pb-0 border-gray-300 rounded-[4px] focus:outline-none focus:border-[#0d6efd] focus:ring-1 focus:ring-[#0d6efd] bg-white transition-all cursor-pointer"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="mt-[18px] mx-[19px]">
            <label className="block text-[1.6rem] mb-2">Địa chỉ</label>
            <textarea
              className="w-full p-3 text-[14px] border border-gray-300 !rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] transition-all min-h-[80px]"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ nhận hàng..."
            />
          </div>

          {/* Avatar Upload */}
          <div className="mt-[18px] mx-[19px]">
            <label className="block text-[1.6rem] mb-2">Ảnh đại diện</label>
            <div className="flex items-center gap-4 border border-dashed border-gray-300 p-3 rounded-[4px] bg-gray-50">
              <div className="w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden bg-white shadow-sm">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-gray-400 text-2xl" />
                )}
              </div>
              <label
                htmlFor="avatarInput"
                className="cursor-pointer px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-[4px] hover:bg-gray-100 transition shadow-sm text-[1.3rem]"
              >
                Chọn ảnh
              </label>
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <span className="text-[1.2rem] text-gray-500 italic">
                Dung lượng tối đa 2MB
              </span>
            </div>
          </div>

          {/* Tài khoản */}
          <div className="mt-[18px] mx-[19px]">
          <label htmlFor="userName" className="block text-[1.6rem] mb-2">
            Tài khoản <span className="text-[#dc3545]" aria-hidden="true">*</span>
          </label>
          <input
            id="userName"
            type="text"
            aria-label="Tên tài khoản"
            aria-required="true"
            className="w-full h-[33px] p-[24px] text-[14px] border border-gray-300 !rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:ring-offset-2 transition-all"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            placeholder="4-30 ký tự"
          />
          </div>

          {/* Mật khẩu */}
          <div className="mt-[18px] mx-[19px]">
            <label className="block text-[1.6rem] mb-2">
              Mật khẩu <span className="text-[#dc3545]">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-[33px] p-[24px] pr-[45px] text-[14px] border border-gray-300 !rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:ring-offset-2 transition-all"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <span
                className="absolute right-[15px] top-1/2 -translate-y-1/2 cursor-pointer text-[#6c757d] text-[16px] hover:text-[#495057]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            {/* Password requirements */}
            {formData.password && (
              <div className="mt-3 text-[1.3rem]">
                <ul className="space-y-1">
                  <li
                    className={`flex items-center gap-2 ${passwordReqs.length ? "text-green-600" : "text-gray-500"}`}
                  >
                    {passwordReqs.length ? <FaCheck /> : <FaTimes />} Từ 8–16 ký
                    tự
                  </li>
                  <li
                    className={`flex items-center gap-2 ${passwordReqs.lowercase ? "text-green-600" : "text-gray-500"}`}
                  >
                    {passwordReqs.lowercase ? <FaCheck /> : <FaTimes />} Có chữ
                    thường
                  </li>
                  <li
                    className={`flex items-center gap-2 ${passwordReqs.uppercase ? "text-green-600" : "text-gray-500"}`}
                  >
                    {passwordReqs.uppercase ? <FaCheck /> : <FaTimes />} Có chữ
                    in hoa
                  </li>
                  <li
                    className={`flex items-center gap-2 ${passwordReqs.number ? "text-green-600" : "text-gray-500"}`}
                  >
                    {passwordReqs.number ? <FaCheck /> : <FaTimes />} Có số
                  </li>
                  <li
                    className={`flex items-center gap-2 ${passwordReqs.special ? "text-green-600" : "text-gray-500"}`}
                  >
                    {passwordReqs.special ? <FaCheck /> : <FaTimes />} Có ký tự
                    đặc biệt (@$!%*?&)
                  </li>
                </ul>

                {/* Strength bar */}
                <div className="mt-3 h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthClass()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="mt-[18px] mx-[19px]">
            <label className="block text-[1.6rem] mb-2">
              Xác nhận mật khẩu <span className="text-[#dc3545]">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full h-[33px] p-[24px] pr-[45px] text-[14px] border border-gray-300 !rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:ring-offset-2 transition-all"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <span
                className="absolute right-[15px] top-1/2 -translate-y-1/2 cursor-pointer text-[#6c757d] text-[16px] hover:text-[#495057]"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>

          {/* Nút Đăng ký */}
          <div className="w-full flex justify-center mb-5 mt-[30px]">
            <button
              type="submit"
              className="min-w-[95%] min-h-[40px] text-[1.5rem] bg-[#0d6efd] text-white rounded-[5px] hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all font-medium"
            >
              Đăng ký
            </button>
          </div>

          <hr className="w-full" style={{ borderTop: "1px solid #eee" }} />

          <div className="mx-[19px] mb-[15px] text-center text-[1.4rem] pb-5">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-[#0d6efd] no-underline hover:underline font-medium"
            >
              Đăng nhập
            </Link>{" "}
            hoặc về{" "}
            <Link
              to="/"
              className="text-[#0d6efd] no-underline hover:underline font-medium"
            >
              Trang chủ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
