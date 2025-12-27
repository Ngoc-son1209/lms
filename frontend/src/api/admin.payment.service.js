import api from "./api";

export const adminPaymentService = {
  listPayments: async (status) => {
    const params = {};
    if (status) params.status = status;
    const res = await api.get(`/api/admin/payments`, { params });
    return res.data;
  },

  getPaymentDetail: async (paymentId) => {
    const res = await api.get(`/api/admin/payments/${paymentId}`);
    return res.data;
  },
};
