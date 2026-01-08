
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  UserCog, 
  TrendingUp, 
  PieChart as PieIcon,
  Briefcase,
  Settings,
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
  ResponsiveContainer
} from 'recharts';
import { db } from '../services/db';

export const ManagerPortal: React.FC = () => {
  const [schoolName, setSchoolName] = useState(db.getSchoolName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(schoolName);

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
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Banner Gestor Compacto */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Building2 size={120} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <School size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">Portal da Gestão Escolar</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{schoolName}</h2>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setIsEditingName(true)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-black text-[10px] uppercase transition-all flex items-center gap-2"><Settings size={14} /> Unidade</button>
             <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-black text-[10px] uppercase transition-all shadow-lg flex items-center gap-2"><TrendingUp size={14} /> Relatório Geral</button>
          </div>
        </div>
      </div>

      {/* Mini Cards Gestor Compactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Docentes', valor: '14', icone: Users, color: 'blue' },
          { label: 'Ocupação', valor: '92%', icone: Briefcase, color: 'indigo' },
          { label: 'Média', valor: '7.8', icone: TrendingUp, color: 'purple' },
          { label: 'Acessos', valor: '18', icone: UserCog, color: 'slate' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col group hover:border-indigo-400 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className={`text-${card.color}-600 bg-slate-50 p-2 rounded-lg`}>
                <card.icone size={20} />
              </div>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{card.label}</p>
              <p className="text-xl font-black text-slate-900">{card.valor}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[350px]">
          <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
            <PieIcon size={18} className="text-indigo-500" /> Distribuição por Série
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} layout="vertical" margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 800, fontSize: 10}} width={80} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', fontSize: '10px'}} />
                <Bar dataKey="alunos" fill="#4f46e5" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[350px]">
          <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
            <UserCog size={18} className="text-blue-500" /> Equipe Docente
          </h3>
          <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
            {[
              { name: 'Mariana Costa', role: 'Coordenação' },
              { name: 'Ricardo Alves', role: '1º Ano A' },
              { name: 'Silvia Mendes', role: '2º Ano C' },
              { name: 'Carla Peixoto', role: '5º Ano B' },
            ].map((person, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100 group hover:bg-white transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">{person.name.charAt(0)}</div>
                  <div>
                    <p className="text-xs font-black text-slate-900 leading-none">{person.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{person.role}</p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-slate-200 group-hover:text-blue-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
