import api from "./api";

async function getUserDetails(userId) {
  try {
    const { data } = await api.get(`/api/users/${userId}`);
    return { success: true, data };
  } catch (err) {
    console.error("Error fetching user details:", err);
    return { success: false, error: "Unable to fetch user details" };
  }
}

async function getProfileImage(userId) {
  try {
    const res = await api.get(`/api/users/${userId}/profile-image`, {
      responseType: "blob",
      headers: { "x-skip-404": "1" },
    });
    const blobUrl = URL.createObjectURL(res.data);
    return { success: true, data: blobUrl };
  } catch (err) {
    console.error("Error fetching profile image:", err);
    return { success: false, error: "Unable to fetch profile image" };
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

async function uploadProfileImage(userId, file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    await api.post(`/api/users/${userId}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true };
  } catch (err) {
    console.error("Error uploading profile image:", err);
    return { success: false, error: "Unable to upload image" };
  }
}

async function getInstructorProfile() {
  try {
    const { data } = await api.get(`/api/instructors/me`);
    return { success: true, data };
  } catch (err) {
    console.error("Error fetching instructor profile:", err);
    return { success: false, error: "Unable to fetch instructor profile" };
  }
}

async function updateInstructorProfile(updatedData) {
  try {
    const { data } = await api.put(`/api/instructors/me`, updatedData);
    return { success: true, data };
  } catch (err) {
    console.error("Error updating instructor profile:", err);
    return { success: false, error: "Unable to update instructor profile" };
  }
}

export const profileService = {
  getUserDetails,
  getProfileImage,
  uploadProfileImage,
  updateUser,
  getInstructorProfile,
  updateInstructorProfile,
};
