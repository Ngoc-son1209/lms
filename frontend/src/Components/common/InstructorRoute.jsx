import { Navigate } from "react-router-dom";
import { authService } from "../../api/auth.service";

export const InstructorRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Chỉ cho phép nếu có token và role là ROLE_INSTRUCTOR
  const isInstructor = token && role === "ROLE_INSTRUCTOR";

  return isInstructor ? children : <Navigate to="/login" replace />;
};
