import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar />
      <main className="flex-1 min-h-screen p-6 lg:p-8" style={{ marginLeft: "var(--sidebar-width)" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
