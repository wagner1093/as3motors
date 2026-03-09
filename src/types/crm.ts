export interface Contact {
  id: string;
  full_name: string;
  phone_e164: string;
  email: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  contact_id: string;
  contact: Contact;
  channel: string;
  remote_jid: string;
  status: "new" | "open" | "waiting_customer" | "won" | "lost";
  ai_interest_label: "hot" | "warm" | "cold";
  ai_interest_score: number;
  ai_summary: string;
  last_message_at: string;
  source_channel?: string;
  source_campaign?: string;
  source_adset?: string;
  source_ad?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  text: string;
  sent_at: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  version: string | null;
  color: string | null;
  km: number | null;
  price: number;
  status: "available" | "reserved" | "sold";
  drive_folder_url: string | null;
  commission_percent: number;
  commission_value: number;
  notes: string | null;
}

export interface Deal {
  id: string;
  conversation_id: string;
  vehicle_interest_id: string | null;
  stage: string;
  payment_type: string;
  tradein_description: string | null;
  tradein_value_expected: number | null;
  next_action: string | null;
  next_action_at: string | null;
}

export interface FollowupSequence {
  id: string;
  name: string;
  trigger_type: string;
  active: boolean;
}

export interface FollowupStep {
  id: string;
  sequence_id: string;
  day_offset: number;
  message_template: string;
}

export interface FollowupEnrollment {
  id: string;
  conversation_id: string;
  sequence_id: string;
  status: "active" | "paused" | "completed" | "canceled";
  enrolled_at: string;
  last_sent_at: string | null;
}
