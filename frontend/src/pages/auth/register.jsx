import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import { authService } from "../../api/auth.service";
import { User, Mail, Phone, Lock, Calendar, MapPin, Briefcase, UserPlus, AlertCircle, CheckCircle, Info } from "lucide-react";
import { InputField } from "../../Components/common/InputFeild";

function RegistrationForm() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobileNumber: "",
    password: "",
    dob: "",
    gender: "",
    location: "",
    profession: "",
  });

  // Validation rules
  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case "username":
        if (!value.trim()) {
          errors.username = "Tên đầy đủ không được để trống";
        }
        break;

      case "email":
        if (!value.trim()) {
          errors.email = "Email không được để trống";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = "Email không hợp lệ";
        }
        break;

      case "mobileNumber":
        if (!value.trim()) {
          errors.mobileNumber = "Số điện thoại không được để trống";
        } else if (!/^\d{10,11}$/.test(value.replace(/\D/g, ""))) {
          errors.mobileNumber = "Số điện thoại phải có 10-11 chữ số";
        }
        break;

      case "password":
        if (!value) {
          errors.password = "Mật khẩu không được để trống";
        } else if (value.length < 8 || value.length > 25) {
          errors.password = "Mật khẩu phải từ 8 đến 25 ký tự";
        }
        break;

      case "dob":
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear general error when user starts typing
    if (error) setError("");

    // Validate field on change and clear error if valid
    const fieldError = validateField(name, value);
    if (fieldError[name]) {
      setFieldErrors({ ...fieldErrors, [name]: fieldError[name] });
    } else {
      const newFieldErrors = { ...fieldErrors };
      delete newFieldErrors[name];
      setFieldErrors(newFieldErrors);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate all fields
    const usernameErr = validateField("username", formData.username);
    const emailErr = validateField("email", formData.email);
    const phoneErr = validateField("mobileNumber", formData.mobileNumber);
    const passwordErr = validateField("password", formData.password);
    const dobErr = validateField("dob", formData.dob);

    if (usernameErr.username) errors.username = usernameErr.username;
    if (emailErr.email) errors.email = emailErr.email;
    if (phoneErr.mobileNumber) errors.mobileNumber = phoneErr.mobileNumber;
    if (passwordErr.password) errors.password = passwordErr.password;
    if (dobErr.dob) errors.dob = dobErr.dob;
    if (!formData.gender) errors.gender = "Vui lòng chọn giới tính";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate form before submit
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.register(formData);

      if (result.success) {
        setSuccessMessage(`Đăng ký thành công! Vui lòng vào email ${formData.email} để xác nhận tài khoản của bạn.`);
        
        // Reset form
        setFormData({
          username: "",
          email: "",
          mobileNumber: "",
          password: "",
          dob: "",
          gender: "",
          location: "",
          profession: "",
        });

        // Navigate to login after 3 seconds
        setTimeout(() => {
          navigate("/login", {
            state: { message: `Đăng ký thành công! Vui lòng vào email ${formData.email} để xác nhận tài khoản của bạn.` }
          });
        }, 3000);
      } else {
        // Handle specific errors from server
        if (result.statusCode === 409) {
          // Email or phone already exists
          setError(result.error);
          
          // Highlight the affected field
          if (result.error.includes("Email")) {
            setFieldErrors({ ...fieldErrors, email: result.error });
          } else if (result.error.includes("Số điện thoại")) {
            setFieldErrors({ ...fieldErrors, mobileNumber: result.error });
          }
        } else if (result.errors) {
          // Validation errors from backend
          setFieldErrors(result.errors);
          setError("Vui lòng sửa các lỗi dưới đây");
        } else {
          // Generic error
          setError(result.error || "Đăng ký thất bại. Vui lòng thử lại.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-4">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Tạo Tài Khoản</h2>
            <p className="text-gray-600">Tham gia cộng đồng của chúng tôi</p>
          </div>

          <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Thông Tin Cơ Bản
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <InputField
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      icon={<User className="h-5 w-5 text-gray-400" />}
                      label="Tên Đầy Đủ"
                      required
                      placeholder="Nhập tên đầy đủ"
                      className={fieldErrors.username ? "border-red-500" : ""}
                    />
                    {fieldErrors.username && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.username}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <InputField
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      icon={<Mail className="h-5 w-5 text-gray-400" />}
                      label="Email"
                      required
                      placeholder="Nhập email"
                      className={fieldErrors.email ? "border-red-500" : ""}
                    />
                    {fieldErrors.email && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <InputField
                      id="mobileNumber"
                      name="mobileNumber"
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      icon={<Phone className="h-5 w-5 text-gray-400" />}
                      label="Số Điện Thoại"
                      required
                      placeholder="Nhập số điện thoại"
                      className={fieldErrors.mobileNumber ? "border-red-500" : ""}
                    />
                    {fieldErrors.mobileNumber && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.mobileNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <InputField
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      icon={<Lock className="h-5 w-5 text-gray-400" />}
                      label="Mật Khẩu"
                      required
                      placeholder="Tạo mật khẩu mạnh (8-25 ký tự)"
                      className={fieldErrors.password ? "border-red-500" : ""}
                    />
                    {fieldErrors.password && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.password}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Thông Tin Cá Nhân
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* DOB */}
                  <div>
                    <InputField
                      id="dob"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      icon={<Calendar className="h-5 w-5 text-gray-400" />}
                      label="Ngày Sinh"
                      className={fieldErrors.dob ? "border-red-500" : ""}
                    />
                    {fieldErrors.dob && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.dob}</span>
                      </div>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      Giới Tính
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`block w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                        fieldErrors.gender ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Chọn Giới Tính</option>
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                      <option value="Other">Khác</option>
                      <option value="Prefer not to say">Không muốn nói</option>
                    </select>
                    {fieldErrors.gender && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{fieldErrors.gender}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Thông Tin Nghề Nghiệp
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    icon={<MapPin className="h-5 w-5 text-gray-400" />}
                    label="Địa Điểm"
                    placeholder="Nhập địa điểm"
                  />

                  <InputField
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    icon={<Briefcase className="h-5 w-5 text-gray-400" />}
                    label="Nghề Nghiệp"
                    placeholder="Nhập nghề nghiệp"
                  />
                </div>
              </div>

              {/* Error Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Success Messages */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800 text-sm font-medium">{successMessage}</p>
                </div>
              )}

              {/* Info Message - Check Email */}
              {successMessage && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-blue-800 text-sm">
                    <p className="font-medium mb-2">Hướng dẫn tiếp theo:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Kiểm tra hộp thư email chính của bạn</li>
                      <li>Nếu không thấy, vui lòng kiểm tra thư mục Spam</li>
                      <li>Nhấp vào link xác nhận trong email để kích hoạt tài khoản</li>
                      <li>Sau đó đăng nhập với email và mật khẩu của bạn</li>
                    </ul>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !!successMessage}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-300 ${isLoading || successMessage
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang Tạo Tài Khoản...
                  </div>
                ) : (
                  "Tạo Tài Khoản"
                )}
              </button>
            </form>
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Đã có tài khoản?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  <Link
                    to="/login"
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-lg"
                  >
                    Đăng nhập tại đây
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Bằng cách tạo tài khoản, bạn đồng ý với{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">Điều Khoản Dịch Vụ</a>
              {" "} và {" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">Chính Sách Bảo Mật</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;