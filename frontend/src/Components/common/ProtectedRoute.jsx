import { Navigate } from "react-router-dom";
import { authService } from "../../api/auth.service";

export const AdminRoute = ({ children }) => {
  const isAdmin = authService.isAdminAuthenticated();
  return isAdmin ? children : <Navigate to="/login" replace />;
};

export const UserRoute = ({ children }) => {
  const isUser = authService.isUserAuthenticated();
  return isUser ? children : <Navigate to="/login" replace />;
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
