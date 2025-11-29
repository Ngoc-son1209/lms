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
