
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
  Lightbulb
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
    const adequado = students.filter(s => s.status === StudentStatus.ADEQUATE).length;
    const emDesenvolvimento = students.filter(s => s.status === StudentStatus.DEVELOPING).length;
    const precisaReforco = students.filter(s => s.status === StudentStatus.NEEDS_REINFORCEMENT).length;
    
    return {
      total,
      classes: classes.length,
      adequado,
      emDesenvolvimento,
      precisaReforco,
      percAdequado: total > 0 ? Math.round((adequado / total) * 100) : 0
    };
  }, [students, classes]);

  const pieData = [
    { name: 'Adequado', value: stats.adequado, color: '#10b981' },
    { name: 'Em Desenvolvimento', value: stats.emDesenvolvimento, color: '#f59e0b' },
    { name: 'Reforço', value: stats.precisaReforco, color: '#ef4444' },
  ];

  const barData = [
    { name: 'Língua Portuguesa', atingido: 75, desenvolvimento: 15 },
    { name: 'Matemática', atingido: 62, desenvolvimento: 23 },
    { name: 'Ciências', atingido: 88, desenvolvimento: 8 },
    { name: 'Geografia', atingido: 70, desenvolvimento: 20 },
  ];

  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-[1280px] mx-auto pb-6">
      
      {/* Cabeçalho Compacto e Centralizado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 mb-2">
        <div className="animate-in slide-in-from-left-4 duration-700">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {getSaudacao()}, Educador <span className="text-blue-600">Eduardo</span> 👋
          </h2>
          <p className="text-slate-400 font-bold text-sm italic">Visão estratégica da rede • 2026</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-lg border border-slate-100 animate-in slide-in-from-right-4 duration-700">
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-100">
            <Calendar size={14} className="shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest">Ano Letivo 2026</span>
          </div>
        </div>
      </div>

      {/* Grid de Cards Menores e Elegantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Alunos', valor: stats.total, sub: 'Matriculados', icone: Users, cor: 'blue', delay: 100 },
          { label: 'Turmas Ativas', valor: stats.classes, sub: 'Unidades', icone: School, cor: 'indigo', delay: 200 },
          { label: 'Aproveitamento BNCC', valor: `${stats.percAdequado}%`, sub: 'Meta Global', icone: Target, cor: 'emerald', delay: 300, destaque: true },
          { label: 'Alerta de Reforço', valor: stats.precisaReforco, sub: 'Crítico', icone: AlertCircle, cor: 'rose', delay: 400 },
        ].map((card, idx) => (
          <div 
            key={idx}
            className={`p-5 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all duration-500 group relative overflow-hidden transform hover:-translate-y-2 hover:shadow-xl hover:scale-[1.02] animate-in slide-in-from-bottom-2 ${card.destaque ? 'bg-slate-900 text-white' : 'bg-white'}`}
            style={{ animationDelay: `${card.delay}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md mb-3 transition-transform group-hover:rotate-6 ${card.destaque ? 'bg-white/10 border border-white/20' : 'bg-' + card.cor + '-600 text-white'}`}>
              <card.icone size={20} />
            </div>
            <div>
              <p className={`text-[9px] font-black uppercase tracking-[0.1em] mb-1 ${card.destaque ? 'text-blue-300' : 'text-slate-400'}`}>{card.label}</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-black">{card.valor}</h4>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${card.destaque ? 'text-blue-400' : 'text-' + card.cor + '-500'}`}>{card.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico Compacto */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Desempenho por Área</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Métricas BNCC</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black text-slate-400 uppercase">Atingido</span></div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div><span className="text-[9px] font-black text-slate-400 uppercase">Desenv.</span></div>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', padding: '10px', fontSize: '11px'}}
                />
                <Bar dataKey="atingido" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="desenvolvimento" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Circular Compacto */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Status Geral</h3>
          </div>
          
          <div className="flex-1 relative min-h-[160px] my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={6} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
               <p className="text-xl font-black text-slate-900">{stats.total}</p>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Alunos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50/80 rounded-xl border border-transparent hover:border-slate-200 transition-all hover:bg-white group">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-[9px] font-black text-slate-600">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IA Pedagógica Compacta */}
      <div className="bg-gradient-to-br from-[#1d63ed] to-[#1e1b4b] p-0.5 shadow-xl rounded-[2.5rem] animate-in slide-up-4 duration-1000">
        <div className="bg-white/5 backdrop-blur-2xl p-6 md:p-8 rounded-[2.4rem] text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
                <Sparkles size={14} className="text-blue-300" />
                <span className="text-[8px] font-black tracking-[0.2em] uppercase text-blue-100">Inteligência Pedagógica</span>
              </div>
              <h3 className="text-2xl font-black leading-tight tracking-tight text-center lg:text-left">Seu assistente para o Sucesso.</h3>
            </div>

            <div className="lg:col-span-7 bg-white/10 border border-white/20 rounded-[2rem] p-5 backdrop-blur-2xl hover:bg-white/15 transition-all">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                 <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <Lightbulb size={20} className="text-white" />
                 </div>
                 <h4 className="text-base font-black">Intervenção 2026</h4>
              </div>
              <p className="text-xs font-medium leading-relaxed mb-4 opacity-90 text-center lg:text-left">Habilidade EF01LP05 em foco: Oficina de leitura lúdica recomendada.</p>
              <button className="w-full px-6 py-3 bg-blue-500 text-white font-black rounded-xl hover:bg-blue-400 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group text-xs">
                Gerar Plano <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
