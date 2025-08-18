import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bnhyodfuvymrnogzkgjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuaHlvZGZ1dnltcm5vZ3prZ2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjU5NTUsImV4cCI6MjA3MDYwMTk1NX0.ZSvHBPYtUJ7n65Se2953boIFw2OORtjVVpzTozvPK0I';

export const supabase = createClient(supabaseUrl, supabaseKey);