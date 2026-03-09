import { useNavigate } from "react-router-dom";
import { mockConversations, mockDeals, mockVehicles, mockEnrollments } from "@/data/mockData";
import { MessageSquare, Flame, TrendingUp, Car, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const StatCard = ({ icon: Icon, label, value, sub, color, delay, onClick }: { icon: any; label: string; value: string | number; sub?: string; color?: string; delay?: number; onClick?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay || 0, duration: 0.4 }}
    className={`stat-card flex items-start gap-4 ${onClick ? "cursor-pointer" : ""}`}
    onClick={onClick}
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color || "bg-primary/5"}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const newLeads = mockConversations.filter(c => c.status === "new").length;
  const hotLeads = mockConversations.filter(c => c.ai_interest_label === "hot").length;
  const warmLeads = mockConversations.filter(c => c.ai_interest_label === "warm").length;
  const coldLeads = mockConversations.filter(c => c.ai_interest_label === "cold").length;
  const openDeals = mockDeals.filter(d => !["won", "lost"].includes(d.stage)).length;
  const wonDeals = mockDeals.filter(d => d.stage === "won").length;
  const availableCars = mockVehicles.filter(v => v.status === "available").length;
  const activeFollowups = mockEnrollments.filter(e => e.status === "active").length;
  const totalStock = mockVehicles.reduce((acc, v) => acc + v.price, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral do seu CRM automotivo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon={MessageSquare} label="Novos Leads" value={newLeads} sub="Hoje" color="bg-info/10" delay={0} onClick={() => navigate("/inbox")} />
        <StatCard icon={Flame} label="Leads Quentes" value={hotLeads} sub={`${warmLeads} mornos · ${coldLeads} frios`} color="bg-destructive/10" delay={0.05} onClick={() => navigate("/inbox")} />
        <StatCard icon={TrendingUp} label="Negócios Abertos" value={openDeals} sub={`${wonDeals} ganhos`} color="bg-success/10" delay={0.1} onClick={() => navigate("/pipeline")} />
        <StatCard icon={Car} label="Veículos Disponíveis" value={availableCars} sub={`R$ ${(totalStock / 1000).toFixed(0)}k em estoque`} color="bg-accent/15" delay={0.15} onClick={() => navigate("/estoque")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">Conversas Recentes</h2>
            <button onClick={() => navigate("/inbox")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Ver todas →</button>
          </div>
          <div className="space-y-1">
            {mockConversations.slice(0, 5).map(conv => (
              <div key={conv.id} onClick={() => navigate(`/inbox?conv=${conv.id}`)}
                className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/5 border border-border flex items-center justify-center text-sm font-semibold">
                    {conv.contact.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{conv.contact.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[220px]">{conv.ai_summary}</p>
                  </div>
                </div>
                <span className={`lead-badge-${conv.ai_interest_label}`}>
                  {conv.ai_interest_label === "hot" ? "🔥 Quente" : conv.ai_interest_label === "warm" ? "🟡 Morno" : "🔵 Frio"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="stat-card cursor-pointer" onClick={() => navigate("/pipeline")}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">Pipeline</h2>
            <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">Ver pipeline →</span>
          </div>
          <div className="space-y-4">
            {[
              { stage: "Novos", count: mockDeals.filter(d => d.stage === "new").length },
              { stage: "Qualificados", count: mockDeals.filter(d => d.stage === "qualified").length },
              { stage: "Negociação", count: mockDeals.filter(d => d.stage === "negotiation").length },
              { stage: "Financiamento", count: mockDeals.filter(d => d.stage === "financing").length },
              { stage: "Ganhos", count: wonDeals },
            ].map(item => (
              <div key={item.stage} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.stage}</span>
                <div className="flex items-center gap-3">
                  <div className="w-36 h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / mockDeals.length) * 100}%` }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    />
                  </div>
                  <span className="text-sm font-bold w-6 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t flex items-center gap-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate("/followup"); }}>
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">{activeFollowups} follow-ups ativos →</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
