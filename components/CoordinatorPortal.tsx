
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Mail, 
  Link as LinkIcon, 
  Check, 
  Shield, 
  Send, 
  Users, 
  MoreVertical, 
  Trash2, 
  UserCheck, 
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { UserRole, TeacherInvite } from '../types';
import { db } from '../services/db';

export const CoordinatorPortal: React.FC = () => {
  const [invites, setInvites] = useState<TeacherInvite[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'invites' | 'active'>('active');

  useEffect(() => {
    setInvites(db.getInvites());
    setTeachers(db.getTeachers());
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    
    const id = Math.random().toString(36).substr(2, 9);
    const baseUrl = window.location.origin + window.location.pathname;
    const inviteLink = `${baseUrl}?invite=${id}`;
    
    const newInvite: TeacherInvite = {
      id,
      email: newEmail,
      role: UserRole.TEACHER,
      status: 'Pendente',
      inviteLink
    };
    
    await db.saveInvite(newInvite);
    setInvites(db.getInvites());
    setNewEmail('');
    setActiveView('invites');
  };

  const handleRevokeInvite = async (id: string) => {
    if (confirm("Revogar este convite? O link deixará de funcionar.")) {
      await db.deleteInvite(id);
      setInvites(db.getInvites());
    }
  };

  const copyToClipboard = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Banner Principal */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <ShieldCheck size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full text-[10px] font-black tracking-widest uppercase ring-1 ring-white/30">
              <Shield size={14} />
              Controle Administrativo
            </div>
            <h2 className="text-4xl font-black">Gestão Docente</h2>
            <p className="text-indigo-100 max-w-lg text-lg font-medium leading-relaxed opacity-90">
              Gerencie o acesso dos professores, monitore convites ativos e garanta a integridade dos dados pedagógicos da unidade.
            </p>
          </div>
          
          <form onSubmit={handleInvite} className="w-full md:w-auto bg-white/10 backdrop-blur-md p-2 rounded-3xl border border-white/20 flex flex-col sm:flex-row gap-2 shadow-inner">
            <input 
              type="email" 
              placeholder="E-mail do novo professor" 
              required
              className="px-6 py-4 rounded-2xl bg-white border-none text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 min-w-[300px] font-bold"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <button className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-400 transition-all active:scale-95 shadow-xl">
              <Send size={18} />
              Gerar Link
            </button>
          </form>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 w-fit mx-auto sm:mx-0 shadow-sm">
        <button 
          onClick={() => setActiveView('active')}
          className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeView === 'active' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <UserCheck size={18} /> Professores Ativos
        </button>
        <button 
          onClick={() => setActiveView('invites')}
          className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeView === 'invites' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Clock size={18} /> Convites ({invites.length})
        </button>
      </div>

      {/* Lista de Professores Ativos */}
      {activeView === 'active' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Users className="text-indigo-600" size={24} />
              <h3 className="font-black text-slate-800 text-xl">Equipe Pedagógica</h3>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{teachers.length} PROFESSORES</span>
          </div>
          <div className="divide-y divide-slate-100">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-[1.25rem] flex items-center justify-center text-indigo-600 font-black text-2xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-xl leading-tight">{teacher.name}</p>
                    <p className="text-sm text-slate-400 font-bold mb-2">{teacher.email}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.classes.map((c: string) => (
                        <span key={c} className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                      <Ban size={16} className="text-slate-400" /> Desativar
                   </button>
                   <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                      <ChevronRight size={20} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Convites */}
      {activeView === 'invites' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Mail className="text-orange-500" size={24} />
              <h3 className="font-black text-slate-800 text-xl">Acessos Pendentes</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {invites.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <Mail size={40} />
                 </div>
                 <p className="text-slate-400 font-bold">Nenhum convite pendente.</p>
              </div>
            ) : invites.map((invite) => (
              <div key={invite.id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-orange-50/20 transition-all group">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-sm border ${invite.status === 'Aceito' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                    <LinkIcon size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-xl leading-tight">{invite.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${invite.status === 'Aceito' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {invite.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">Expira em 48h</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {invite.status === 'Pendente' && (
                    <button 
                      onClick={() => copyToClipboard(invite.id, invite.inviteLink)}
                      className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-black transition-all shadow-md active:scale-95 ${
                        copiedId === invite.id 
                        ? 'bg-green-600 text-white shadow-green-100' 
                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600'
                      }`}
                    >
                      {copiedId === invite.id ? <Check size={18} /> : <ExternalLink size={18} />}
                      {copiedId === invite.id ? 'Copiado!' : 'Copiar Link'}
                    </button>
                  )}
                  <button 
                    onClick={() => handleRevokeInvite(invite.id)}
                    className="p-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors"
                    title="Excluir Convite"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
