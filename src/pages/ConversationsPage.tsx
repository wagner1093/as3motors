import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, MessageCircle } from "lucide-react";

const stageBadge: Record<string, string> = {
  new: "bg-gray-100 text-gray-600",
  collecting: "bg-gray-100 text-gray-600",
  interested: "bg-blue-100 text-blue-600",
  hot_lead: "bg-red-100 text-red-600",
};

const stageLabel: Record<string, string> = {
  new: "Novo",
  collecting: "Coletando",
  interested: "Interessado",
  hot_lead: "🔥 Hot Lead",
};

const ConversationsPage = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setContacts(data);
  };

  const fetchMessages = async (phone: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("phone", phone)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchContacts();

    const channel = supabase
      .channel("conversations-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          fetchContacts();
          if (selected?.whatsapp) fetchMessages(selected.whatsapp);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contacts" },
        () => fetchContacts()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "contacts" },
        () => fetchContacts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = (contact: any) => {
    setSelected(contact);
    fetchMessages(contact.whatsapp);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Lista de contatos */}
      <div className="w-80 border-r overflow-y-auto bg-card">
        <div className="p-4 border-b font-semibold text-sm">
          Conversas ({contacts.length})
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma conversa ainda
          </p>
        ) : (
          contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => openConversation(c)}
              className={`p-4 border-b cursor-pointer hover:bg-secondary/50 transition ${
                selected?.id === c.id ? "bg-secondary" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm truncate">{c.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                    stageBadge[c.status] || stageBadge.new
                  }`}
                >
                  {stageLabel[c.status] || "Novo"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{c.whatsapp}</p>
              {c.vehicle_interest && (
                <p className="text-xs text-blue-600 mt-1 truncate">
                  🚗 {c.vehicle_interest}
                </p>
              )}
              {c.payment_type && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  💳 {c.payment_type === "a_vista" ? "À vista" : "Financiamento"}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Área do chat */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{selected.name}</p>
                <p className="text-xs text-muted-foreground">{selected.whatsapp}</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                {selected.vehicle_interest && (
                  <span>🚗 {selected.vehicle_interest}</span>
                )}
                {selected.payment_type && (
                  <span>
                    💳{" "}
                    {selected.payment_type === "a_vista"
                      ? "À vista"
                      : "Financiamento"}
                  </span>
                )}
                {selected.urgency && (
                  <span>
                    ⏱{" "}
                    {selected.urgency === "decided" ? "Decidido" : "Pesquisando"}
                  </span>
                )}
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-background">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-8">
                  Nenhuma mensagem ainda
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.direction === "inbound" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                        m.direction === "inbound"
                          ? "bg-white dark:bg-card border text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p>{m.content}</p>
                      <p className="text-[10px] mt-1 opacity-50 text-right">
                        {new Date(m.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Selecione uma conversa</p>
              <p className="text-xs mt-1 opacity-60">
                As mensagens aparecerão aqui em tempo real
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;
