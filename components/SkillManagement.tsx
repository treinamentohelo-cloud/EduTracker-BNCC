
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

  const grades = ['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º'];

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

  const getDisciplineColor = (discipline: string) => {
    const colors: Record<string, string> = {
      'Português': 'border-blue-200 bg-blue-50 text-blue-700',
      'Matemática': 'border-green-200 bg-green-50 text-green-700',
      'Ciências': 'border-purple-200 bg-purple-50 text-purple-700',
      'Geografia': 'border-amber-200 bg-amber-50 text-amber-700',
      'História': 'border-orange-200 bg-orange-50 text-orange-700',
      'Artes': 'border-rose-200 bg-rose-50 text-rose-700',
    };
    return colors[discipline] || 'border-slate-200 bg-slate-50 text-slate-700';
  };

  const validateBNCCCode = (code: string, grade: string) => {
    const cleanCode = code.toUpperCase().trim();
    const yearDigits = grade.replace('º', '').padStart(2, '0');
    
    if (!cleanCode.startsWith('EF')) return "O código BNCC para Ensino Fundamental deve começar com 'EF'.";
    if (cleanCode.length < 4) return "Código incompleto. Padrão: EF[ANO][MATÉRIA][HABILIDADE]";

    const codeYear = cleanCode.substring(2, 4);
    const specialBlocks: Record<string, string[]> = {
      '12': ['1º', '2º'],
      '15': ['1º', '2º', '3º', '4º', '5º'],
      '35': ['3º', '4º', '5º'],
      '69': ['6º', '7º', '8º', '9º']
    };

    if (specialBlocks[codeYear]) {
      if (!specialBlocks[codeYear].includes(grade)) {
        return `O código '${cleanCode}' é para o bloco ${specialBlocks[codeYear].join('/')}. Incompatível com ${grade} ano.`;
      }
    } else if (codeYear !== yearDigits) {
      return `Divergência: Código para ${parseInt(codeYear)}º ano, mas série selecionada é ${grade} ano.`;
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
    const skill: BNCCSkill = editingSkill ? { ...editingSkill, ...newSkill, code: newSkill.code.toUpperCase() } : { id: 'sk-' + Math.random().toString(36).substr(2, 5), ...newSkill, code: newSkill.code.toUpperCase() };
    db.saveSkill(skill);
    setSkills(db.getSkills());
    closeModal();
  };

  const handleAddDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisciplineName.trim()) return;
    if (disciplines.includes(newDisciplineName.trim())) {
      alert("Esta disciplina já existe!");
      return;
    }
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
        message={`Deseja remover ${deleteConfirm.code} do acervo?`}
      />

      {/* Modal Nova Disciplina */}
      {isDisciplineModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <form onSubmit={handleAddDiscipline} className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Library size={24} /></div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nova Disciplina</h3>
              </div>
              <button type="button" onClick={() => setIsDisciplineModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={24}/></button>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Matéria</label>
              <input required autoFocus className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-xl" value={newDisciplineName} onChange={e => setNewDisciplineName(e.target.value)} placeholder="Ex: Robótica, Inglês..." />
            </div>
            <button className="w-full py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black text-lg shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
              <Save size={24} /> Ativar Disciplina
            </button>
          </form>
        </div>
      )}

      {/* Modal Cadastro Habilidade */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddOrEditSkill} className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl p-10 space-y-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><BookOpen size={24} /></div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingSkill ? 'Editar Habilidade' : 'Nova BNCC'}</h3>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2"><X size={28} /></button>
            </div>

            {validationError && (
              <div className="p-5 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-start gap-4 text-rose-700 animate-in shake">
                <AlertCircle size={24} className="shrink-0 mt-1" />
                <p className="text-sm font-black leading-tight">{validationError}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</label>
                <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold uppercase focus:border-blue-300" value={newSkill.code} onChange={e => {setNewSkill({...newSkill, code: e.target.value}); setValidationError(null);}} placeholder="EF01LP01" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Série</label>
                <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold cursor-pointer" value={newSkill.grade} onChange={e => {setNewSkill({...newSkill, grade: e.target.value}); setValidationError(null);}}>
                  {grades.map(g => <option key={g} value={g}>{g} Ano</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disciplina</label>
                <div className="flex gap-2">
                  <select className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold cursor-pointer" value={newSkill.discipline} onChange={e => setNewSkill({...newSkill, discipline: e.target.value})}>
                    {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button type="button" onClick={() => setIsDisciplineModalOpen(true)} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl border-2 border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                    <Plus size={24} />
                  </button>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumo</label>
                <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} placeholder="Ex: Leitura Expressiva" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição BNCC</label>
                <textarea required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl h-24 outline-none font-medium text-sm leading-relaxed" value={newSkill.description} onChange={e => setNewSkill({...newSkill, description: e.target.value})} />
              </div>
            </div>

            <button className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
              <Save size={24} /> {editingSkill ? 'Atualizar Dados' : 'Ativar Habilidade'}
            </button>
          </form>
        </div>
      )}

      {/* Toolbar e Filtros */}
      <div className="bg-white p-6 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 text-slate-400 px-2 flex-shrink-0">
             <Filter size={18} />
             <span className="text-[10px] font-black uppercase tracking-widest">Matéria:</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveDiscipline('ALL')} 
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${activeDiscipline === 'ALL' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            >
              Todas
            </button>
            {disciplines.map((d) => (
              <button 
                key={d} 
                onClick={() => setActiveDiscipline(d)} 
                className={`px-6 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${activeDiscipline === d ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                {d}
              </button>
            ))}
            <button onClick={() => setIsDisciplineModalOpen(true)} className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:border-indigo-400 hover:text-indigo-600 transition-all flex-shrink-0">
              <Plus size={20} />
            </button>
          </div>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="bg-[#1d63ed] text-white px-10 py-4.5 rounded-[1.75rem] font-black text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2">
          <Plus size={20} /> Cadastrar Nova BNCC
        </button>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredSkills.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6"><BookOpen size={64} /></div>
             <p className="text-xl font-black text-slate-300">Nenhum registro encontrado nesta categoria.</p>
             <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 font-black hover:underline">Adicionar Primeira Habilidade</button>
          </div>
        ) : filteredSkills.map((skill) => (
          <div key={skill.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-lg hover:shadow-2xl hover:border-indigo-300 transition-all flex flex-col h-full group relative overflow-hidden">
            {/* Decoração Lateral */}
            <div className={`absolute top-0 left-0 w-2 h-full opacity-30 ${skill.discipline === 'Matemática' ? 'bg-green-500' : skill.discipline === 'Português' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
            
            <div className="absolute top-8 right-8 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
              <button onClick={() => { setEditingSkill(skill); setNewSkill({ ...skill, code: skill.code || '' }); setIsModalOpen(true); }} className="p-3 bg-white border border-slate-100 hover:bg-blue-50 text-blue-600 rounded-2xl shadow-xl"><Edit size={16} /></button>
              <button onClick={() => setDeleteConfirm({ isOpen: true, id: skill.id, code: skill.code || skill.name })} className="p-3 bg-white border border-slate-100 hover:bg-rose-50 text-rose-600 rounded-2xl shadow-xl"><Trash2 size={16} /></button>
            </div>

            <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-2 w-fit mb-8 ${getDisciplineColor(skill.discipline)}`}>
              {skill.discipline}
            </div>

            <div className="space-y-4 mb-10 flex-1">
              <span className="inline-block text-[11px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm">{skill.code}</span>
              <h4 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors pr-12">{skill.name}</h4>
              <p className="text-sm text-slate-500 font-medium line-clamp-4 italic leading-relaxed">"{skill.description}"</p>
            </div>

            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-500 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {skill.grade.replace('º', '')}
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{skill.grade} Ano</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-500">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Ativo</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
