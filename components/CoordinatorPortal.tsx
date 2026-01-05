
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
  Ban,
  Settings,
  X,
  Save,
  Edit3
} from 'lucide-react';
import { UserRole, TeacherInvite } from '../types';
import { db } from '../services/db';

export const CoordinatorPortal: React.FC = () => {
  const [invites, setInvites] = useState<TeacherInvite[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'invites' | 'active'>('active');

  // Escola State
  const [schoolName, setSchoolName] = useState(db.getSchoolName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(schoolName);

  useEffect(() => {
    setInvites(db.getInvites());
    setTeachers(db.getTeachers());
  }, []);

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    await db.saveSchoolName(tempName.trim());
    setSchoolName(tempName.trim());
    setIsEditingName(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    
    const id = Math.random().toString(36).substr(2, 9);
    // CRITICAL: Usa window.location.origin para garantir que o link aponte para o endereço real do app (local ou produção)
    const appUrl = window.location.origin;
    const inviteLink = `${appUrl}?invite=${id}&email=${encodeURIComponent(newEmail)}`;
    
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
    alert(`Convite gerado! Envie o link para ${newEmail}`);
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
      
      {/* Modal de Edição de Nome da Unidade */}
      {isEditingName && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Edit3 size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Editar Unidade</h3>
              </div>
              <button onClick={() => setIsEditingName(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={28} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Oficial da Escola</label>
                <input 
                  autoFocus
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-xl text-slate-700" 
                  value={tempName} 
                  onChange={e => setTempName(e.target.value)} 
                  placeholder="Ex: E.M. Primavera"
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSaveName}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-700 transition-all text-lg flex items-center justify-center gap-2"
              >
                <Save size={24} /> Atualizar Unidade
              </button>
              <button 
                onClick={() => setIsEditingName(false)}
                className="w-full py-5 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black text-lg hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Principal */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <ShieldCheck size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full text-[10px] font-black tracking-widest uppercase ring-1 ring-white/30">
              <Shield size={14} />
              {schoolName}
            </div>
            <h2 className="text-4xl font-black">Portal do Coordenador</h2>
            <p className="text-indigo-100 max-w-lg text-lg font-medium leading-relaxed opacity-90">
              Gerencie o acesso dos professores e configure a identidade visual da unidade escolar.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => { setTempName(schoolName); setIsEditingName(true); }}
                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl border border-white/20 font-black text-xs uppercase flex items-center gap-2 transition-all"
              >
                <Settings size={16} /> Configurar Nome da Escola
              </button>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 w-full md:w-auto">
            <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">Convidar Novo Professor</h4>
            <form onSubmit={handleInvite} className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="E-mail institucional" 
                required
                className="px-6 py-4 rounded-2xl bg-white border-none text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 min-w-[300px] font-bold"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <button className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-400 transition-all active:scale-95 shadow-xl">
                <Send size={18} />
                Gerar Link de Acesso
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tabs e Listas (Omitido para brevidade, mantém original) */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 w-fit mx-auto sm:mx-0 shadow-sm">
        <button onClick={() => setActiveView('active')} className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeView === 'active' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}><UserCheck size={18} /> Professores Ativos</button>
        <button onClick={() => setActiveView('invites')} className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeView === 'invites' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}><Clock size={18} /> Convites ({invites.length})</button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {activeView === 'invites' ? (
          <div className="divide-y divide-slate-100">
            {invites.map((invite) => (
              <div key={invite.id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-orange-50/20 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-[1.25rem] flex items-center justify-center shadow-sm"><LinkIcon size={24} /></div>
                  <div>
                    <p className="font-black text-slate-900 text-xl leading-tight">{invite.email}</p>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-orange-100 text-orange-700 uppercase">{invite.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => copyToClipboard(invite.id, invite.inviteLink)} className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-black transition-all ${copiedId === invite.id ? 'bg-green-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-700'}`}>
                    {copiedId === invite.id ? <Check size={18} /> : <ExternalLink size={18} />}
                    {copiedId === invite.id ? 'Copiado!' : 'Copiar Link'}
                  </button>
                  <button onClick={() => handleRevokeInvite(invite.id)} className="p-4 text-rose-500 hover:bg-rose-50 rounded-2xl"><Trash2 size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center text-slate-400 font-bold">Lista de professores ativos sincronizada com o banco de dados.</div>
        )}
      </div>
    </div>
  );
};
