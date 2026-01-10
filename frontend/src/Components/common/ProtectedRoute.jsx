import { Navigate } from "react-router-dom";
import { authService } from "../../api/auth.service";

export const AdminRoute = ({ children }) => {
  const isAdmin = authService.isAdminAuthenticated();
  return isAdmin ? children : <Navigate to="/login" replace />;
};

export const UserRoute = ({ children }) => {
  const user = authService.getCurrentUser();

  // Chặn cứng: chỉ chặn ADMIN vào các màn của học viên.
  // USER và INSTRUCTOR vẫn được vào.
  if (!user?.token) return <Navigate to="/login" replace />;

  if (user.role === "ROLE_ADMIN") {
    return <Navigate to="/admin" replace />;
  }


  return children;
};

// Chặn riêng các màn chỉ dành cho HỌC VIÊN (không cho giảng viên vào)
export const StudentOnlyRoute = ({ children }) => {
  const user = authService.getCurrentUser();

  if (!user?.token) return <Navigate to="/login" replace />;

  if (user.role === "ROLE_ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === "ROLE_INSTRUCTOR") {
    return <Navigate to="/instructor/courses" replace />;
  }

  // Chỉ cho học viên
  if (user.role !== "ROLE_USER") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const InstructorRoute = ({ children }) => {
  const isInstructor = authService.isInstructorAuthenticated();
  return isInstructor ? children : <Navigate to="/login" replace />;
};

// Block guests-only routes when already authenticated
export const GuestRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  if (user?.token) {
    const role = user.role;
    const to = role === "ROLE_ADMIN" ? "/admin" : role === "ROLE_INSTRUCTOR" ? "/instructor/courses" : "/courses";
    return <Navigate to={to} replace />;
  }
  return children;
};
