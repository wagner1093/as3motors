import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAllVehicles, useCreateVehicle, useEditVehicle, useDeleteVehicle, SupabaseVehicle } from "@/hooks/useVehicles";
import {
  Search, ExternalLink, Car, Users, Plus,
  Edit, Trash2, MoreHorizontal, DollarSign, Gauge, Palette, Calendar,
  Shield, FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
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

const emptyForm = {
  brand: "", model: "", year: "2024", color: "", mileage: "",
  price: "", status: "available" as VehicleStatus, description: "",
};

const InventoryPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<SupabaseVehicle | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: vehicles = [], isLoading } = useAllVehicles();
  const createVehicle = useCreateVehicle();
  const editVehicle = useEditVehicle();
  const deleteVehicle = useDeleteVehicle();

  const updateForm = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const filtered = vehicles.filter(v => {
    const text = `${v.brand || ""} ${v.model || ""} ${v.year || ""} ${v.color || ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (statusFilter === "all" || v.status === statusFilter);
  });

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === "available").length,
    reserved: vehicles.filter(v => v.status === "reserved").length,
    sold: vehicles.filter(v => v.status === "sold").length,
  };

  const handleAdd = async () => {
    if (!form.brand.trim() || !form.model.trim() || !form.price) {
      toast({ title: "Preencha marca, modelo e preço", variant: "destructive" });
      return;
    }
    try {
      await createVehicle.mutateAsync({
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: parseInt(form.year) || 2024,
        color: form.color.trim() || undefined,
        mileage: form.mileage ? parseInt(form.mileage) : undefined,
        price: parseFloat(form.price),
        status: form.status,
        description: form.description.trim() || undefined,
      });
      setForm({ ...emptyForm });
      setAddDialogOpen(false);
      toast({ title: "✅ Veículo adicionado!", description: `${form.brand} ${form.model}` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleOpenEdit = (v: SupabaseVehicle) => {
    setEditingVehicle(v);
    setForm({
      brand: v.brand || "",
      model: v.model || "",
      year: String(v.year || 2024),
      color: v.color || "",
      mileage: v.mileage != null ? String(v.mileage) : "",
      price: v.price != null ? String(v.price) : "",
      status: (v.status as VehicleStatus) || "available",
      description: v.description || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingVehicle) return;
    try {
      await editVehicle.mutateAsync({
        vehicleId: editingVehicle.id,
        data: {
          brand: form.brand.trim() || null,
          model: form.model.trim() || null,
          year: parseInt(form.year) || null,
          color: form.color.trim() || null,
          mileage: form.mileage ? parseInt(form.mileage) : null,
          price: form.price ? parseFloat(form.price) : null,
          status: form.status || null,
          description: form.description.trim() || null,
        },
      });
      setEditDialogOpen(false);
      setEditingVehicle(null);
      toast({ title: "✅ Veículo atualizado!" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleChangeStatus = async (vehicleId: string, newStatus: VehicleStatus) => {
    try {
      await editVehicle.mutateAsync({ vehicleId, data: { status: newStatus } });
      toast({ title: `Status alterado para "${statusMap[newStatus].label}"` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (vehicleId: string) => {
    try {
      await deleteVehicle.mutateAsync(vehicleId);
      toast({ title: "Veículo removido" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const vehicleFormFields = (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Marca *</Label>
        <Input placeholder="Toyota" value={form.brand} onChange={e => updateForm("brand", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Modelo *</Label>
        <Input placeholder="Corolla" value={form.model} onChange={e => updateForm("model", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Ano</Label>
        <Input type="number" value={form.year} onChange={e => updateForm("year", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Cor</Label>
        <Input placeholder="Prata" value={form.color} onChange={e => updateForm("color", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Km</Label>
        <Input type="number" placeholder="18000" value={form.mileage} onChange={e => updateForm("mileage", e.target.value)} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Preço (R$) *</Label>
        <Input type="number" placeholder="125000" value={form.price} onChange={e => updateForm("price", e.target.value)} className="rounded-xl" />
      </div>
      <div className="col-span-2 space-y-1.5">
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
      <div className="col-span-2 space-y-1.5">
        <Label className="text-xs">Descrição / Observações</Label>
        <Textarea placeholder="Versão, detalhes, comissão, link Drive..." value={form.description} onChange={e => updateForm("description", e.target.value)} className="rounded-xl" rows={3} />
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
          <Button onClick={() => { setForm({ ...emptyForm }); setAddDialogOpen(true); }} className="rounded-xl gap-2 shadow-md">
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
              <p className="text-2xl font-bold">{isLoading ? "-" : s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vehicle grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((vehicle, i) => {
            const st = statusMap[vehicle.status || "available"] || statusMap.available;
            return (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.35 }}
                className="glass-card group overflow-hidden"
              >
                <div className="h-44 bg-muted/40 rounded-xl flex items-center justify-center mb-4 overflow-hidden mx-4 mt-4">
                  <Car className="w-16 h-16 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="px-5 pb-5">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-base">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  <p className="text-2xl font-bold mt-2 tracking-tight">
                    R$ {(vehicle.price || 0).toLocaleString("pt-BR")}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {vehicle.color && <span className="flex items-center gap-1"><Palette className="w-3 h-3" /> {vehicle.color}</span>}
                    {vehicle.mileage != null && <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {vehicle.mileage.toLocaleString("pt-BR")} km</span>}
                    {vehicle.year && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {vehicle.year}</span>}
                  </div>

                  {vehicle.description && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1 line-clamp-2">
                      <FileText className="w-3 h-3 mt-0.5 shrink-0" /> {vehicle.description}
                    </p>
                  )}

                  <div className="flex items-center justify-end mt-4 pt-4 border-t">
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
                          disabled={vehicle.status === "repasse"} className="gap-2 text-xs">
                          <ExternalLink className="w-3.5 h-3.5 text-primary" /> Marcar Repasse
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(vehicle.id)} className="gap-2 text-xs text-destructive">
                          <Trash2 className="w-3.5 h-3.5" /> Remover veículo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
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
            <Button onClick={handleAdd} disabled={createVehicle.isPending} className="rounded-xl gap-2">
              <Plus className="w-4 h-4" /> {createVehicle.isPending ? "Salvando..." : "Adicionar"}
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
            <Button onClick={handleSaveEdit} disabled={editVehicle.isPending} className="rounded-xl gap-2">
              <Edit className="w-4 h-4" /> {editVehicle.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
