import axios from "axios";
import { API_BASE_URL } from "./constant";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

async function getAllCourses() {
  try {
    const { data } = await api.get("/api/courses");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { success: false, error: "Could not fetch courses" };
  }
}


async function getAllCoursesWithCount() {
  try {
    const { data } = await api.get("/api/courses/with-count");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching courses with count:", error);
    return { success: false, error: "Could not fetch courses with count" };
  }
}

// Fallbacks to keep instructor pages working: map "my" endpoints to common ones
async function getMyCourses() {
  return getAllCourses();
}

async function getMyCoursesWithCount() {
  return getAllCoursesWithCount();
}


async function getCourseById(courseId) {
  try {
    const { data } = await api.get(`/api/courses/${courseId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching course:", error);
    return { success: false, error: "Could not fetch course details" };
  }
}

async function createCourse(courseData) {
  try {
    const { data } = await api.post("/api/courses", courseData);
    return { success: true, data };
  } catch (error) {
    console.error("Error creating course:", error);
    return { success: false, error: "Could not create course" };
  }
}

async function updateCourse(courseId, courseData) {
  try {
    const { data } = await api.put(`/api/courses/${courseId}`, courseData);
    return { success: true, data };
  } catch (error) {
    console.error("Error updating course:", error);
    return { success: false, error: "Could not update course" };
  }
}

async function deleteCourse(courseId) {
  try {
    const { data } = await api.delete(`/api/courses/${courseId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { success: false, error: "Could not delete course" };
  }
}

async function getAllUsers() {
  try {
    const { data } = await api.get("/api/users");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Could not fetch users" };
  }
}

async function getAllLearning() {
  try {
    const { data } = await api.get("/api/learning");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return { success: false, error: "Could not fetch enrollments" };
  }
}

async function updateUser(userId, updatedData) {
  try {
    const { data } = await api.put(`/api/users/${userId}`, updatedData);
    return { success: true, data };
  } catch (err) {
    console.error("Error updating user:", err);
    return { success: false, error: "Unable to update user" };
  }
}

async function createQuestion(questionData) {
  try {
    const { data } = await api.post("/api/questions", questionData);
    return { success: true, data };
  } catch (err) {
    console.error("Error creating question:", err);
    return { success: false, error: err.response?.data?.message || "Unable to create question" };
  }
}

async function updateQuestion(questionId, questionData) {
  try {
    const { data } = await api.put(`/api/questions/${questionId}`, questionData);
    return { success: true, data };
  } catch (err) {
    console.error("Error updating question:", err);
    return { success: false, error: err.response?.data?.message || "Unable to update question" };
  }
}

async function deleteQuestion(questionId) {
  try {
    await api.delete(`/api/questions/${questionId}`);
    return { success: true };
  } catch (err) {
    console.error("Error deleting question:", err);
    return { success: false, error: err.response?.data?.message || "Unable to delete question" };
  }
}

async function getPendingInstructors() {
  try {
    const { data } = await api.get("/api/instructors/pending");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching pending instructors:", error);
    return { success: false, error: "Could not fetch pending instructors" };
  }
}

async function getApprovedInstructors() {
  try {
    const { data } = await api.get("/api/instructors/approved");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching approved instructors:", error);
    return { success: false, error: "Could not fetch approved instructors" };
  }
}

async function getResignedInstructors() {
  try {
    const { data } = await api.get("/api/instructors/resigned");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching resigned instructors:", error);
    return { success: false, error: "Could not fetch resigned instructors" };
  }
}

async function approveInstructor(id) {
  try {
    const { data } = await api.put(`/api/instructors/${id}/approve`);
    return { success: true, data };
  } catch (error) {
    console.error("Error approving instructor:", error);
    return { success: false, error: error.response?.data?.message || "Could not approve instructor" };
  }
}

async function updateInstructor(id, payload) {
  try {
    const { data } = await api.put(`/api/instructors/${id}`, payload);
    return { success: true, data };
  } catch (error) {
    console.error("Error updating instructor:", error);
    return { success: false, error: error.response?.data?.message || "Could not update instructor" };
  }
}

async function rejectInstructor(id, reason) {
  try {
    const { data } = await api.post(`/api/instructors/${id}/reject`, { reason });
    return { success: true, data };
  } catch (error) {
    console.error("Error rejecting instructor:", error);
    return { success: false, error: error.response?.data?.message || "Could not reject instructor" };
  }
}

async function resignInstructor(id) {
  try {
    const { data } = await api.delete(`/api/instructors/${id}`);
    return { success: true, data };
  } catch (error) {
    console.error("Error resigning instructor:", error);
    return { success: false, error: error.response?.data?.message || "Could not resign instructor" };
  }
}

async function getStudents() {
  try {
    const { data } = await api.get("/api/users/students");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { success: false, error: "Could not fetch students" };
  }
}

// Instructor helpers
async function getStudentsByCourse(courseId) {
  try {
    const { data } = await api.get(`/api/learning/course/${courseId}/students`);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching course students:", error);
    return { success: false, error: "Could not fetch course students" };
  }
}

async function getInstructorStudents(courseId, classSectionId) {
  try {
    const params = {};
    if (courseId) params.courseId = courseId;
    if (classSectionId) params.classSectionId = classSectionId;
    
    const { data } = await api.get(`/api/learning/instructor/students`, { params });
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching instructor students:", error);
    return { success: false, error: "Could not fetch instructor students" };
  }
}

async function getInstructorClasses(courseId) {
  try {
    const params = {};
    if (courseId) params.courseId = courseId;
    
    const { data } = await api.get(`/api/learning/instructor/classes`, { params });
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching instructor classes:", error);
    return { success: false, error: "Could not fetch instructor classes" };
  }
}

async function getFeedbacks(courseId) {
  try {
    const { data } = await api.get(`/api/feedbacks/${courseId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return { success: false, error: "Could not fetch feedbacks" };
  }
}

async function getClassesByCourse(courseId) {
  try {
    const { data } = await api.get(`/api/classes/by-course/${courseId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching classes:", error);
    return { success: false, error: "Could not fetch classes" };
  }
}

async function createClassSection(payload) {
  try {
    const { data } = await api.post(`/api/classes`, payload);
    return { success: true, data };
  } catch (error) {
    console.error("Error creating class:", error);
    return { success: false, error: error.response?.data?.message || "Could not create class" };
  }
}

async function updateClassSection(id, payload) {
  try {
    const { data } = await api.put(`/api/classes/${id}`, payload);
    return { success: true, data };
  } catch (error) {
    console.error("Error updating class:", error);
    return { success: false, error: error.response?.data?.message || "Could not update class" };
  }
}

async function deleteClassSection(id) {
  try {
    await api.delete(`/api/classes/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting class:", error);
    return { success: false, error: error.response?.data?.message || "Could not delete class" };
  }
}

export const adminService = {
  getAllCourses,
  getMyCourses,
  getAllCoursesWithCount,
  getMyCoursesWithCount,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllUsers,
  updateUser,
  getAllLearning,
  getPendingInstructors,
  getApprovedInstructors,
  getResignedInstructors,
  approveInstructor,
  updateInstructor,
  rejectInstructor,
  resignInstructor,
  getStudents,
  getStudentsByCourse,
  getInstructorStudents,
  getInstructorClasses,
  getFeedbacks,
  getClassesByCourse,
  createClassSection,
  updateClassSection,
  deleteClassSection,
};