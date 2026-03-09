import { mockDeals, mockConversations, mockVehicles, PIPELINE_STAGES } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const PipelinePage = () => {
  const getDealData = (deal: typeof mockDeals[0]) => {
    const conv = mockConversations.find(c => c.id === deal.conversation_id);
    const vehicle = deal.vehicle_interest_id ? mockVehicles.find(v => v.id === deal.vehicle_interest_id) : null;
    return { conv, vehicle };
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pipeline de Negociações</h1>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(stage => {
          const stageDeals = mockDeals.filter(d => d.stage === stage.key);
          return (
            <div key={stage.key} className="kanban-column min-w-[260px] max-w-[280px]">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-sm font-semibold">{stage.label}</h3>
                <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">{stageDeals.length}</span>
              </div>
              <div className="space-y-2 flex-1">
                {stageDeals.map(deal => {
                  const { conv, vehicle } = getDealData(deal);
                  if (!conv) return null;
                  return (
                    <div key={deal.id} className="kanban-card">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-sm">{conv.contact.full_name}</span>
                        <span className={`lead-badge-${conv.ai_interest_label} text-[10px]`}>
                          {conv.ai_interest_label === "hot" ? "🔥" : conv.ai_interest_label === "warm" ? "🟡" : "🔵"}
                          {conv.ai_interest_score}
                        </span>
                      </div>
                      {vehicle && (
                        <p className="text-xs text-muted-foreground">
                          {vehicle.make} {vehicle.model} {vehicle.year}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{deal.payment_type}</Badge>
                        {vehicle && <span className="text-xs font-semibold">R$ {(vehicle.price / 1000).toFixed(0)}k</span>}
                      </div>
                      {deal.next_action && (
                        <p className="text-[10px] text-muted-foreground mt-2 border-t pt-1.5">{deal.next_action}</p>
                      )}
                    </div>
                  );
                })}
                {stageDeals.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">Nenhum negócio</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelinePage;
