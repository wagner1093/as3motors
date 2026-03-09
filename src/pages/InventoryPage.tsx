import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockVehicles, mockWaitlistMatches } from "@/data/mockData";
import { Search, ExternalLink, Car, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  available: { label: "Disponível", variant: "default" },
  reserved: { label: "Reservado", variant: "secondary" },
  sold: { label: "Vendido", variant: "destructive" },
};

const InventoryPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filtered = mockVehicles.filter(v => {
    const text = `${v.make} ${v.model} ${v.year} ${v.version || ""} ${v.color || ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (statusFilter === "all" || v.status === statusFilter);
  });

  const getMatchesForVehicle = (vehicleId: string) => {
    return mockWaitlistMatches.filter(m => m.vehicle_id === vehicleId);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Estoque</h1>
          <p>Gerencie seus veículos disponíveis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar veículo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64 rounded-xl bg-card border h-10" />
          </div>
          <div className="flex gap-1.5">
            {[{ key: "all", label: "Todos" }, { key: "available", label: "Disponíveis" }, { key: "reserved", label: "Reservados" }, { key: "sold", label: "Vendidos" }].map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)}
                className={`filter-pill text-xs ${statusFilter === f.key ? "active" : ""}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((vehicle, i) => {
          const st = statusMap[vehicle.status];
          const matches = getMatchesForVehicle(vehicle.id);
          const isExpanded = expandedVehicle === vehicle.id;
          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="stat-card group cursor-pointer"
              onClick={() => setExpandedVehicle(isExpanded ? null : vehicle.id)}
            >
              <div className="h-44 bg-secondary rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                <Car className="w-16 h-16 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-base">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.version} · {vehicle.year}</p>
                </div>
                <div className="flex items-center gap-2">
                  {matches.length > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {matches.length}
                    </span>
                  )}
                  <Badge variant={st.variant} className="rounded-full">{st.label}</Badge>
                </div>
              </div>
              <p className="text-2xl font-bold mt-2 tracking-tight">R$ {vehicle.price.toLocaleString("pt-BR")}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {vehicle.color && <span>{vehicle.color}</span>}
                {vehicle.km != null && <span>{vehicle.km.toLocaleString("pt-BR")} km</span>}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-xs">
                  <span className="text-muted-foreground">Comissão: </span>
                  <span className="font-semibold">{vehicle.commission_percent}% · R$ {vehicle.commission_value.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex items-center gap-1">
                  {vehicle.drive_folder_url && (
                    <a href={vehicle.drive_folder_url} target="_blank" rel="noopener"
                      className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary"
                      onClick={e => e.stopPropagation()}>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && matches.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <h4 className="text-xs font-semibold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> Clientes Compatíveis
                      </h4>
                      {matches.map(m => {
                        const profile = mockWaitlistMatches.find(wm => wm.id === m.id);
                        return (
                          <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                            <div className="text-xs">
                              <p className="font-medium">Score: {m.match_score}%</p>
                              <p className="text-muted-foreground">{m.status}</p>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg"
                              onClick={(e) => { e.stopPropagation(); navigate("/lista-inteligente"); }}>
                              Ver perfil
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryPage;
