import api from "./api";

export const exportService = {
  exportPayments: async () => {
    const res = await api.get(`/api/admin/export/payments.xlsx`, { responseType: "blob" });
    downloadBlob(res.data, "payments.xlsx");
  },

  exportInstructors: async () => {
    const res = await api.get(`/api/admin/export/instructors.xlsx`, { responseType: "blob" });
    downloadBlob(res.data, "instructors.xlsx");
  },

  exportStudents: async () => {
    const res = await api.get(`/api/admin/export/students.xlsx`, { responseType: "blob" });
    downloadBlob(res.data, "students.xlsx");
  },
};

function downloadBlob(blobData, filename) {
  const blob = new Blob([blobData], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
