import { createClient } from '@supabase/supabase-js';

// Public demo configuration is retained for existing deployments. Override it for your own project.
// Browser anon keys are public; database access must be restricted by Supabase RLS.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL || 'https://bnhyodfuvymrnogzkgjk.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuaHlvZGZ1dnltcm5vZ3prZ2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjU5NTUsImV4cCI6MjA3MDYwMTk1NX0.ZSvHBPYtUJ7n65Se2953boIFw2OORtjVVpzTozvPK0I';

export const supabase = createClient(supabaseUrl, supabaseKey);
