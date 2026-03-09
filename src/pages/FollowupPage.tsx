import { mockSequences, mockSteps, mockEnrollments, mockConversations } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Clock, MessageSquare, Users } from "lucide-react";

const FollowupPage = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Follow-up</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sequences */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Sequências</h2>
          <div className="space-y-3">
            {mockSequences.map(seq => {
              const steps = mockSteps.filter(s => s.sequence_id === seq.id);
              const enrollments = mockEnrollments.filter(e => e.sequence_id === seq.id);
              return (
                <div key={seq.id} className="stat-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-sm">{seq.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{seq.trigger_type.replace("_", " ")}</p>
                    </div>
                    <Switch checked={seq.active} />
                  </div>
                  <div className="space-y-2">
                    {steps.map((step, i) => (
                      <div key={step.id} className="flex items-start gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-semibold">
                          {i + 1}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dia {step.day_offset}: </span>
                          <span className="text-foreground">{step.message_template.substring(0, 60)}...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{enrollments.length} inscritos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active enrollments */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Inscrições Ativas</h2>
          <div className="space-y-3">
            {mockEnrollments.map(enroll => {
              const conv = mockConversations.find(c => c.id === enroll.conversation_id);
              const seq = mockSequences.find(s => s.id === enroll.sequence_id);
              if (!conv || !seq) return null;
              return (
                <div key={enroll.id} className="stat-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                        {conv.contact.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{conv.contact.full_name}</p>
                        <p className="text-xs text-muted-foreground">{seq.name}</p>
                      </div>
                    </div>
                    <Badge variant={enroll.status === "active" ? "default" : "secondary"}>
                      {enroll.status === "active" ? "Ativo" : enroll.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Inscrito: {new Date(enroll.enrolled_at).toLocaleDateString("pt-BR")}
                    {enroll.last_sent_at && ` • Último envio: ${new Date(enroll.last_sent_at).toLocaleDateString("pt-BR")}`}
                  </div>
                </div>
              );
            })}
            {mockEnrollments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma inscrição ativa</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowupPage;
