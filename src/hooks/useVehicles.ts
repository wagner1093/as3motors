import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface SupabaseVehicle {
  id: string;
  brand: string | null;
  model: string | null;
  version: string | null;
  year: number | null;
  color: string | null;
  mileage: number | null;
  price: number | null;
  status: string | null;
  description: string | null;
  condition: string | null;
  engine: string | null;
  power: string | null;
  leather_seats: boolean | null;
  sunroof: boolean | null;
  electric_trunk: boolean | null;
  fuel: string | null;
  armored: boolean | null;
  armor_type: string | null;
  armor_company: string | null;
  glass_brand: string | null;
  created_at: string | null;
}

export function useAllVehicles() {
  return useQuery({
    queryKey: ["vehicles-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SupabaseVehicle[];
    },
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: Partial<Omit<SupabaseVehicle, "id" | "created_at">> & { brand: string; model: string }) => {
      const { data, error } = await supabase
        .from("vehicles")
        .insert({
          brand: params.brand,
          model: params.model,
          version: params.version || null,
          year: params.year || null,
          color: params.color || null,
          mileage: params.mileage || null,
          price: params.price || null,
          status: params.status || "available",
          description: params.description || null,
          condition: params.condition || null,
          engine: params.engine || null,
          power: params.power || null,
          leather_seats: params.leather_seats ?? false,
          sunroof: params.sunroof ?? false,
          electric_trunk: params.electric_trunk ?? false,
          fuel: params.fuel || null,
          armored: params.armored ?? false,
          armor_type: params.armor_type || null,
          armor_company: params.armor_company || null,
          glass_brand: params.glass_brand || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles-all"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles-available"] });
    },
  });
}

export function useEditVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ vehicleId, data }: {
      vehicleId: string;
      data: Partial<Omit<SupabaseVehicle, "id" | "created_at">>;
    }) => {
      const { error } = await supabase
        .from("vehicles")
        .update(data)
        .eq("id", vehicleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles-all"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles-available"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles-all"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles-available"] });
    },
  });
}
