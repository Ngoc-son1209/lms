import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../Components/common/Navbar";
import { authService } from "../../api/auth.service";
import { Lock } from "lucide-react";
import { InputField } from "../../Components/common/InputFeild";

function ResetPassword() {
  // Lấy token từ URL query parameter (ví dụ: /reset-password?token=XYZ)
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // # NOTE: Kiểm tra token khi component được load
    if (!token) {
      setError("Thiếu token đặt lại mật khẩu. Vui lòng sử dụng liên kết đầy đủ từ email.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (!token) {
      setError("Token không hợp lệ.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 25) {
        setError("Mật khẩu phải có độ dài từ 8 đến 25 ký tự.");
        setIsLoading(false);
        return;
    }


    try {
      const result = await authService.resetPassword(token, newPassword);

      if (result.success) {
        setMessage(result.message);
        // Tự động chuyển hướng về trang đăng nhập sau 3 giây
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi mạng. Vui lòng thử lại.");
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
            <div className="mx-auto h-14 w-14 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Đặt Lại Mật Khẩu</h2>
            <p className="text-gray-600">Vui lòng nhập mật khẩu mới của bạn</p>
          </div>

          <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
            {message && (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">{message}</p>
                <p className="text-sm text-green-600 mt-2">Đang chuyển hướng về trang đăng nhập...</p>
              </div>
            )}

            {!message && (
              <form autoComplete="off" onSubmit={handleSubmit} className="space-y-6">
                <InputField
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  label="Mật Khẩu Mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu mới"
                  icon={<Lock className="h-5 w-5 text-gray-500" />}
                />

                <InputField
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Xác Nhận Mật Khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Xác nhận mật khẩu mới"
                  icon={<Lock className="h-5 w-5 text-gray-500" />}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-1">
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-red-300 ${isLoading || !token
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
                    }`}
                >
                  {isLoading ? "Đang đặt lại..." : "Đặt Lại Mật Khẩu"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;