import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oxisdjygwxhikkixqpap.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aXNkanlnd3hoaWtraXhxcGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODI0NzYsImV4cCI6MjA4ODY1ODQ3Nn0.iXmceArt6OI_sW-jLknmL-HQU4quyOgkSDN4Cc73T5U";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
