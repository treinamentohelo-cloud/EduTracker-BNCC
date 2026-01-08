
import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle, 
  Clock, 
  Users, 
  Target,
  ShieldCheck,
  BarChart3,
  Sparkles,
  Award
} from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { db } from '../services/db';
import { MOCK_STUDENTS } from '../constants';

export const Reports: React.FC = () => {
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const reinforcementHistory = db.getReinforcementHistory();

  const reportTypes = [
    { id: 'individual', title: 'Aluno (Individual)', desc: 'Dossiê BNCC completo por estudante.', icon: Users, color: 'blue', data: MOCK_STUDENTS.map(s => ({ name: s.name, status: s.status })) },
    { id: 'reinforcement-conclusions', title: 'Altas de Reforço', desc: 'Histórico de alunos que concluíram o reforço.', icon: Award, color: 'emerald', data: reinforcementHistory.map(rh => ({ title: rh.studentName, status: `${rh.discipline} | ${new Date(rh.completionDate).toLocaleDateString()}` })) },
    { id: 'turma', title: 'Coletivo da Turma', desc: 'Médias globais e desempenho coletivo.', icon: BarChart3, color: 'indigo', data: [{ title: 'Turma A', status: '85%' }] },
    { id: 'ata', title: 'Ata de Resultados', desc: 'Fechamento oficial para arquivo.', icon: ShieldCheck, color: 'green', data: [{ title: 'Ata 1º Tri', status: 'OK' }] },
    { id: 'critico', title: 'Alertas de Habilidades', desc: 'Lacunas críticas que requerem ação.', icon: Target, color: 'rose', data: [{ title: 'EF01MA01', desc: '40% Dificuldade' }] },
    { id: 'ia-audit', title: 'Auditoria IA', desc: 'Insights automáticos sobre o currículo.', icon: Sparkles, color: 'purple', data: [{ title: 'Audit BNCC', status: 'Conforme' }] },
  ];

  const handleExport = (report: any) => {
    setLoadingReport(report.id);
    setTimeout(() => {
      exportToPDF(report.title, report.data);
      setLoadingReport(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Centro de Documentação</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Geração de relatórios pedagógicos estratégicos</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <CheckCircle size={16} className="text-emerald-500" />
            <div><p className="text-sm font-black text-slate-900 leading-none">{12 + reinforcementHistory.length}</p><p className="text-[8px] font-black text-slate-400 uppercase">Exportados</p></div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Clock size={16} className="text-amber-500" />
            <div><p className="text-sm font-black text-slate-900 leading-none">03</p><p className="text-[8px] font-black text-slate-400 uppercase">Em Fila</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 bg-slate-50 rounded-lg text-blue-600 transition-transform group-hover:scale-110`}>
                <report.icon size={18} />
              </div>
            </div>
            <div className="flex-1 space-y-1 mb-6">
              <h4 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{report.title}</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{report.desc}</p>
            </div>
            <button 
              onClick={() => handleExport(report)}
              disabled={loadingReport === report.id}
              className={`w-full py-2 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                loadingReport === report.id ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95'
              }`}
            >
              {loadingReport === report.id ? <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <Download size={14} />}
              {loadingReport === report.id ? 'Gerando...' : 'Baixar PDF'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
