import { useState } from "react";
import { mockVehicles } from "@/data/mockData";
import { Search, ExternalLink, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  available: { label: "Disponível", variant: "default" },
  reserved: { label: "Reservado", variant: "secondary" },
  sold: { label: "Vendido", variant: "destructive" },
};

const InventoryPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = mockVehicles.filter(v => {
    const text = `${v.make} ${v.model} ${v.year} ${v.version || ""} ${v.color || ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (statusFilter === "all" || v.status === statusFilter);
  });

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
          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="stat-card group"
            >
              <div className="h-44 bg-secondary rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                <Car className="w-16 h-16 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-base">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.version} · {vehicle.year}</p>
                </div>
                <Badge variant={st.variant} className="rounded-full">{st.label}</Badge>
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
                {vehicle.drive_folder_url && (
                  <a href={vehicle.drive_folder_url} target="_blank" rel="noopener" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryPage;
