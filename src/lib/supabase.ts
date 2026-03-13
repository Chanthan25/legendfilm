import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xtsnpmptxccexcvywkln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0c25wbXB0eGNjZXhjdnl3a2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjY1MzIsImV4cCI6MjA4NzYwMjUzMn0.vUezwaSscz_8rL0hOgnXnNsOo9ZhRr36jTVHaWvX01A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
