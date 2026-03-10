import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, MessageSquare, DollarSign, Car, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  lead: MessageSquare,
  deal: DollarSign,
  followup: RotateCcw,
  vehicle: Car,
};

const colorMap: Record<string, string> = {
  lead: "text-blue-500 bg-blue-500/10",
  deal: "text-green-500 bg-green-500/10",
  followup: "text-amber-500 bg-amber-500/10",
  vehicle: "text-purple-500 bg-purple-500/10",
};

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  };

  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);
    fetchNotifications();
  };

  const handleClick = async (notif: any) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    navigate("/conversations");
    setOpen(false);
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative">
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 p-0 rounded-2xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Marcar todas como lidas
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">
              Nenhuma notificação
            </p>
          ) : (
            notifications.map((notif) => {
              const type = notif.type || "lead";
              const Icon = iconMap[type] || MessageSquare;
              return (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0 ${
                    !notif.read ? "bg-accent/5" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      colorMap[type] || colorMap.lead
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        !notif.read
                          ? "font-semibold text-foreground"
                          : "font-medium text-foreground/80"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(notif.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs rounded-full"
            onClick={() => { navigate("/configuracoes"); setOpen(false); }}
          >
            Configurar notificações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
