import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface DealWithRelations {
  id: string;
  contact_id: string | null;
  vehicle_id: string | null;
  value: number | null;
  stage: string | null;
  notes: string | null;
  vehicle_interest: string | null;
  payment_type: string | null;
  urgency: string | null;
  created_at: string | null;
  updated_at: string | null;
  contact: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
  } | null;
  vehicle: {
    id: string;
    brand: string | null;
    model: string | null;
    year: number | null;
    color: string | null;
    mileage: number | null;
    price: number | null;
    status: string | null;
  } | null;
}

export function useDeals() {
  return useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select(`
          *,
          contact:contacts!deals_contact_id_fkey(*),
          vehicle:vehicles!deals_vehicle_id_fkey(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DealWithRelations[];
    },
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, stage }: { dealId: string; stage: string }) => {
      const { error } = await supabase
        .from("deals")
        .update({ stage, updated_at: new Date().toISOString() })
        .eq("id", dealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useConversationByContact(contactId: string | null) {
  return useQuery({
    queryKey: ["conversation", contactId],
    queryFn: async () => {
      if (!contactId) return null;
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("contact_id", contactId)
        .order("last_message_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!contactId,
  });
}
