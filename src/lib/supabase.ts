import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://swrsdfbcogrtlrakxrdu.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cnNkZmJjb2dydGxyYWt4cmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDAxMjMsImV4cCI6MjA5Nzc3NjEyM30.Hral0LvUDj8DCBN-47dkqPota0VFgzIJb4cA49ueagA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getAccessToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.provider_token ?? null;
};

