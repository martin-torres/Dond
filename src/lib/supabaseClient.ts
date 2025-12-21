import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from public env (for front-end) or server env
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

let _supabase: SupabaseClient | null = null;
let _configured = false;

if (url && anonKey) {
  _supabase = createClient(url, anonKey);
  _configured = true;
} else {
  // Do not throw during module import; export configuration helpers so UI can handle missing config.
  _supabase = null;
  _configured = false;
}

export const supabase: SupabaseClient | null = _supabase;

export function isSupabaseConfigured(): boolean {
  return _configured;
}

export function ensureSupabaseConfigured(): void {
  if (!_configured) {
    const err = new Error('Supabase environment variables are not configured. Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    // @ts-expect-error add custom flag
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    err.code = 'SUPABASE_MISSING';
    throw err;
  }
}
