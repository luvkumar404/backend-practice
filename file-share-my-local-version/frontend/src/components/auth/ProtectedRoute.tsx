import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import LoadingSkeleton from "../common/LoadingSkeleton";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <main className="page-shell py-10">
        <LoadingSkeleton rows={4} />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
