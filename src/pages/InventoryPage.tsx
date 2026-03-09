import { useState } from "react";
import { mockVehicles } from "@/data/mockData";
import { Vehicle } from "@/types/crm";
import { Search, ExternalLink, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
    const matchSearch = text.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Estoque de Veículos</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar veículo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
          <div className="flex gap-1">
            {[{ key: "all", label: "Todos" }, { key: "available", label: "Disponíveis" }, { key: "reserved", label: "Reservados" }, { key: "sold", label: "Vendidos" }].map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${statusFilter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(vehicle => {
          const st = statusMap[vehicle.status];
          return (
            <div key={vehicle.id} className="stat-card hover:shadow-md transition-shadow">
              <div className="h-40 bg-secondary rounded-lg flex items-center justify-center mb-3">
                <Car className="w-16 h-16 text-muted-foreground/30" />
              </div>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-semibold">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.version} • {vehicle.year}</p>
                </div>
                <Badge variant={st.variant}>{st.label}</Badge>
              </div>
              <p className="text-xl font-bold mt-2">R$ {vehicle.price.toLocaleString("pt-BR")}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {vehicle.color && <span>{vehicle.color}</span>}
                {vehicle.km != null && <span>{vehicle.km.toLocaleString("pt-BR")} km</span>}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="text-xs">
                  <span className="text-muted-foreground">Comissão: </span>
                  <span className="font-semibold">{vehicle.commission_percent}% (R$ {vehicle.commission_value.toLocaleString("pt-BR")})</span>
                </div>
                {vehicle.drive_folder_url && (
                  <a href={vehicle.drive_folder_url} target="_blank" rel="noopener" className="text-muted-foreground hover:text-foreground transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryPage;
