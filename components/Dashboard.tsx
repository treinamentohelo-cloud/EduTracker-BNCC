
import React, { useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  AlertCircle, 
  TrendingUp, 
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight
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

export const Dashboard: React.FC = () => {
  const students = useMemo(() => db.getStudents(), []);
  const classes = useMemo(() => db.getClasses(), []);

  const stats = useMemo(() => {
    const total = students.length;
    const adequate = students.filter(s => s.status === StudentStatus.ADEQUATE).length;
    const developing = students.filter(s => s.status === StudentStatus.DEVELOPING).length;
    const needsRef = students.filter(s => s.status === StudentStatus.NEEDS_REINFORCEMENT).length;
    
    return {
      total,
      classes: classes.length,
      adequate,
      developing,
      needsRef,
      diffTotal: developing + needsRef,
      percAdequate: total > 0 ? Math.round((adequate / total) * 100) : 0
    };
  }, [students, classes]);

  const pieData = [
    { name: 'Adequado', value: stats.adequate, color: '#1d63ed' },
    { name: 'Em Desenv.', value: stats.developing, color: '#f59e0b' },
    { name: 'Reforço', value: stats.needsRef, color: '#f43f5e' },
  ];

  // Dados mockados para o gráfico de barras por disciplina (já que as avaliações reais dependem de lançamentos)
  const barData = [
    { name: 'Português', achieved: 75, developing: 15, failed: 10 },
    { name: 'Matemática', achieved: 60, developing: 25, failed: 15 },
    { name: 'Ciências', achieved: 85, developing: 10, failed: 5 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-300 transition-all">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Turmas</p>
            <p className="text-2xl font-black text-slate-900">{stats.classes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-green-300 transition-all">
          <div className="bg-green-50 text-green-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Alunos</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        {/* Card Detalhado de Dificuldades */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 group hover:border-rose-300 transition-all col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Com Dificuldades</p>
              <p className="text-2xl font-black text-slate-900">{stats.diffTotal}</p>
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-slate-50">
            <div className="flex-1 bg-rose-50 px-3 py-2 rounded-xl">
              <p className="text-[10px] font-black text-rose-600 uppercase">Reforço</p>
              <p className="text-lg font-black text-rose-700">{stats.needsRef}</p>
            </div>
            <div className="flex-1 bg-amber-50 px-3 py-2 rounded-xl">
              <p className="text-[10px] font-black text-amber-600 uppercase">Atenção</p>
              <p className="text-lg font-black text-amber-700">{stats.developing}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-300 transition-all">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Evolução Adequada</p>
            <p className="text-2xl font-black text-slate-900">{stats.percAdequate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800">Desempenho por Disciplina</h3>
              <p className="text-sm text-slate-400 font-medium italic">Visão geral do aproveitamento BNCC</p>
            </div>
            <select className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none font-bold text-slate-600">
              <option>Consolidado Anual</option>
              {classes.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Bar dataKey="achieved" fill="#1d63ed" radius={[6, 6, 0, 0]} name="Atingiu" barSize={32} />
                <Bar dataKey="developing" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Em Desenvolvimento" barSize={32} />
                <Bar dataKey="failed" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Não Atingiu" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-2">Status dos Alunos</h3>
          <p className="text-sm text-slate-400 font-medium mb-6">Distribuição atual da unidade</p>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-sm font-bold text-slate-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{item.value}</span>
                  <span className="text-[10px] text-slate-400 font-bold">({stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IA Insights Section */}
      <div className="bg-gradient-to-br from-[#1d63ed] to-[#0047d1] p-10 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
           <Lightbulb size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
            <Lightbulb size={40} className="text-amber-300 fill-amber-300" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full text-[10px] font-black tracking-widest uppercase">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Analítico IA Ativo
            </div>
            <h3 className="text-3xl font-black">Insight Pedagógico do Dia</h3>
            <p className="text-blue-50 leading-relaxed text-lg max-w-4xl opacity-90 italic">
              "Com base nos dados atuais, a Turma B apresenta uma lacuna de 15% na habilidade de Consciência Fonológica. Intensificar atividades de rima e ludicidade nesta semana pode acelerar a recuperação destes alunos."
            </p>
            <div className="flex gap-4 pt-2">
               <button className="px-8 py-3.5 bg-white text-blue-700 font-black rounded-2xl text-sm hover:scale-105 active:scale-95 transition-all shadow-xl">
                 Ver Plano de Intervenção
               </button>
               <button className="px-8 py-3.5 bg-blue-500/30 text-white font-black rounded-2xl text-sm hover:bg-blue-500/50 transition-all border border-white/20">
                 Gerar Novo Insight
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
