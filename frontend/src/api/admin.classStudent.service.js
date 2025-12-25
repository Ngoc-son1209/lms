import api from "./api";

export const adminClassStudentService = {
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

  listUnassignedStudents: async (courseId) => {
    const params = {};
    if (courseId) params.courseId = courseId;
    const res = await api.get(`/api/admin/students/unassigned`, { params });
    return res.data;
  },
};

