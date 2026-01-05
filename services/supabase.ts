
import { createClient } from '@supabase/supabase-js';

// Credenciais do Projeto
const supabaseUrl = 'https://qqxehwrlpfjclsbdxdjw.supabase.co';
const supabaseAnonKey = 'sb_publishable_q3hWeGIYO1QxVBAE4aZ2hw_rcmPI8L9';

/**
 * IMPORTANTE PARA O COORDENADOR:
 * Para que os links de convite funcionem corretamente via E-mail:
 * 1. Vá em Supabase Dashboard > Authentication > URL Configuration.
 * 2. Adicione o endereço do seu app em "Redirect URLs" (ex: https://seu-app.netlify.app).
 * 3. O Site URL deve ser o endereço principal do seu sistema.
 */

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return (supabaseUrl as string).includes('supabase.co') && (supabaseAnonKey as string).startsWith('sb_');
};
