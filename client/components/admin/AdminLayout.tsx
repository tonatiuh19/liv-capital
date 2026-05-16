import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  Building2,
  Users,
  Sparkles,
  MapPin,
  Images,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutAdmin } from "@/store/slices/adminSlice";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/visitas", label: "Visitas", icon: CalendarDays },
  { to: "/admin/contactos", label: "Contactos", icon: MessageSquare },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/modelos", label: "Modelos", icon: Building2 },
  { to: "/admin/amenidades", label: "Amenidades", icon: Sparkles },
  { to: "/admin/galeria", label: "Galería", icon: Images },
  { to: "/admin/ubicacion", label: "Ubicación / Mapa", icon: MapPin },
  {
    to: "/admin/administradores",
    label: "Administradores",
    icon: Users,
    superadminOnly: true,
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((s) => s.admin);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutAdmin());
    navigate("/admin/login", { replace: true });
  };

  const navItems = NAV_ITEMS.filter(
    (item) => !item.superadminOnly || admin?.role === "superadmin",
  );

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`flex flex-col bg-navy h-full ${mobile ? "w-64" : "w-64 min-h-screen"}`}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <img
          src="/images/logo_liv_white.png"
          alt="LIV Capital"
          className="h-8 w-auto"
        />
        <p className="font-montserrat text-white/30 text-[10px] tracking-widest mt-1 uppercase">
          Panel Admin
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 font-montserrat text-sm transition-colors ${
                active
                  ? "bg-white/10 text-sand border-r-2 border-sand"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Admin info + logout */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-sand/20 rounded-full flex items-center justify-center">
            <span className="text-sand font-montserrat font-bold text-sm">
              {admin?.name?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-montserrat text-white text-sm font-medium truncate">
              {admin?.name}
            </p>
            <p className="font-montserrat text-white/30 text-xs capitalize">
              {admin?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 font-montserrat text-sm text-white/40 hover:text-white hover:bg-white/5 rounded-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-stone-light">
      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-0 h-screen flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden bg-white border-b border-stone-warm/30 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-navy hover:bg-stone-light rounded-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img
            src="/images/logo_liv_color.png"
            alt="LIV Capital"
            className="h-7 w-auto"
          />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
