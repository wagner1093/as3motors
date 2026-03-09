import { useState } from "react";
import { mockConversations, mockMessages, mockDeals, mockVehicles } from "@/data/mockData";
import { Conversation, Message } from "@/types/crm";
import { Search, Send, Flame, Snowflake, Sun, Bot, Car, CreditCard, ArrowRightLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const InboxPage = () => {
  const [selectedId, setSelectedId] = useState<string>(mockConversations[0]?.id || "");
  const [search, setSearch] = useState("");
  const [filterInterest, setFilterInterest] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");

  const filtered = mockConversations.filter(c => {
    const matchSearch = c.contact.full_name.toLowerCase().includes(search.toLowerCase()) || c.contact.phone_e164.includes(search);
    const matchInterest = filterInterest === "all" || c.ai_interest_label === filterInterest;
    return matchSearch && matchInterest;
  });

  const selected = mockConversations.find(c => c.id === selectedId);
  const messages = mockMessages[selectedId] || [];
  const deal = mockDeals.find(d => d.conversation_id === selectedId);
  const vehicle = deal?.vehicle_interest_id ? mockVehicles.find(v => v.id === deal.vehicle_interest_id) : null;

  const interestIcon = (label: string) => {
    if (label === "hot") return <Flame className="w-3.5 h-3.5" />;
    if (label === "warm") return <Sun className="w-3.5 h-3.5" />;
    return <Snowflake className="w-3.5 h-3.5" />;
  };

  return (
    <div className="flex h-screen">
      {/* Conversation list */}
      <div className="w-[340px] border-r flex flex-col bg-card">
        <div className="p-3 border-b space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar contato..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex gap-1">
            {[{ key: "all", label: "Todos" }, { key: "hot", label: "🔥" }, { key: "warm", label: "🟡" }, { key: "cold", label: "🔵" }].map(f => (
              <button key={f.key} onClick={() => setFilterInterest(f.key)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterInterest === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(conv => (
            <button key={conv.id} onClick={() => setSelectedId(conv.id)}
              className={`w-full text-left p-3 border-b transition-colors ${selectedId === conv.id ? "bg-secondary" : "hover:bg-secondary/50"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold shrink-0">
                  {conv.contact.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{conv.contact.full_name}</span>
                    <span className={`lead-badge-${conv.ai_interest_label} flex items-center gap-1`}>
                      {interestIcon(conv.ai_interest_label)}
                      {conv.ai_interest_score}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.ai_summary}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">{format(new Date(conv.last_message_at), "HH:mm", { locale: ptBR })}</span>
                    {conv.source_channel && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{conv.source_channel}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="p-4 border-b bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  {selected.contact.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selected.contact.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selected.contact.phone_e164}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{selected.status}</Badge>
                <span className={`lead-badge-${selected.ai_interest_label}`}>
                  {selected.ai_interest_label === "hot" ? "Quente" : selected.ai_interest_label === "warm" ? "Morno" : "Frio"}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                  <div className={msg.direction === "outbound" ? "chat-bubble-outbound" : "chat-bubble-inbound"}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.direction === "outbound" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {format(new Date(msg.sent_at), "HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t bg-card flex gap-2">
              <Input placeholder="Digite uma mensagem..." value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1" />
              <Button size="icon"><Send className="w-4 h-4" /></Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Selecione uma conversa</div>
        )}
      </div>

      {/* AI Panel */}
      {selected && (
        <div className="w-[300px] border-l bg-card p-4 overflow-y-auto space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Análise IA</h3>
            </div>
            <p className="text-sm text-muted-foreground">{selected.ai_summary}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`lead-badge-${selected.ai_interest_label}`}>
                {selected.ai_interest_label === "hot" ? "🔥 Quente" : selected.ai_interest_label === "warm" ? "🟡 Morno" : "🔵 Frio"}
              </span>
              <span className="text-xs text-muted-foreground">Score: {selected.ai_interest_score}/100</span>
            </div>
          </div>

          {vehicle && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Carro de Interesse</h3>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium">{vehicle.make} {vehicle.model} {vehicle.year}</p>
                <p className="text-muted-foreground">{vehicle.version} • {vehicle.color}</p>
                <p className="font-semibold">R$ {vehicle.price.toLocaleString("pt-BR")}</p>
              </div>
            </div>
          )}

          {deal && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Negociação</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Etapa</span>
                  <Badge variant="outline">{deal.stage}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagamento</span>
                  <span className="font-medium">{deal.payment_type}</span>
                </div>
                {deal.tradein_description && (
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Troca</span>
                    </div>
                    <p>{deal.tradein_description}</p>
                    {deal.tradein_value_expected && <p className="font-medium">R$ {deal.tradein_value_expected.toLocaleString("pt-BR")}</p>}
                  </div>
                )}
                {deal.next_action && (
                  <div className="mt-2 p-2 bg-accent/20 rounded text-xs">
                    <p className="font-medium">Próxima ação:</p>
                    <p>{deal.next_action}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full text-xs">Criar/Editar Negócio</Button>
            <Button variant="outline" size="sm" className="w-full text-xs">Iniciar Follow-up</Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs text-success">✅ Ganho</Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs text-destructive">❌ Perdido</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxPage;
