import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockVehicles, mockWaitlistMatches } from "@/data/mockData";
import { Vehicle } from "@/types/crm";
import {
  Search, ExternalLink, Car, Users, ChevronDown, ChevronUp, Plus,
  Edit, Trash2, MoreHorizontal, DollarSign, Gauge, Palette, Calendar,
  Shield, FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type VehicleStatus = "available" | "reserved" | "sold" | "repasse";

const statusMap: Record<string, { label: string; color: string }> = {
  available: { label: "Disponível", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  reserved: { label: "Reservado", color: "bg-amber-50 text-amber-700 border-amber-200" },
  sold: { label: "Vendido", color: "bg-destructive/10 text-destructive border-destructive/20" },
  repasse: { label: "Repasse", color: "bg-primary/10 text-primary border-primary/20" },
};

const emptyVehicle = {
  make: "", model: "", year: 2024, version: "", color: "", km: "",
  price: "", status: "available" as VehicleStatus, drive_folder_url: "",
  commission_percent: "", commission_value: "", notes: "",
};

const InventoryPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ ...emptyVehicle });
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateForm = (field: string, value: string | number) => setForm(f => ({ ...f, [field]: value }));

  const filtered = vehicles.filter(v => {
    const text = `${v.make} ${v.model} ${v.year} ${v.version || ""} ${v.color || ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (statusFilter === "all" || v.status === statusFilter);
  });

  const getMatchesForVehicle = (vehicleId: string) => {
    return mockWaitlistMatches.filter(m => m.vehicle_id === vehicleId);
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === "available").length,
    reserved: vehicles.filter(v => v.status === "reserved").length,
    sold: vehicles.filter(v => v.status === "sold").length,
  };

  const handleAdd = () => {
    if (!form.make.trim() || !form.model.trim() || !form.price) {
      toast({ title: "Preencha marca, modelo e preço", variant: "destructive" });
      return;
    }
    const newVehicle: Vehicle = {
      id: `v-${Date.now()}`,
      make: form.make.trim(), model: form.model.trim(), year: form.year,
      version: form.version.trim() || null, color: form.color.trim() || null,
      km: form.km ? parseInt(String(form.km)) : null,
      price: parseFloat(String(form.price)),
      status: form.status as Vehicle["status"],
      drive_folder_url: form.drive_folder_url.trim() || null,
      commission_percent: form.commission_percent ? parseFloat(String(form.commission_percent)) : 0,
      commission_value: form.commission_value ? parseFloat(String(form.commission_value)) : 0,
      notes: form.notes.trim() || null,
    };
    setVehicles(prev => [newVehicle, ...prev]);
    setForm({ ...emptyVehicle });
    setAddDialogOpen(false);
    toast({ title: "✅ Veículo adicionado!", description: `${newVehicle.make} ${newVehicle.model} ${newVehicle.year}` });
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setForm({
      make: v.make, model: v.model, year: v.year, version: v.version || "",
      color: v.color || "", km: v.km != null ? String(v.km) : "",
      price: String(v.price), status: v.status as VehicleStatus,
      drive_folder_url: v.drive_folder_url || "",
      commission_percent: String(v.commission_percent), commission_value: String(v.commission_value),
      notes: v.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingVehicle) return;
    setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? {
      ...v,
      make: form.make.trim(), model: form.model.trim(), year: form.year,
      version: form.version.trim() || null, color: form.color.trim() || null,
      km: form.km ? parseInt(String(form.km)) : null,
      price: parseFloat(String(form.price)),
      status: form.status as Vehicle["status"],
      drive_folder_url: form.drive_folder_url.trim() || null,
      commission_percent: form.commission_percent ? parseFloat(String(form.commission_percent)) : 0,
      commission_value: form.commission_value ? parseFloat(String(form.commission_value)) : 0,
      notes: form.notes.trim() || null,
    } : v));
    setEditDialogOpen(false);
    setEditingVehicle(null);
    toast({ title: "✅ Veículo atualizado!" });
  };

  const handleChangeStatus = (vehicleId: string, newStatus: VehicleStatus) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
    toast({ title: `Status alterado para "${statusMap[newStatus].label}"` });
  };

  const handleDelete = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    toast({ title: "Veículo removido" });
  };

  const VehicleFormFields = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Marca *</Label>
        <Input placeholder="Toyota" value={form.make} onChange={e => updateForm("make", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Modelo *</Label>
        <Input placeholder="Corolla" value={form.model} onChange={e => updateForm("model", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Ano</Label>
        <Input type="number" value={form.year} onChange={e => updateForm("year", parseInt(e.target.value) || 2024)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Versão</Label>
        <Input placeholder="XEi 2.0" value={form.version} onChange={e => updateForm("version", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Cor</Label>
        <Input placeholder="Prata" value={form.color} onChange={e => updateForm("color", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Km</Label>
        <Input type="number" placeholder="18000" value={form.km} onChange={e => updateForm("km", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Preço (R$) *</Label>
        <Input type="number" placeholder="125000" value={form.price} onChange={e => updateForm("price", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Status</Label>
        <Select value={form.status} onValueChange={v => updateForm("status", v)}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Disponível</SelectItem>
            <SelectItem value="reserved">Reservado</SelectItem>
            <SelectItem value="sold">Vendido</SelectItem>
            <SelectItem value="repasse">Repasse</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Comissão (%)</Label>
        <Input type="number" placeholder="2" value={form.commission_percent} onChange={e => updateForm("commission_percent", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Comissão (R$)</Label>
        <Input type="number" placeholder="2500" value={form.commission_value} onChange={e => updateForm("commission_value", e.target.value)} className="rounded-xl" />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label className="text-xs">Link Google Drive (fotos)</Label>
        <Input placeholder="https://drive.google.com/..." value={form.drive_folder_url} onChange={e => updateForm("drive_folder_url", e.target.value)} className="rounded-xl" />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label className="text-xs">Observações</Label>
        <Textarea placeholder="Informações adicionais..." value={form.notes} onChange={e => updateForm("notes", e.target.value)} className="rounded-xl" rows={2} />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Estoque</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seus veículos disponíveis</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setForm({ ...emptyVehicle }); setAddDialogOpen(true); }} className="rounded-xl gap-2 shadow-md">
            <Plus className="w-4 h-4" /> Novo Veículo
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar veículo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64 rounded-xl glass-input border-0 h-10" />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "Todos" },
            { key: "available", label: "Disponíveis" },
            { key: "reserved", label: "Reservados" },
            { key: "sold", label: "Vendidos" },
            { key: "repasse", label: "Repasse" },
          ].map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)}
              className={`filter-pill text-xs ${statusFilter === f.key ? "active" : ""}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Car, accent: "text-foreground" },
          { label: "Disponíveis", value: stats.available, icon: Car, accent: "text-success" },
          { label: "Reservados", value: stats.reserved, icon: Shield, accent: "text-warning" },
          { label: "Vendidos", value: stats.sold, icon: DollarSign, accent: "text-accent" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="glass-card p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl bg-muted/50 ${s.accent}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vehicle grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((vehicle, i) => {
          const st = statusMap[vehicle.status] || statusMap.available;
          const matches = getMatchesForVehicle(vehicle.id);
          const isExpanded = expandedVehicle === vehicle.id;
          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="stat-card group"
            >
              <div className="h-44 bg-secondary rounded-xl flex items-center justify-center mb-4 overflow-hidden cursor-pointer"
                onClick={() => setExpandedVehicle(isExpanded ? null : vehicle.id)}>
                <Car className="w-16 h-16 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500" />
              </div>

              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-semibold text-base">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.version} · {vehicle.year}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {matches.length > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border flex items-center gap-1">
                      <Users className="w-3 h-3" /> {matches.length}
                    </span>
                  )}
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${st.color}`}>
                    {st.label}
                  </span>
                </div>
              </div>

              <p className="text-2xl font-bold mt-2 tracking-tight">R$ {vehicle.price.toLocaleString("pt-BR")}</p>

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {vehicle.color && <span className="flex items-center gap-1"><Palette className="w-3 h-3" /> {vehicle.color}</span>}
                {vehicle.km != null && <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {vehicle.km.toLocaleString("pt-BR")} km</span>}
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {vehicle.year}</span>
              </div>

              {vehicle.notes && (
                <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                  <FileText className="w-3 h-3 mt-0.5 shrink-0" /> {vehicle.notes}
                </p>
              )}

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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => handleOpenEdit(vehicle)} className="gap-2 text-xs">
                        <Edit className="w-3.5 h-3.5" /> Editar veículo
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleChangeStatus(vehicle.id, "available")}
                        disabled={vehicle.status === "available"} className="gap-2 text-xs">
                        <Car className="w-3.5 h-3.5 text-emerald-600" /> Marcar Disponível
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeStatus(vehicle.id, "reserved")}
                        disabled={vehicle.status === "reserved"} className="gap-2 text-xs">
                        <Shield className="w-3.5 h-3.5 text-amber-600" /> Marcar Reservado
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeStatus(vehicle.id, "sold")}
                        disabled={vehicle.status === "sold"} className="gap-2 text-xs">
                        <DollarSign className="w-3.5 h-3.5 text-destructive" /> Marcar Vendido
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeStatus(vehicle.id, "repasse")}
                        disabled={vehicle.status === ("repasse" as string)} className="gap-2 text-xs">
                        <ExternalLink className="w-3.5 h-3.5 text-primary" /> Marcar Repasse
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/lista-inteligente")} className="gap-2 text-xs">
                        <Users className="w-3.5 h-3.5" /> Ver clientes compatíveis
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(vehicle.id)} className="gap-2 text-xs text-destructive">
                        <Trash2 className="w-3.5 h-3.5" /> Remover veículo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && matches.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <h4 className="text-xs font-semibold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" /> Clientes Compatíveis
                      </h4>
                      {matches.map(m => (
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
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="stat-card flex flex-col items-center justify-center py-16 text-center">
          <Car className="w-12 h-12 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum veículo encontrado.</p>
        </div>
      )}

      {/* Add Vehicle Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Novo Veículo
            </DialogTitle>
          </DialogHeader>
          <VehicleFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleAdd} className="rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" /> Editar Veículo
            </DialogTitle>
          </DialogHeader>
          <VehicleFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleSaveEdit} className="rounded-xl gap-2">
              <Edit className="w-4 h-4" /> Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
