
import React, { useMemo } from 'react';
import { 
  Users, 
  AlertCircle, 
  School,
  Target,
  BarChart3,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Award,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { db } from '../services/db';
import { StudentStatus } from '../types';

interface DashboardProps {
  userEmail?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userEmail }) => {
  const students = useMemo(() => db.getStudents(), []);
  const classes = useMemo(() => db.getClasses(), []);
  const history = useMemo(() => db.getReinforcementHistory(), []);

  const stats = useMemo(() => {
    const total = students.length;
    const adequado = students.filter(s => s.status === StudentStatus.ADEQUATE).length;
    const emDesenvolvimento = students.filter(s => s.status === StudentStatus.DEVELOPING).length;
    const precisaReforco = students.filter(s => s.status === StudentStatus.NEEDS_REINFORCEMENT).length;
    
    return {
      total,
      classes: classes.length,
      adequado,
      emDesenvolvimento,
      precisaReforco,
      concluidos: history.length,
      percAdequado: total > 0 ? Math.round((adequado / total) * 100) : 0
    };
  }, [students, classes, history]);

  const pieData = [
    { name: 'Adequado', value: stats.adequado, color: '#10b981' },
    { name: 'Em Desenvolvimento', value: stats.emDesenvolvimento, color: '#f59e0b' },
    { name: 'Reforço', value: stats.precisaReforco, color: '#ef4444' },
  ];

  const barData = [
    { name: 'Port.', atingido: 75, desenvolvimento: 15 },
    { name: 'Mat.', atingido: 62, desenvolvimento: 23 },
    { name: 'Ciên.', atingido: 88, desenvolvimento: 8 },
    { name: 'Geo.', atingido: 70, desenvolvimento: 20 },
  ];

  const getSaudacao = () => {
    const hora = new Date().getHours();
    const rawName = userEmail ? userEmail.split('@')[0] : 'Docente';
    const userName = rawName.split(/[._-]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    
    let saudacao = "Bom dia";
    if (hora >= 12 && hora < 18) saudacao = "Boa tarde";
    else if (hora >= 18) saudacao = "Boa noite";
    
    return { saudacao, userName };
  };

  const { saudacao, userName } = getSaudacao();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 w-full pb-8">
      
      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">Painel de Controle</span>
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            {saudacao}, <span className="text-blue-600">{userName}</span>
          </h2>
          <p className="text-slate-400 font-bold text-sm italic">Acompanhamento Pedagógico 2026</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-200">
            <Calendar size={14} className="shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest">Fev 2026</span>
          </div>
        </div>
      </div>

      {/* Grid de Cards Densos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Alunos', valor: stats.total, sub: 'Total', icone: Users, colorClass: 'blue' },
          { label: 'Turmas', valor: stats.classes, sub: 'Ativas', icone: School, colorClass: 'indigo' },
          { label: 'BNCC', valor: `${stats.percAdequado}%`, sub: 'Meta Global', icone: Target, colorClass: 'emerald' },
          { label: 'Alertas', valor: stats.precisaReforco, sub: 'Em Reforço', icone: AlertCircle, colorClass: 'rose' },
          { label: 'Altas', valor: stats.concluidos, sub: 'Concluídos', icone: Award, colorClass: 'amber', destaque: true },
        ].map((card, idx) => (
          <div 
            key={idx}
            className={`p-4 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 group overflow-hidden hover:-translate-y-1 hover:shadow-lg ${card.destaque ? 'bg-indigo-900 text-white border-indigo-800' : 'bg-white'}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-all ${card.destaque ? 'bg-amber-400 text-indigo-950' : `bg-${card.colorClass}-50 text-${card.colorClass}-600`}`}>
              <card.icone size={16} />
            </div>
            <div>
              <p className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${card.destaque ? 'text-indigo-300' : 'text-slate-400'}`}>{card.label}</p>
              <div className="flex items-baseline gap-1.5">
                <h4 className="text-xl font-black">{card.valor}</h4>
                <span className={`text-[8px] font-bold uppercase tracking-widest ${card.destaque ? 'text-amber-400' : `text-${card.colorClass}-500`}`}>{card.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[380px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Evolução por Disciplina</h3>
            <div className="flex gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[8px] font-black text-slate-500 uppercase">Atingido</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[8px] font-black text-slate-500 uppercase">Desenv.</span></div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', fontSize: '11px'}} />
                <Bar dataKey="atingido" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="desenvolvimento" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[380px]">
          <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <TrendingUp size={16} className="text-indigo-500" /> Altas Recentes
          </h3>
          
          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
            {history.length > 0 ? history.slice(0, 10).map((h) => (
              <div key={h.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-emerald-200 transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xs border border-emerald-100">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 leading-none mb-1">{h.studentName}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                       <Clock size={8} /> {new Date(h.startDate).toLocaleDateString('pt-BR')} → {new Date(h.completionDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase border border-emerald-100">{h.discipline}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                <Award size={40} className="mb-2 text-slate-400" />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nenhuma alta registrada</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
             <div className="bg-emerald-50 p-4 rounded-2xl flex items-center justify-between border border-emerald-100">
                <div>
                   <p className="text-[10px] font-black text-emerald-900 leading-none">Total de Altas</p>
                   <p className="text-[8px] font-bold text-emerald-400 uppercase mt-1">Acumulado 2026</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-emerald-600 leading-none">{stats.concluidos}</p>
                   <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Estudantes</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
