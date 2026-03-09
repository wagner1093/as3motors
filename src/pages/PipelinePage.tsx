import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockDeals, mockConversations, mockVehicles, PIPELINE_STAGES } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, Car, CreditCard, Calendar, Clock, ArrowRightLeft, ChevronRight, Flame, Snowflake, Sun, MessageSquare, MoreHorizontal, Plus, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const paymentLabels: Record<string, string> = {
  a_vista: "À Vista",
  financiamento: "Financiamento",
  troca: "Troca",
  misto: "Misto",
  indefinido: "Indefinido",
};

const PipelinePage = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getDealData = (deal: typeof mockDeals[0]) => {
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
    return mockDeals
      .filter(d => d.stage === stageKey)
      .reduce((sum, d) => {
        const v = d.vehicle_interest_id ? mockVehicles.find(v => v.id === d.vehicle_interest_id) : null;
        return sum + (v?.price || 0);
      }, 0);
  };

  return (
    <div className="p-8">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Pipeline</h1>
          <p>Acompanhe suas negociações em cada etapa</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="filter-pill flex items-center gap-2"
            onClick={() => toast({ title: "Filtros", description: "Funcionalidade de filtros será conectada ao backend." })}>
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button className="filter-pill active flex items-center gap-2"
            onClick={() => toast({ title: "Novo Negócio", description: "Vá até a Inbox e inicie uma conversa para criar um negócio." })}>
            <Plus className="w-4 h-4" />
            Novo Negócio
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2">
        {PIPELINE_STAGES.map((stage, stageIdx) => {
          const stageDeals = mockDeals.filter(d => d.stage === stage.key);
          const total = stageTotal(stage.key);
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stageIdx * 0.05, duration: 0.4 }}
              className="kanban-column min-w-[320px] max-w-[340px]"
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                    {stageDeals.length}
                  </span>
                </div>
                {total > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">
                    R$ {(total / 1000).toFixed(0)}k
                  </span>
                )}
              </div>

              <div className="space-y-3 flex-1">
                <AnimatePresence>
                  {stageDeals.map((deal, i) => {
                    const { conv, vehicle } = getDealData(deal);
                    if (!conv) return null;
                    const interest = interestConfig(conv.ai_interest_label);
                    const InterestIcon = interest.icon;
                    const isExpanded = expandedCard === deal.id;

                    return (
                      <motion.div
                        key={deal.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.03, duration: 0.3 }}
                        className="kanban-card"
                        onClick={() => setExpandedCard(isExpanded ? null : deal.id)}
                      >
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
                              <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary"
                                onClick={e => e.stopPropagation()}>
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/inbox?conv=${conv.id}`)}>
                                <MessageSquare className="w-4 h-4 mr-2" /> Abrir conversa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                toast({ title: "✅ Negócio marcado como Ganho", description: conv.contact.full_name });
                              }}>
                                ✅ Marcar como Ganho
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                toast({ title: "❌ Negócio marcado como Perdido", description: conv.contact.full_name, variant: "destructive" });
                              }}>
                                ❌ Marcar como Perdido
                              </DropdownMenuItem>
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
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/80 mb-3 cursor-pointer hover:bg-secondary transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate("/estoque"); }}>
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
                                  <a href={`tel:${conv.contact.phone_e164}`}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-xs font-medium hover:bg-muted transition-colors"
                                    onClick={e => e.stopPropagation()}>
                                    <Phone className="w-3.5 h-3.5" /> Ligar
                                  </a>
                                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-xs font-medium hover:bg-muted transition-colors"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/inbox?conv=${conv.id}`); }}>
                                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                                  </button>
                                  {conv.contact.email && (
                                    <a href={`mailto:${conv.contact.email}`}
                                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-xs font-medium hover:bg-muted transition-colors"
                                      onClick={e => e.stopPropagation()}>
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
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Nenhum negócio
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelinePage;
