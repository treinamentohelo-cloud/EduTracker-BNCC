
import React, { useState } from 'react';
import { FileText, Download, CheckCircle, Clock, AlertTriangle, FilePieChart } from 'lucide-react';
import { exportToPDF } from '../services/pdfService';
import { MOCK_STUDENTS } from '../constants';

export const Reports: React.FC = () => {
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const reportTypes = [
    { 
      id: 'individual', 
      title: 'Relatório Individual do Aluno', 
      desc: 'Desempenho detalhado por habilidade BNCC',
      data: MOCK_STUDENTS.map(s => ({ name: s.name, status: s.status }))
    },
    { 
      id: 'turma', 
      title: 'Panorama da Turma', 
      desc: 'Gráficos de evolução e comparativos das turmas cadastradas',
      data: [{ title: 'Turma A', status: '85% Atingido' }, { title: 'Turma B', status: '62% Atingido' }]
    },
    { 
      id: 'ata', 
      title: 'Ata de Resultados Trimestral', 
      desc: 'Documento oficial estruturado para coordenação pedagógica',
      data: [{ title: 'Fechamento 1º Trimestre', status: 'Completo' }]
    },
    { 
      id: 'critico', 
      title: 'Relatório de Habilidades Críticas', 
      desc: 'Identifica lacunas de aprendizagem que precisam de foco imediato',
      data: [{ title: 'Habilidade EF01MA01', desc: 'Dificuldade alta em 40% dos alunos' }]
    },
  ];

  const handleExport = (report: any) => {
    setLoadingReport(report.id);
    setTimeout(() => {
      exportToPDF(report.title, report.data);
      setLoadingReport(null);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 text-green-600 p-3 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Prontos</p>
            <p className="text-2xl font-bold text-slate-900">12</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-yellow-100 text-yellow-600 p-3 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Em Geração</p>
            <p className="text-2xl font-bold text-slate-900">03</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-red-100 text-red-600 p-3 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pendentes</p>
            <p className="text-2xl font-bold text-slate-900">01</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Centro de Documentação</h3>
            <p className="text-slate-500">Gere e baixe relatórios formatados de acordo com a BNCC.</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-xl">
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md">Modelos Pro</button>
             <button className="px-4 py-2 text-slate-500 text-sm font-bold hover:bg-slate-50 rounded-lg">Customizar</button>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {reportTypes.map((report) => (
            <div key={report.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50 transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:border-blue-200 group-hover:text-blue-500 transition-all shadow-sm">
                  <FilePieChart size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{report.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-md">{report.desc}</p>
                </div>
              </div>
              <button 
                onClick={() => handleExport(report)}
                disabled={loadingReport === report.id}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg min-w-[140px] ${
                  loadingReport === report.id
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 active:scale-95'
                }`}
              >
                {loadingReport === report.id ? (
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {loadingReport === report.id ? 'Gerando...' : 'Exportar PDF'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
