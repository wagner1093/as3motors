import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/inbox": "Inbox",
  "/pipeline": "Pipeline",
  "/estoque": "Estoque",
  "/followup": "Follow-up",
  "/lista-inteligente": "Lista Inteligente",
  "/repasse": "Grupos de Repasse",
  "/ads": "Ads",
};

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = routeTitles[location.pathname] || "AutoCRM";
  const canGoBack = location.pathname !== "/";

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30">
      {/* Left: back + title */}
      <div className="flex items-center gap-3">
        {canGoBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
      </div>

      {/* Right: CTA + search + notifications + avatar */}
      <div className="flex items-center gap-2">
        <Button size="sm" className="rounded-full px-4 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 font-medium text-xs h-9">
          <Plus className="w-3.5 h-3.5" />
          Novo Lead
        </Button>

        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Search className="w-[18px] h-[18px]" />
        </button>

        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </button>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-xs font-bold text-accent-foreground ml-1 cursor-pointer">
          AC
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
