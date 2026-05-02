import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlhkpvpvkbjpcmfypgqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaGtwdnB2a2JqcGNtZnlwZ3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjY0NjgsImV4cCI6MjA5MzMwMjQ2OH0.nVSdS7ZPia88WWmtz6QHLR5-EqXatFKGf6XJsMHLZyk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
