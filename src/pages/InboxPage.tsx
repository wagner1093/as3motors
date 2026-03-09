import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mockConversations, mockMessages, mockDeals, mockVehicles } from "@/data/mockData";
import { Search, Send, Flame, Snowflake, Sun, Bot, Car, CreditCard, ArrowRightLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const InboxPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const initialConv = searchParams.get("conv") || mockConversations[0]?.id || "";
  const [selectedId, setSelectedId] = useState<string>(initialConv);
  const [search, setSearch] = useState("");
  const [filterInterest, setFilterInterest] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<Record<string, typeof mockMessages["conv1"]>>({ ...mockMessages });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conv = searchParams.get("conv");
    if (conv) setSelectedId(conv);
  }, [searchParams]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, localMessages]);

  const filtered = mockConversations.filter(c => {
    const matchSearch = c.contact.full_name.toLowerCase().includes(search.toLowerCase()) || c.contact.phone_e164.includes(search);
    const matchInterest = filterInterest === "all" || c.ai_interest_label === filterInterest;
    return matchSearch && matchInterest;
  });

  const selected = mockConversations.find(c => c.id === selectedId);
  const messages = localMessages[selectedId] || [];
  const deal = mockDeals.find(d => d.conversation_id === selectedId);
  const vehicle = deal?.vehicle_interest_id ? mockVehicles.find(v => v.id === deal.vehicle_interest_id) : null;

  const interestIcon = (label: string) => {
    if (label === "hot") return <Flame className="w-3.5 h-3.5" />;
    if (label === "warm") return <Sun className="w-3.5 h-3.5" />;
    return <Snowflake className="w-3.5 h-3.5" />;
  };

  const handleSend = () => {
    if (!newMessage.trim() || !selectedId) return;
    const msg = {
      id: `m-${Date.now()}`,
      conversation_id: selectedId,
      direction: "outbound" as const,
      text: newMessage.trim(),
      sent_at: new Date().toISOString(),
    };
    setLocalMessages(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), msg],
    }));
    setNewMessage("");
    toast({ title: "Mensagem enviada" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen">
      {/* Conversation list */}
      <div className="w-[360px] border-r flex flex-col glass-panel">
        <div className="p-4 border-b space-y-3">
          <h2 className="font-semibold text-lg">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar contato..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl glass-input border-0" />
          </div>
          <div className="flex gap-1.5">
            {[{ key: "all", label: "Todos" }, { key: "hot", label: "🔥 Quentes" }, { key: "warm", label: "🟡 Mornos" }, { key: "cold", label: "🔵 Frios" }].map(f => (
              <button key={f.key} onClick={() => setFilterInterest(f.key)}
                className={`filter-pill text-xs ${filterInterest === f.key ? "active" : ""}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(conv => (
            <motion.button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left p-4 border-b border-border/30 transition-all duration-200 ${selectedId === conv.id ? "bg-accent/5 border-l-2 border-l-accent" : "hover:bg-muted/30"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/5 border border-border flex items-center justify-center text-sm font-semibold shrink-0">
                  {conv.contact.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{conv.contact.full_name}</span>
                    <span className={`lead-badge-${conv.ai_interest_label} flex items-center gap-1 text-[11px]`}>
                      {interestIcon(conv.ai_interest_label)}
                      {conv.ai_interest_score}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">{conv.ai_summary}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-muted-foreground">{format(new Date(conv.last_message_at), "HH:mm", { locale: ptBR })}</span>
                    {conv.source_channel && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{conv.source_channel}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="p-4 border-b glass-panel flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/5 border border-border flex items-center justify-center text-sm font-semibold">
                  {selected.contact.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selected.contact.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selected.contact.phone_e164}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs rounded-full">{selected.status}</Badge>
                <span className={`lead-badge-${selected.ai_interest_label}`}>
                  {selected.ai_interest_label === "hot" ? "Quente" : selected.ai_interest_label === "warm" ? "Morno" : "Frio"}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-background">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={msg.direction === "outbound" ? "chat-bubble-outbound" : "chat-bubble-inbound"}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1.5 ${msg.direction === "outbound" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                        {format(new Date(msg.sent_at), "HH:mm")}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t glass-panel flex gap-3">
              <Input placeholder="Digite uma mensagem..." value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-xl glass-input border-0 h-11" />
              <Button size="icon" className="rounded-xl h-11 w-11 shadow-md" onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Selecione uma conversa</div>
        )}
      </div>

      {/* AI Panel */}
      {selected && (
        <div className="w-[320px] border-l glass-panel p-5 overflow-y-auto space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold">Análise IA</h3>
            </div>
             <div className="p-3 rounded-xl bg-muted/40 backdrop-blur-sm border border-border/30">
              <p className="text-sm text-muted-foreground leading-relaxed">{selected.ai_summary}</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`lead-badge-${selected.ai_interest_label}`}>
                {selected.ai_interest_label === "hot" ? "🔥 Quente" : selected.ai_interest_label === "warm" ? "🟡 Morno" : "🔵 Frio"}
              </span>
              <span className="text-xs text-muted-foreground">Score: {selected.ai_interest_score}/100</span>
            </div>
          </div>

          {vehicle && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Carro de Interesse</h3>
              </div>
              <div className="glass-card rounded-xl p-4 text-sm space-y-1.5 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => navigate("/estoque")}>
                <p className="font-semibold">{vehicle.make} {vehicle.model} {vehicle.year}</p>
                <p className="text-muted-foreground">{vehicle.version} · {vehicle.color}</p>
                <p className="text-lg font-bold">R$ {vehicle.price.toLocaleString("pt-BR")}</p>
              </div>
            </div>
          )}

          {deal && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Negociação</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Etapa</span>
                  <Badge variant="outline" className="rounded-full cursor-pointer" onClick={() => navigate("/pipeline")}>
                    {deal.stage}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pagamento</span>
                  <span className="font-medium">{deal.payment_type}</span>
                </div>
                {deal.tradein_description && (
                  <div className="p-3 rounded-xl bg-secondary">
                    <div className="flex items-center gap-1 text-muted-foreground mb-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Troca</span>
                    </div>
                    <p className="text-sm">{deal.tradein_description}</p>
                    {deal.tradein_value_expected && <p className="font-semibold mt-1">R$ {deal.tradein_value_expected.toLocaleString("pt-BR")}</p>}
                  </div>
                )}
                {deal.next_action && (
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                    <p className="font-medium text-xs mb-0.5">Próxima ação</p>
                    <p className="text-sm">{deal.next_action}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Button variant="outline" size="sm" className="w-full text-xs rounded-xl h-9"
              onClick={() => navigate("/pipeline")}>
              {deal ? "Ver no Pipeline" : "Criar Negócio"}
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs rounded-xl h-9"
              onClick={() => { navigate("/followup"); toast({ title: "Follow-up", description: `Iniciando follow-up para ${selected.contact.full_name}` }); }}>
              Iniciar Follow-up
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs rounded-xl h-9"
              onClick={() => navigate("/lista-inteligente")}>
              Criar Perfil de Espera
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs rounded-xl h-9 text-success hover:bg-success/10"
                onClick={() => toast({ title: "✅ Negócio marcado como Ganho", description: selected.contact.full_name })}>
                ✅ Ganho
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs rounded-xl h-9 text-destructive hover:bg-destructive/10"
                onClick={() => toast({ title: "❌ Negócio marcado como Perdido", description: selected.contact.full_name, variant: "destructive" })}>
                ❌ Perdido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxPage;
