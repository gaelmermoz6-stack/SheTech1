import { createBrowserRouter, Navigate } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Formations from "./Formations";
import Projets from "./Projets";
import Community from "./Community";
import Certificats from "./Certificats";
import AdminDashboard from "./AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  {
    path: "/dashboard",
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "formations", element: <Formations /> },
      { path: "projets", element: <Projets /> },
      { path: "communaute", element: <Community /> },
      { path: "certificats", element: <Certificats /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminRoute><AdminDashboard /></AdminRoute>,
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
