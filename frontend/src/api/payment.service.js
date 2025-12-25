import api from "./api";

export const paymentService = {
  // # NOTE: API mới - tạo giao dịch thanh toán theo courseId (BE tự lấy price, userId từ JWT)
  createCoursePayment: async (courseId) => {
    const res = await api.post(`/api/payments/course`, { courseId });
    return res.data;
  },

  // Admin xem danh sách thanh toán (API cũ vẫn giữ)
  getAllPayments: async () => {
    const res = await api.get(`/api/vnpay/payments`);
    return res.data;
  },

  // (Legacy) giữ lại nếu cần gọi trực tiếp endpoint cũ
  createPaymentLegacy: async (userId, courseId, amount) => {
    const res = await api.get(`/api/vnpay/create-payment`, {
      params: { userId, courseId, amount },
    });
    return res.data;
  },
};
