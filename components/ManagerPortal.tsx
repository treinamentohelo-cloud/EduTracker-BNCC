
import React, { useMemo, useState } from 'react';
import { 
  Building2, 
  Users, 
  UserCog, 
  TrendingUp, 
  PieChart as PieIcon,
  Briefcase,
  Settings,
  ChevronRight,
  School,
  ArrowUpRight,
  X,
  Save
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { db } from '../services/db';
import { UserRole } from '../types';

export const ManagerPortal: React.FC = () => {
  const students = useMemo(() => db.getStudents(), []);
  const classes = useMemo(() => db.getClasses(), []);
  const invites = useMemo(() => db.getInvites(), []);

  const [schoolName, setSchoolName] = useState(db.getSchoolName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(schoolName);

  const staffData = [
    { role: 'Coordenadores', count: 2, color: '#6366f1' },
    { role: 'Professores', count: 12, color: '#3b82f6' },
    { role: 'Administrativo', count: 4, color: '#94a3b8' },
  ];

  const gradeDistribution = [
    { name: '1º Ano', alunos: 45 },
    { name: '2º Ano', alunos: 38 },
    { name: '3º Ano', alunos: 42 },
    { name: '4º Ano', alunos: 35 },
    { name: '5º Ano', alunos: 28 },
  ];

  const handleSaveName = () => {
    db.saveSchoolName(tempName);
    setSchoolName(tempName);
    setIsEditingName(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Modal de Edição de Nome */}
      {isEditingName && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">Editar Unidade</h3>
              <button onClick={() => setIsEditingName(false)} className="text-slate-400 hover:text-slate-600 p-2"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome da Escola</label>
                <input 
                  autoFocus
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  value={tempName} 
                  onChange={e => setTempName(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                />
              </div>
            </div>
            <button 
              onClick={handleSaveName}
              className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
            >
              <Save size={20} /> Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {/* Header Gestor */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Building2 size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <School size={20} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Gestão Institucional</span>
            </div>
            <h2 className="text-4xl font-black">{schoolName}</h2>
            <p className="text-slate-400 max-w-lg font-medium">Relatório estratégico consolidado. Dados atualizados em tempo real conforme lançamentos BNCC.</p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => { setTempName(schoolName); setIsEditingName(true); }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 font-bold transition-all flex items-center gap-2"
              >
                <Settings size={18} /> Alterar Nome
             </button>
             <button className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
                <TrendingUp size={18} /> Exportar Balanço
             </button>
          </div>
        </div>
      </div>

      {/* Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <Users size={24} />
            </div>
            <span className="text-green-500 text-xs font-bold flex items-center bg-green-50 px-2 py-1 rounded-lg">
              +4% <ArrowUpRight size={14} />
            </span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Corpo Docente</p>
          <p className="text-3xl font-black text-slate-900">14</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <Briefcase size={24} />
            </div>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Vagas Ocupadas</p>
          <p className="text-3xl font-black text-slate-900">92%</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Média BNCC Escola</p>
          <p className="text-3xl font-black text-slate-900">7.8</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-slate-50 p-3 rounded-2xl text-slate-600">
              <UserCog size={24} />
            </div>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Acessos Hoje</p>
          <p className="text-3xl font-black text-slate-900">18</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribuição por Série */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
            <PieIcon className="text-indigo-500" size={24} /> Alunos por Série
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 700}} width={80} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="alunos" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipe Resumo */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <UserCog className="text-blue-500" size={24} /> Equipe Ativa
            </h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">Ver Todos</button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Mariana Costa', role: 'Coordenadora', status: 'Online' },
              { name: 'Ricardo Alves', role: 'Professor', status: 'Online' },
              { name: 'Silvia Mendes', role: 'Professor', status: 'Offline' },
              { name: 'Carla Peixoto', role: 'Professor', status: 'Online' },
            ].map((person, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 leading-tight">{person.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{person.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${person.status === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                   <span className="text-[10px] font-bold text-slate-500">{person.status}</span>
                   <ChevronRight size={16} className="text-slate-300 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
