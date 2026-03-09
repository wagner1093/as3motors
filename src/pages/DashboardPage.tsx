import { mockConversations, mockDeals, mockVehicles, mockEnrollments } from "@/data/mockData";
import { MessageSquare, Flame, TrendingUp, Car, RotateCcw, DollarSign } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color?: string }) => (
  <div className="stat-card flex items-start gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color || "bg-primary/10"}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-0.5">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  </div>
);

const DashboardPage = () => {
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
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={MessageSquare} label="Novos Leads" value={newLeads} sub="Hoje" color="bg-info/10" />
        <StatCard icon={Flame} label="Leads Quentes" value={hotLeads} sub={`${warmLeads} mornos, ${coldLeads} frios`} color="bg-destructive/10" />
        <StatCard icon={TrendingUp} label="Negócios Abertos" value={openDeals} sub={`${wonDeals} ganhos`} color="bg-success/10" />
        <StatCard icon={Car} label="Veículos Disponíveis" value={availableCars} sub={`R$ ${(totalStock / 1000).toFixed(0)}k em estoque`} color="bg-accent/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent conversations */}
        <div className="stat-card">
          <h2 className="font-semibold mb-4">Conversas Recentes</h2>
          <div className="space-y-3">
            {mockConversations.slice(0, 5).map(conv => (
              <div key={conv.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                    {conv.contact.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{conv.contact.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{conv.ai_summary}</p>
                  </div>
                </div>
                <span className={`lead-badge-${conv.ai_interest_label}`}>
                  {conv.ai_interest_label === "hot" ? "🔥 Quente" : conv.ai_interest_label === "warm" ? "🟡 Morno" : "🔵 Frio"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline summary */}
        <div className="stat-card">
          <h2 className="font-semibold mb-4">Pipeline</h2>
          <div className="space-y-3">
            {[
              { stage: "Novos", count: mockDeals.filter(d => d.stage === "new").length },
              { stage: "Qualificados", count: mockDeals.filter(d => d.stage === "qualified").length },
              { stage: "Negociação", count: mockDeals.filter(d => d.stage === "negotiation").length },
              { stage: "Financiamento", count: mockDeals.filter(d => d.stage === "financing").length },
              { stage: "Ganhos", count: wonDeals },
            ].map(item => (
              <div key={item.stage} className="flex items-center justify-between">
                <span className="text-sm">{item.stage}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(item.count / mockDeals.length) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-6 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t flex items-center gap-3">
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{activeFollowups} follow-ups ativos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
