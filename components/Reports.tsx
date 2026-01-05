
import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FilePieChart, 
  TrendingUp, 
  Users, 
  Target,
  FileSearch,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { MOCK_STUDENTS } from '../constants';

export const Reports: React.FC = () => {
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const reportTypes = [
    { 
      id: 'individual', 
      title: 'Individual do Aluno', 
      desc: 'Dossiê pedagógico completo com evolução de competências e pareceres individuais.',
      icon: Users,
      color: 'blue',
      complexity: 'Alta',
      data: MOCK_STUDENTS.map(s => ({ name: s.name, status: s.status }))
    },
    { 
      id: 'turma', 
      title: 'Panorama Coletivo', 
      desc: 'Visão macro das turmas, identificando médias globais e percentuais de atingimento.',
      icon: BarChart3,
      color: 'indigo',
      complexity: 'Média',
      data: [{ title: 'Turma A', status: '85% Atingido' }, { title: 'Turma B', status: '62% Atingido' }]
    },
    { 
      id: 'ata', 
      title: 'Ata de Resultados', 
      desc: 'Documento oficial trimestral estruturado para assinaturas e arquivo escolar.',
      icon: ShieldCheck,
      color: 'green',
      complexity: 'Média',
      data: [{ title: 'Fechamento 1º Trimestre', status: 'Completo' }]
    },
    { 
      id: 'critico', 
      title: 'Habilidades Críticas', 
      desc: 'Relatório inteligente focado em lacunas críticas que demandam intervenção urgente.',
      icon: Target,
      color: 'rose',
      complexity: 'Crítica',
      data: [{ title: 'Habilidade EF01MA01', desc: 'Dificuldade alta em 40% dos alunos' }]
    },
    { 
      id: 'reforco', 
      title: 'Desempenho de Reforço', 
      desc: 'Análise da eficácia das células de reforço e evolução dos alunos em intervenção.',
      icon: TrendingUp,
      color: 'amber',
      complexity: 'Baixa',
      data: [{ title: 'Grupo Alfabetização', status: '75% Recuperação' }]
    },
    { 
      id: 'ia-audit', 
      title: 'Auditoria IA BNCC', 
      desc: 'Insights automatizados sobre a conformidade do currículo prático com a base nacional.',
      icon: Sparkles,
      color: 'purple',
      complexity: 'Alta',
      data: [{ title: 'Audit Consolidado', status: 'Conforme' }]
    },
  ];

  const handleExport = (report: any) => {
    setLoadingReport(report.id);
    setTimeout(() => {
      exportToPDF(report.title, report.data);
      setLoadingReport(null);
    }, 1500);
  };

  const getTheme = (color: string) => {
    const themes: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300',
      green: 'bg-green-50 text-green-600 border-green-100 hover:border-green-300',
      rose: 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300',
      amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300',
      purple: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300',
    };
    return themes[color] || themes.blue;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Header com Stats em Card Flutuante */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full w-fit">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Documentação Oficial</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Centro de Inteligência</h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">Exporte dados estratégicos convertidos em documentos prontos para análise pedagógica ou coordenação.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-4 bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-100">
            <div className="bg-green-500 text-white p-3 rounded-2xl shadow-lg shadow-green-100"><CheckCircle size={24} /></div>
            <div><p className="text-2xl font-black text-slate-900 leading-none">12</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Concluídos</p></div>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-100">
            <div className="bg-amber-500 text-white p-3 rounded-2xl shadow-lg shadow-amber-100"><Clock size={24} /></div>
            <div><p className="text-2xl font-black text-slate-900 leading-none">03</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Em Fila</p></div>
          </div>
        </div>
      </div>

      {/* Grid de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reportTypes.map((report) => (
          <div 
            key={report.id} 
            className={`group bg-white p-10 rounded-[3rem] border transition-all duration-500 flex flex-col h-full relative overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 ${getTheme(report.color)}`}
          >
            {/* Decoração Visual */}
            <div className="absolute -right-10 -top-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
               <report.icon size={240} />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className={`p-4 bg-white rounded-2xl shadow-xl transition-transform group-hover:scale-110`}>
                <report.icon size={32} />
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Complexidade</span>
                 <span className="text-xs font-black uppercase">{report.complexity}</span>
              </div>
            </div>

            <div className="space-y-4 flex-1 relative z-10 mb-10">
              <h4 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-current transition-colors">{report.title}</h4>
              <p className="text-slate-500 font-medium text-sm leading-relaxed leading-snug">
                {report.desc}
              </p>
            </div>

            <div className="pt-8 border-t border-slate-100 flex items-center justify-between relative z-10">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disponível</span>
               </div>
               <button 
                  onClick={() => handleExport(report)}
                  disabled={loadingReport === report.id}
                  className={`flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs transition-all shadow-xl active:scale-95 ${
                    loadingReport === report.id
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-black group-hover:shadow-indigo-200'
                  }`}
                >
                  {loadingReport === report.id ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {loadingReport === report.id ? 'Gerando...' : 'Baixar PDF'}
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Banner de Ajuda / Tutorial */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center gap-10 shadow-3xl shadow-slate-300 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 opacity-10 pointer-events-none">
          <FileSearch size={280} />
        </div>
        <div className="relative z-10 flex-1 space-y-4">
           <h3 className="text-3xl font-black">Precisa de um modelo customizado?</h3>
           <p className="text-slate-400 text-lg max-w-xl">Nossa equipe pode estruturar ATAS ou Relatórios específicos para a sua rede municipal ou estadual. Entre em contato com o suporte pedagógico.</p>
        </div>
        <button className="relative z-10 px-12 py-6 bg-white text-slate-900 font-black rounded-[2.5rem] hover:bg-slate-100 transition-all flex items-center gap-3 active:scale-95">
           Solicitar Modelo <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
