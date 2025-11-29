import api from "./api";

export const paymentService = {
  // Gọi BE tạo URL thanh toán
  createPayment: async (userId, courseId, amount) => {
    const res = await api.get(`/api/vnpay/create-payment`, {
      params: { userId, courseId, amount },
    });
    return res.data;
  },

  // Admin xem danh sách thanh toán
  getPayments: async () => {
    const res = await api.get(`api/vnpay/payments`);
    return res.data;
  },
};
