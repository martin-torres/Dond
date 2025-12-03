import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hhrcbdffqkcyspwwlbad.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocmNiZGZmcWtjeXNwd3dsYmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTA5MTYsImV4cCI6MjA3OTk4NjkxNn0.ZSsBYpPmVkDlIeCJ44lMHwMUHR_LUiKMEhltBAINz-E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
