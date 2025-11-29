import React, { useEffect } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    message.success("Thanh toán thành công! Bạn đã được ghi danh vào khóa học 🎉");
    setTimeout(() => navigate("/learnings"), 3000);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ✅ Thanh toán thành công!
      </h1>
      <p className="text-gray-600 mb-2">
        Bạn sẽ được chuyển đến trang khóa học trong giây lát...
      </p>
    </div>
  );
};

export default PaymentSuccess;
