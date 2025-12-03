import { API_BASE_URL } from "./constant";

async function registerInstructor({ fullName, email, password, bio, expertise, mobileNumber, dob, gender, location, profession }) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/instructors/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fullName, email, password, bio, expertise, mobileNumber, dob, gender, location, profession }),
        });

        const data = await response.json();

        if (response.ok) {
            return {
                success: true,
                message: data.message ||
                    "Đăng ký giảng viên thành công. Vui lòng xác thực email và chờ Admin duyệt.",
            };
        } else {
            const errorMessage = data.message || "Registration failed";
            return {
                success: false,
                error: errorMessage,
                statusCode: response.status,
            };
        }
    } catch (error) {
        console.error("Register instructor error:", error);
        return {
            success: false,
            error: "Network error. Please try again.",
        };
    }
}

export const instructorService = {
    registerInstructor,
};

