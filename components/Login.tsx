
import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  UserCircle, 
  ShieldCheck, 
  GraduationCap, 
  AlertCircle,
  Loader2,
  School
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserRole } from '../types';

interface LoginProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TEACHER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Verificação de Bypass para fins de demonstração se o Supabase não estiver configurado
    if (!isSupabaseConfigured()) {
      console.warn("Supabase não configurado. Ativando modo demonstração.");
      setTimeout(() => {
        onLoginSuccess(role);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role }
          }
        });
        if (signUpError) throw signUpError;
        alert('Cadastro realizado! Verifique seu e-mail para confirmar.');
        setIsSignUp(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        
        // Em um app real, buscaríamos o papel do usuário no metadado do auth ou tabela profiles
        const userRole = data.user?.user_metadata?.role as UserRole || UserRole.TEACHER;
        onLoginSuccess(userRole);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* Lado Esquerdo - Branding / Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1d63ed] relative p-20 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full blur-[100px]"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-300 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#1d63ed] font-black text-2xl shadow-xl shadow-black/10">
            ET
          </div>
          <span className="text-2xl font-black text-white tracking-tight">EduTracker BNCC</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-tight">
              Gestão Pedagógica <br/> de <span className="text-blue-200">Alto Nível.</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-lg leading-relaxed">
              Alinhado à BNCC, o EduTracker ajuda professores a transformarem dados em decisões que potencializam o aprendizado.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
              <ShieldCheck className="text-blue-300 mb-3" size={32} />
              <h4 className="text-white font-bold mb-1">Seguro</h4>
              <p className="text-blue-100 text-sm">Autenticação robusta integrada via Supabase.</p>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
              <School className="text-blue-300 mb-3" size={32} />
              <h4 className="text-white font-bold mb-1">BNCC v3.1</h4>
              <p className="text-blue-100 text-sm">Habilidades pré-carregadas e configuráveis.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-blue-200/60 text-sm font-medium">
          © 2025 EduTracker BNCC • Profº Marques
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-20 relative bg-slate-50 lg:bg-white">
        <div className="max-w-md w-full mx-auto space-y-10">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {isSignUp ? 'Criar nova conta' : 'Acesse o Painel'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isSignUp 
                ? 'Junte-se à rede de professores da Unidade Primavera.' 
                : 'Bem-vindo de volta! Insira suas credenciais para continuar.'}
            </p>
          </div>

          {!isSupabaseConfigured() && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-700">
              <AlertCircle size={20} className="shrink-0" />
              <div className="text-xs">
                <p className="font-bold mb-1">Nota de Demonstração:</p>
                <p>O Supabase não está configurado no código. Use qualquer e-mail/senha para entrar no modo de demonstração.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-rose-700 animate-in shake duration-300">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                  placeholder="exemplo@escola.com.br"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Perfil Pedagógico</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setRole(UserRole.TEACHER)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${role === UserRole.TEACHER ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-md' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    <GraduationCap size={24} />
                    <span className="text-xs font-bold">Professor</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole(UserRole.COORDINATOR)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${role === UserRole.COORDINATOR ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-md' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    <ShieldCheck size={24} />
                    <span className="text-xs font-bold">Coordenador</span>
                  </button>
                </div>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-5 bg-[#1d63ed] text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {isSignUp ? 'Finalizar Cadastro' : 'Entrar na Plataforma'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-black text-blue-600 hover:underline"
            >
              {isSignUp ? 'Já possui uma conta? Entre aqui' : 'Ainda não tem acesso? Crie uma conta'}
            </button>
            {!isSignUp && (
              <button className="text-sm font-bold text-slate-400 hover:text-slate-600">
                Esqueceu a senha?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
