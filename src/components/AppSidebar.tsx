import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Kanban, Car, RotateCcw, LogOut } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/inbox", icon: MessageSquare, label: "Inbox" },
  { to: "/pipeline", icon: Kanban, label: "Pipeline" },
  { to: "/estoque", icon: Car, label: "Estoque" },
  { to: "/followup", icon: RotateCcw, label: "Follow-up" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex flex-col" style={{ width: "var(--sidebar-width)", background: "hsl(var(--sidebar-bg))" }}>
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--sidebar-accent))" }}>
          <Car className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
        </div>
        <span className="font-bold text-lg" style={{ color: "hsl(var(--sidebar-active))" }}>AutoCRM</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5">
        <button className="sidebar-link w-full">
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
