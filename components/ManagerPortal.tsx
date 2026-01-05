
import React, { useMemo, useState, useEffect } from 'react';
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
  Save,
  Edit3
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

  useEffect(() => {
    setTempName(schoolName);
  }, [schoolName]);

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    await db.saveSchoolName(tempName.trim());
    setSchoolName(tempName.trim());
    setIsEditingName(false);
  };

  const gradeDistribution = [
    { name: '1º Ano', alunos: 45 },
    { name: '2º Ano', alunos: 38 },
    { name: '3º Ano', alunos: 42 },
    { name: '4º Ano', alunos: 35 },
    { name: '5º Ano', alunos: 28 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
              <p className="text-xs text-slate-400 italic">Este nome será exibido em todos os cabeçalhos, avisos impressos e relatórios oficiais.</p>
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

      {/* Header Gestor */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Building2 size={240} />
        </div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <School size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Painel do Gestor</span>
            </div>
            <h2 className="text-5xl font-black tracking-tight">{schoolName}</h2>
            <p className="text-slate-400 max-w-xl font-medium text-lg leading-relaxed opacity-80">Relatório estratégico consolidado. Monitoramento total da rede de ensino e conformidade BNCC.</p>
          </div>
          <div className="flex flex-wrap gap-4">
             <button 
                onClick={() => { setTempName(schoolName); setIsEditingName(true); }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 font-black transition-all flex items-center gap-3 shadow-lg"
              >
                <Settings size={20} /> Configurar Escola
             </button>
             <button className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-3">
                <TrendingUp size={20} /> Balanço Geral
             </button>
          </div>
        </div>
      </div>

      {/* Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-400 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Users size={28} />
            </div>
            <span className="text-green-500 text-[10px] font-black flex items-center bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-tighter">
              +4% <ArrowUpRight size={14} className="ml-1" />
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Docentes</p>
            <p className="text-4xl font-black text-slate-900">14</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-indigo-400 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Briefcase size={28} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vagas Ocupadas</p>
            <p className="text-4xl font-black text-slate-900">92%</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-purple-400 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-purple-50 p-4 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <TrendingUp size={28} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Média Escolar</p>
            <p className="text-4xl font-black text-slate-900">7.8</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-slate-400 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-slate-50 p-4 rounded-2xl text-slate-600 group-hover:bg-slate-600 group-hover:text-white transition-all">
              <UserCog size={28} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Acessos Hoje</p>
            <p className="text-4xl font-black text-slate-900">18</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-3">
            <PieIcon className="text-indigo-500" size={28} /> Alunos por Série
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 900, fontSize: 12}} width={90} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="alunos" fill="#6366f1" radius={[0, 12, 12, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <UserCog className="text-blue-500" size={28} /> Equipe em Operação
            </h3>
            <button className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">Painel Completo</button>
          </div>
          <div className="space-y-6">
            {[
              { name: 'Mariana Costa', role: 'Coordenadora', status: 'Online' },
              { name: 'Ricardo Alves', role: 'Professor', status: 'Online' },
              { name: 'Silvia Mendes', role: 'Professor', status: 'Offline' },
              { name: 'Carla Peixoto', role: 'Professor', status: 'Online' },
            ].map((person, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 group hover:border-blue-300 hover:bg-white transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-800 leading-tight">{person.name}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{person.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex flex-col items-end">
                      <span className={`w-2.5 h-2.5 rounded-full ${person.status === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{person.status}</span>
                   </div>
                   <ChevronRight size={20} className="text-slate-300 ml-4 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
