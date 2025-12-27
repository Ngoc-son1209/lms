import api from "./api";

export const instructorAdminService = {
  restoreInstructor: async (id) => {
    const res = await api.put(`/api/instructors/${id}/restore`);
    return res.data;
  },
};

