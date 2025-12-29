

import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas pelo usuário
const supabaseUrl = 'https://qqxehwrlpfjclsbdxdjw.supabase.co';
const supabaseAnonKey = 'sb_publishable_q3hWeGIYO1QxVBAE4aZ2hw_rcmPI8L9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para verificar se o Supabase está configurado corretamente
export const isSupabaseConfigured = () => {
  // Fix: Explicitly cast constants to string to avoid literal type overlap errors when comparing with placeholders
  return (supabaseUrl as string) !== 'https://your-project-url.supabase.co' && (supabaseAnonKey as string) !== 'your-anon-key';
};
