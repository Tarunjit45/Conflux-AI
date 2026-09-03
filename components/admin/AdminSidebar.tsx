import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../../lib/authContext";

const logo = "/logo.png";

const navigation = [
  { label: "Location coverage", path: "/admin/location-coverage", icon: Map },
  { label: "Content management", path: "/admin/cms", icon: FileText },
];

export const AdminSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const closeOnNavigate = () => setIsOpen(false);
  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open admin navigation"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg lg:hidden"
      >
        <Menu size={19} />
      </button>

      {isOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-slate-300 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link
            to="/admin/businesses"
            onClick={closeOnNavigate}
            className="flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-cyan-400 text-slate-950">
              <img
                src={logo}
                alt="Conflux logo"
                className="h-7 w-7 object-contain"
              />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-wide text-white">
                CONFLUX AI
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                Admin console
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>
          <nav className="space-y-1">
            <Link
              to="/admin/businesses"
              onClick={closeOnNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${location.pathname === "/admin/businesses" ? "bg-cyan-400 text-slate-950" : "hover:bg-white/10 hover:text-white"}`}
            >
              <LayoutDashboard size={17} /> Business graph
            </Link>
            {navigation.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={closeOnNavigate}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${location.pathname === path ? "bg-white/10 text-white" : "hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={17} /> {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">
              {(user?.fullName || user?.email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.fullName || "Administrator"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user?.email || "Admin access"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="min-h-screen bg-[#f4f7fb] lg:flex lg:h-screen lg:overflow-hidden">
    <AdminSidebar />
    <main className="min-w-0 flex-1 pt-16 lg:h-screen lg:overflow-y-auto lg:pt-0">
      {children}
    </main>
  </div>
);
