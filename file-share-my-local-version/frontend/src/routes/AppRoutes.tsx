import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import FileDetails from "../pages/FileDetails";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import PublicShare from "../pages/PublicShare";
import Register from "../pages/Register";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/files/:fileId"
        element={
          <ProtectedRoute>
            <FileDetails />
          </ProtectedRoute>
        }
      />
      <Route path="/share/:token" element={<PublicShare />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
