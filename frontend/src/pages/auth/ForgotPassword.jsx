import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import { authService } from "../../api/auth.service";
import { Mail, Send } from "lucide-react";
import { InputField } from "../../Components/common/InputFeild";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await authService.forgotPassword(email);

      if (result.success) {
        // Thông báo thành công (bao gồm cả trường hợp email không tồn tại vì lý do bảo mật)
        setMessage(result.message);
        setEmail(""); // Xóa email sau khi gửi
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 bg-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Send className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Quên Mật Khẩu</h2>
            <p className="text-gray-600">Nhập email của bạn để nhận liên kết đặt lại mật khẩu</p>
          </div>

          <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
            {message ? (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">{message}</p>
                <p className="text-sm text-green-600 mt-2">Vui lòng kiểm tra hộp thư đến (và thư mục Spam) của bạn.</p>
              </div>
            ) : (
              <form autoComplete="off" onSubmit={handleSubmit} className="space-y-6">
                <InputField
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Nhập email đã đăng ký"
                  icon={<Mail className="h-5 w-5 text-gray-500" />}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-1">
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-orange-300 ${isLoading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                    }`}
                >
                  {isLoading ? "Đang gửi..." : "Gửi Yêu Cầu Đặt Lại"}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Quay lại trang Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;