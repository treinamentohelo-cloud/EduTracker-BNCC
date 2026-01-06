
import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Save, Edit, Trash2, Library, Filter, BookOpen, AlertCircle } from 'lucide-react';
import { db } from '../services/db';
import { BNCCSkill } from '../types';
import { ConfirmModal } from './ConfirmModal';

export const SkillManagement: React.FC = () => {
  const [skills, setSkills] = useState(db.getSkills());
  const [disciplines, setDisciplines] = useState(db.getDisciplines());
  const [activeDiscipline, setActiveDiscipline] = useState<string | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<BNCCSkill | null>(null);
  const [newDisciplineName, setNewDisciplineName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [newSkill, setNewSkill] = useState({
    code: '',
    name: '',
    discipline: disciplines[0] || '',
    description: '',
    grade: '1º'
  });

  const series = ['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º'];

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; code: string }>({
    isOpen: false,
    id: '',
    code: ''
  });

  useEffect(() => {
    const loadedSkills = db.getSkills();
    const loadedDisciplines = db.getDisciplines();
    setSkills(loadedSkills);
    setDisciplines(loadedDisciplines);
    if (!newSkill.discipline && loadedDisciplines.length > 0) {
      setNewSkill(prev => ({ ...prev, discipline: loadedDisciplines[0] }));
    }
  }, []);

  const filteredSkills = activeDiscipline === 'ALL' 
    ? skills 
    : skills.filter(s => s.discipline === activeDiscipline);

  const validateBNCCCode = (code: string, grade: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode.startsWith('EF')) return "Habilidades do Ensino Fundamental devem começar com 'EF'.";
    if (cleanCode.length < 4) return "Código incompleto. Use o padrão EFXX...";

    const codeAno = cleanCode.substring(2, 4);
    const anoNum = grade.replace('º', '').padStart(2, '0');
    
    // Regras de blocos BNCC (ex: EF12, EF15, EF69)
    const blocosEspeciais: Record<string, string[]> = {
      '12': ['1º', '2º'],
      '15': ['1º', '2º', '3º', '4º', '5º'],
      '35': ['3º', '4º', '5º'],
      '69': ['6º', '7º', '8º', '9º']
    };

    if (blocosEspeciais[codeAno]) {
      if (!blocosEspeciais[codeAno].includes(grade)) {
        return `O código '${cleanCode}' pertence ao bloco ${blocosEspeciais[codeAno].join('/')} e não condiz com o ${grade} ano selecionado.`;
      }
    } else if (codeAno !== anoNum) {
      return `O código indica ${parseInt(codeAno)}º ano, mas você selecionou ${grade} ano.`;
    }
    
    return null;
  };

  const handleAddOrEditSkill = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    const error = validateBNCCCode(newSkill.code, newSkill.grade);
    if (error) {
      setValidationError(error);
      return;
    }

    const skill: BNCCSkill = editingSkill 
      ? { ...editingSkill, ...newSkill, code: newSkill.code.toUpperCase() } 
      : { id: 'sk-' + Math.random().toString(36).substr(2, 5), ...newSkill, code: newSkill.code.toUpperCase() };
    
    db.saveSkill(skill);
    setSkills(db.getSkills());
    closeModal();
  };

  const handleAddDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisciplineName.trim()) return;
    await db.saveDiscipline(newDisciplineName.trim());
    setDisciplines(db.getDisciplines());
    setNewSkill(prev => ({ ...prev, discipline: newDisciplineName.trim() }));
    setNewDisciplineName('');
    setIsDisciplineModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
    setValidationError(null);
    setNewSkill({ code: '', name: '', discipline: disciplines[0] || '', description: '', grade: '1º' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={() => { db.deleteSkill(deleteConfirm.id); setSkills(db.getSkills()); }}
        title="Excluir Habilidade?"
        message={`Deseja remover ${deleteConfirm.code} do acervo BNCC?`}
      />

      {/* Modal Nova Disciplina */}
      {isDisciplineModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <form onSubmit={handleAddDiscipline} className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nova Disciplina</h3>
              <button type="button" onClick={() => setIsDisciplineModalOpen(false)} className="text-slate-400 p-2 hover:text-slate-600"><X /></button>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome da Matéria</label>
              <input required autoFocus className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-xl" value={newDisciplineName} onChange={e => setNewDisciplineName(e.target.value)} placeholder="Ex: Informática, Artes..." />
            </div>
            <button className="w-full py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black text-lg shadow-xl hover:bg-indigo-700 transition-all">Ativar Disciplina</button>
          </form>
        </div>
      )}

      {/* Modal Cadastro Habilidade */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <form onSubmit={handleAddOrEditSkill} className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl p-12 space-y-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{editingSkill ? 'Editar Habilidade' : 'Nova BNCC'}</h3>
              <button type="button" onClick={closeModal} className="text-slate-400 p-2 hover:text-slate-600"><X size={32} /></button>
            </div>

            {validationError && (
              <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-start gap-4 text-rose-700 animate-in shake">
                <AlertCircle size={24} className="shrink-0 mt-1" />
                <p className="text-sm font-black leading-tight">{validationError}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código BNCC</label>
                <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold uppercase focus:border-blue-300 transition-all" value={newSkill.code} onChange={e => {setNewSkill({...newSkill, code: e.target.value}); setValidationError(null);}} placeholder="EF01LP01" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ano / Série</label>
                <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold cursor-pointer focus:border-blue-300" value={newSkill.grade} onChange={e => {setNewSkill({...newSkill, grade: e.target.value}); setValidationError(null);}}>
                  {series.map(g => <option key={g} value={g}>{g} Ano</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disciplina</label>
                <div className="flex gap-3">
                  <select className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold focus:border-blue-300" value={newSkill.discipline} onChange={e => setNewSkill({...newSkill, discipline: e.target.value})}>
                    {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button type="button" onClick={() => setIsDisciplineModalOpen(true)} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl border-2 border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                    <Plus size={24} />
                  </button>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título da Habilidade</label>
                <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold focus:border-blue-300" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} placeholder="Ex: Leitura Expressiva" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Completa</label>
                <textarea required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl h-28 outline-none font-medium text-sm leading-relaxed focus:border-blue-300" value={newSkill.description} onChange={e => setNewSkill({...newSkill, description: e.target.value})} />
              </div>
            </div>

            <button className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
              <Save size={24} /> {editingSkill ? 'Salvar Alterações' : 'Cadastrar Habilidade'}
            </button>
          </form>
        </div>
      )}

      {/* Grid de Filtros */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 text-slate-400 px-2 flex-shrink-0">
             <Filter size={18} />
             <span className="text-[10px] font-black uppercase tracking-widest">Filtrar:</span>
          </div>
          <button onClick={() => setActiveDiscipline('ALL')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeDiscipline === 'ALL' ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Todas</button>
          {disciplines.map((d) => (
            <button key={d} onClick={() => setActiveDiscipline(d)} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeDiscipline === d ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{d}</button>
          ))}
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs shadow-xl hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95">
          <Plus size={20} /> Nova Habilidade BNCC
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
        {filteredSkills.map((skill) => (
          <div key={skill.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-lg hover:shadow-2xl transition-all flex flex-col group relative overflow-hidden">
            <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditingSkill(skill); setNewSkill({ ...skill }); setIsModalOpen(true); }} className="p-3 bg-white border border-slate-100 hover:bg-blue-50 text-blue-600 rounded-2xl shadow-xl transition-all"><Edit size={16} /></button>
              <button onClick={() => setDeleteConfirm({ isOpen: true, id: skill.id, code: skill.code || 'BNCC' })} className="p-3 bg-white border border-slate-100 hover:bg-rose-50 text-rose-600 rounded-2xl shadow-xl transition-all"><Trash2 size={16} /></button>
            </div>
            <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-widest w-fit mb-6 border border-indigo-100">{skill.discipline}</span>
            <div className="flex-1 space-y-4">
              <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl uppercase tracking-widest">{skill.code}</span>
              <h4 className="text-2xl font-black text-slate-900 leading-tight pr-10">{skill.name}</h4>
              <p className="text-sm text-slate-500 font-medium italic leading-relaxed line-clamp-4">"{skill.description}"</p>
            </div>
            <div className="pt-8 border-t border-slate-50 mt-8 flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
               <span>{skill.grade} Ano</span>
               <div className="flex items-center gap-1.5 text-blue-500"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Ativo</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
