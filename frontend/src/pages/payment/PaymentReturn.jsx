import React, { useEffect } from "react";
import { message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // VNPay trả về vnp_ResponseCode: "00" là thành công
    const responseCode = searchParams.get("vnp_ResponseCode");
    const txnRef = searchParams.get("vnp_TxnRef");

    if (responseCode === "00") {
      message.success("Thanh toán thành công! Bạn đã được ghi danh vào khóa học.");
      // có thể redirect sang learnings hoặc course detail
      setTimeout(() => navigate("/learnings"), 2500);
    } else {
      message.error(
        `Thanh toán thất bại${txnRef ? ` (Mã giao dịch: ${txnRef})` : ""}. Vui lòng thử lại.`
      );
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Thông báo thanh toán</h1>
      <p className="text-gray-600 mb-2">Vui lòng chờ trong giây lát...</p>
    </div>
  );
};

export default PaymentReturn;
