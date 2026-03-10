import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface SupabaseVehicle {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  mileage: number | null;
  price: number | null;
  status: string | null;
  description: string | null;
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
    mutationFn: async (params: {
      brand: string;
      model: string;
      year?: number;
      color?: string;
      mileage?: number;
      price?: number;
      status?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from("vehicles")
        .insert({
          brand: params.brand,
          model: params.model,
          year: params.year || null,
          color: params.color || null,
          mileage: params.mileage || null,
          price: params.price || null,
          status: params.status || "available",
          description: params.description || null,
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
      data: Partial<{
        brand: string | null;
        model: string | null;
        year: number | null;
        color: string | null;
        mileage: number | null;
        price: number | null;
        status: string | null;
        description: string | null;
      }>;
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
