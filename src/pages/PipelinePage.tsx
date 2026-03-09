import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { mockDeals as initialDeals, mockConversations, mockVehicles, PIPELINE_STAGES } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, Car, CreditCard, Calendar, Clock, ArrowRightLeft, ChevronRight, Flame, Snowflake, Sun, MessageSquare, MoreHorizontal, Plus, Filter, RotateCcw, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types/crm";

const paymentLabels: Record<string, string> = {
  a_vista: "À Vista",
  financiamento: "Financiamento",
  troca: "Troca",
  misto: "Misto",
  indefinido: "Indefinido",
};

const PipelinePage = () => {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getDealData = (deal: Deal) => {
    const conv = mockConversations.find(c => c.id === deal.conversation_id);
    const vehicle = deal.vehicle_interest_id ? mockVehicles.find(v => v.id === deal.vehicle_interest_id) : null;
    return { conv, vehicle };
  };

  const interestConfig = (label: string) => {
    if (label === "hot") return { icon: Flame, text: "Quente", className: "lead-badge-hot" };
    if (label === "warm") return { icon: Sun, text: "Morno", className: "lead-badge-warm" };
    return { icon: Snowflake, text: "Frio", className: "lead-badge-cold" };
  };

  const stageTotal = (stageKey: string) => {
    return deals
      .filter(d => d.stage === stageKey)
      .reduce((sum, d) => {
        const v = d.vehicle_interest_id ? mockVehicles.find(v => v.id === d.vehicle_interest_id) : null;
        return sum + (v?.price || 0);
      }, 0);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDeal(dealId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dealId);
  };

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageKey);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain");
    if (!dealId) return;

    setDeals(prev => prev.map(d => {
      if (d.id === dealId && d.stage !== targetStage) {
        const conv = mockConversations.find(c => c.id === d.conversation_id);
        const stageLabel = PIPELINE_STAGES.find(s => s.key === targetStage)?.label || targetStage;
        toast({
          title: `Movido para ${stageLabel}`,
          description: conv?.contact.full_name || "",
        });
        return { ...d, stage: targetStage };
      }
      return d;
    }));
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, d) => {
    const v = d.vehicle_interest_id ? mockVehicles.find(v => v.id === d.vehicle_interest_id) : null;
    return sum + (v?.price || 0);
  }, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)]">
      {/* Header with sticky buttons */}
      <div className="shrink-0 pb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalDeals} negócios · R$ {(totalValue / 1000).toFixed(0)}k em pipeline
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="filter-pill flex items-center gap-2"
            onClick={() => toast({ title: "Filtros", description: "Funcionalidade de filtros será conectada ao backend." })}
          >
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button
            className="filter-pill active flex items-center gap-2"
            onClick={() => toast({ title: "Novo Negócio", description: "Vá até a Inbox e inicie uma conversa para criar um negócio." })}
          >
            <Plus className="w-4 h-4" />
            Novo Negócio
          </button>
        </div>
      </div>

      {/* Scrollable Kanban */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden -mx-6 lg:-mx-8 px-6 lg:px-8">
        <div className="flex gap-4 h-full pb-4" style={{ minWidth: "fit-content" }}>
          {PIPELINE_STAGES.map((stage, stageIdx) => {
            const stageDeals = deals.filter(d => d.stage === stage.key);
            const total = stageTotal(stage.key);
            const isDragOver = dragOverStage === stage.key;

            return (
              <div
                key={stage.key}
                className={cn(
                  "rounded-2xl p-4 flex flex-col transition-all duration-200",
                  isDragOver
                    ? "bg-accent/10 ring-2 ring-accent/30"
                    : "bg-muted/70",
                )}
                style={{ width: 340, minWidth: 340, maxHeight: "100%" }}
                onDragOver={(e) => handleDragOver(e, stage.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-background text-muted-foreground border border-border">
                      {stageDeals.length}
                    </span>
                  </div>
                  {total > 0 && (
                    <span className="text-xs font-semibold text-muted-foreground">
                      R$ {(total / 1000).toFixed(0)}k
                    </span>
                  )}
                </div>

                {/* Scrollable Cards */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: "thin" }}>
                  <AnimatePresence mode="popLayout">
                    {stageDeals.map((deal, i) => {
                      const { conv, vehicle } = getDealData(deal);
                      if (!conv) return null;
                      const interest = interestConfig(conv.ai_interest_label);
                      const InterestIcon = interest.icon;
                      const isExpanded = expandedCard === deal.id;
                      const isDragging = draggedDeal === deal.id;

                      return (
                        <motion.div
                          key={deal.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          draggable
                          onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, deal.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "kanban-card group relative",
                            isDragging && "opacity-50 ring-2 ring-accent",
                          )}
                          onClick={() => setExpandedCard(isExpanded ? null : deal.id)}
                        >
                          {/* Drag Handle */}
                          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>

                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-sm font-semibold text-foreground border border-border">
                                {conv.contact.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{conv.contact.full_name}</p>
                                <p className="text-xs text-muted-foreground">{conv.contact.phone_e164}</p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/inbox?conv=${conv.id}`)}>
                                  <MessageSquare className="w-4 h-4 mr-2" /> Abrir conversa
                                </DropdownMenuItem>
                                {PIPELINE_STAGES.filter(s => s.key !== deal.stage).map(s => (
                                  <DropdownMenuItem key={s.key} onClick={() => {
                                    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage: s.key } : d));
                                    toast({ title: `Movido para ${s.label}`, description: conv.contact.full_name });
                                  }}>
                                    Mover para {s.label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem onClick={() => navigate("/followup")}>
                                  <RotateCcw className="w-4 h-4 mr-2" /> Iniciar Follow-up
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <span className={`${interest.className} flex items-center gap-1`}>
                              <InterestIcon className="w-3 h-3" />
                              {interest.text}
                            </span>
                            <span className="text-xs text-muted-foreground">Score: {conv.ai_interest_score}</span>
                            {conv.source_channel && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground ml-auto">
                                {conv.source_channel}
                              </span>
                            )}
                          </div>

                          {vehicle && (
                            <div
                              className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/80 mb-3 cursor-pointer hover:bg-secondary transition-colors"
                              onClick={(e) => { e.stopPropagation(); navigate("/estoque"); }}
                            >
                              <Car className="w-4 h-4 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {vehicle.make} {vehicle.model} {vehicle.year}
                                </p>
                                <p className="text-[11px] text-muted-foreground">{vehicle.version} • {vehicle.color}</p>
                              </div>
                              <span className="text-sm font-bold whitespace-nowrap">
                                R$ {(vehicle.price / 1000).toFixed(0)}k
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[11px] font-medium gap-1">
                              <CreditCard className="w-3 h-3" />
                              {paymentLabels[deal.payment_type] || deal.payment_type}
                            </Badge>
                            {deal.tradein_description && (
                              <Badge variant="outline" className="text-[11px] font-medium gap-1">
                                <ArrowRightLeft className="w-3 h-3" />
                                Troca
                              </Badge>
                            )}
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 pt-3 border-t space-y-3">
                                  <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                                    <p className="text-[11px] font-semibold text-accent-foreground mb-1 flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" /> Resumo IA
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{conv.ai_summary}</p>
                                  </div>

                                  {deal.tradein_description && (
                                    <div className="text-xs space-y-1">
                                      <p className="font-medium flex items-center gap-1">
                                        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                                        Veículo na troca
                                      </p>
                                      <p className="text-muted-foreground pl-4">{deal.tradein_description}</p>
                                      {deal.tradein_value_expected && (
                                        <p className="font-semibold pl-4">Valor esperado: R$ {deal.tradein_value_expected.toLocaleString("pt-BR")}</p>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex gap-2">
                                    <a
                                      href={`tel:${conv.contact.phone_e164}`}
                                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-xs font-medium hover:bg-muted transition-colors"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <Phone className="w-3.5 h-3.5" /> Ligar
                                    </a>
                                    <button
                                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-xs font-medium hover:bg-muted transition-colors"
                                      onClick={(e) => { e.stopPropagation(); navigate(`/inbox?conv=${conv.id}`); }}
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" /> Chat
                                    </button>
                                    {conv.contact.email && (
                                      <a
                                        href={`mailto:${conv.contact.email}`}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-xs font-medium hover:bg-muted transition-colors"
                                        onClick={e => e.stopPropagation()}
                                      >
                                        <Mail className="w-3.5 h-3.5" /> Email
                                      </a>
                                    )}
                                  </div>

                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Última msg: {format(new Date(conv.last_message_at), "dd MMM, HH:mm", { locale: ptBR })}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {deal.next_action && (
                            <div className="mt-3 pt-3 border-t flex items-start gap-2">
                              <Calendar className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-[11px] text-foreground font-medium">{deal.next_action}</p>
                                {deal.next_action_at && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {format(new Date(deal.next_action_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {stageDeals.length === 0 && (
                    <div className="text-center py-8 text-xs text-muted-foreground rounded-xl border-2 border-dashed border-border/50">
                      Arraste um card aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PipelinePage;
