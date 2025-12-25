import api from "./api";

export const adminClassStudentsService = {
  listStudentsInClass: async (classSectionId) => {
    const res = await api.get(`/api/admin/classes/${classSectionId}/students`);
    return res.data;
  },

  assignStudentToClass: async (classSectionId, userId) => {
    const res = await api.post(`/api/admin/classes/${classSectionId}/students`, { userId });
    return res.data;
  },

  moveStudent: async (fromClassId, userId, toClassSectionId) => {
    const res = await api.put(`/api/admin/classes/${fromClassId}/students/${userId}/move`, {
      toClassSectionId,
    });
    return res.data;
  },

  listUnassigned: async (courseId) => {
    const res = await api.get(`/api/admin/students/unassigned`, {
      params: courseId ? { courseId } : {},
    });
    return res.data;
  },
};

