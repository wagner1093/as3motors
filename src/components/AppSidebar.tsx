import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Kanban, Car, RotateCcw, LogOut, Search, Users, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/inbox", icon: MessageSquare, label: "Inbox" },
  { to: "/pipeline", icon: Kanban, label: "Pipeline" },
  { to: "/estoque", icon: Car, label: "Estoque" },
  { to: "/followup", icon: RotateCcw, label: "Follow-up" },
  { to: "/lista-inteligente", icon: Users, label: "Lista Inteligente" },
  { to: "/repasse", icon: Repeat, label: "Grupos de Repasse" },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({ title: "Você saiu do sistema" });
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex flex-col" style={{ width: "var(--sidebar-width)", background: "hsl(var(--sidebar-bg))" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 cursor-pointer" onClick={() => navigate("/")}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sidebar-accent))" }}>
          <Car className="w-5 h-5" style={{ color: "hsl(var(--sidebar-bg))" }} />
        </div>
        <span className="font-bold text-lg tracking-tight" style={{ color: "hsl(var(--sidebar-active))" }}>AutoCRM</span>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer hover:opacity-80 transition-opacity" style={{ background: "hsl(var(--sidebar-hover))", color: "hsl(var(--sidebar-fg))" }}>
          <Search className="w-4 h-4" />
          <span className="text-xs">Buscar...</span>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ background: "hsl(0 0% 20%)" }}>⌘K</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={`sidebar-link relative ${isActive ? "active" : ""}`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "hsl(var(--sidebar-hover))" }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <button onClick={handleLogout} className="sidebar-link w-full opacity-60 hover:opacity-100">
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
