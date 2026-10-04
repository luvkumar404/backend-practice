import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, UploadCloud } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white">
            <ShieldCheck size={19} />
          </span>
          <span>SecureShare</span>
        </Link>

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `hidden rounded-lg px-3 py-2 text-sm font-medium sm:inline-flex ${
                    isActive ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:text-slate-950"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <span className="hidden max-w-48 truncate text-sm text-slate-500 md:block">
                {user?.email}
              </span>
              <button onClick={handleLogout} className="btn-secondary px-3" type="button">
                <LogOut size={17} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                <UploadCloud size={17} />
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
