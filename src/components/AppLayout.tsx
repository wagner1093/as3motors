import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="flex-1" style={{ marginLeft: "var(--sidebar-width)" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
