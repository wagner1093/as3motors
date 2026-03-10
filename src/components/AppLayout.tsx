import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { supabase } from "@/integrations/supabase/client";

const AppLayout = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verifica sessão ao carregar
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate("/login");
      setChecking(false);
    });

    // Ouve mudanças (logout / expiração)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  if (checking) return null;

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        <AppHeader />
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
