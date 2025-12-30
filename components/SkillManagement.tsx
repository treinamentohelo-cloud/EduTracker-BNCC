
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

  // Grades expanded to 8th year
  const grades = ['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º'];

  // Delete confirmation state
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
    switch (discipline) {
      case 'Português': return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'Matemática': return 'border-green-200 bg-green-50 text-green-700';
      case 'Ciências': return 'border-purple-200 bg-purple-50 text-purple-700';
      default: return 'border-slate-200 bg-slate-50 text-slate-700';
    }
  };

  const validateBNCCCode = (code: string, grade: string) => {
    const cleanCode = code.toUpperCase().trim();
    const yearDigits = grade.replace('º', '').padStart(2, '0');
    
    if (cleanCode.length < 4 || !cleanCode.startsWith('EF')) {
      return "O código deve começar com 'EF' (Ensino Fundamental).";
    }
    
    const codeYear = cleanCode.substring(2, 4);
    if (codeYear !== yearDigits) {
      return `Divergência: O código '${cleanCode}' refere-se ao ${parseInt(codeYear)}º ano, mas você selecionou a série ${grade} ano. Por favor, ajuste o código ou a série.`;
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

    const skill: BNCCSkill = editingSkill ? {
      ...editingSkill,
      ...newSkill,
      code: newSkill.code.toUpperCase()
    } : {
      id: 'sk-' + Math.random().toString(36).substr(2, 5),
      ...newSkill,
      code: newSkill.code.toUpperCase()
    };
    db.saveSkill(skill);
    setSkills(db.getSkills());
    closeModal();
  };

  const handleAddDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisciplineName.trim()) return;
    await db.saveDiscipline(newDisciplineName.trim());
    const updated = db.getDisciplines();
    setDisciplines(updated);
    setNewSkill(prev => ({ ...prev, discipline: newDisciplineName.trim() }));
    setNewDisciplineName('');
    setIsDisciplineModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
    setValidationError(null);
    setNewSkill({ 
      code: '', 
      name: '', 
      discipline: disciplines[0] || '', 
      description: '', 
      grade: '1º' 
    });
  };

  const openEditModal = (skill: BNCCSkill) => {
    setEditingSkill(skill);
    setNewSkill({
      code: skill.code || '',
      name: skill.name,
      discipline: skill.discipline,
      description: skill.description,
      grade: skill.grade
    });
    setIsModalOpen(true);
  };

  const confirmDeleteSkill = () => {
    db.deleteSkill(deleteConfirm.id);
    setSkills(db.getSkills());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={confirmDeleteSkill}
        title="Excluir Habilidade BNCC?"
        message={`Deseja realmente remover a habilidade ${deleteConfirm.code}? Isso pode afetar relatórios de alunos que já foram avaliados com este critério.`}
      />

      {/* Modal Criar Disciplina */}
      {isDisciplineModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <form onSubmit={handleAddDiscipline} className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <Library size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nova Disciplina</h3>
              </div>
              <button type="button" onClick={() => setIsDisciplineModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Categoria de Ensino</label>
                <input 
                  required 
                  autoFocus
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg" 
                  value={newDisciplineName} 
                  onChange={e => setNewDisciplineName(e.target.value)} 
                  placeholder="Ex: Geografia, Artes..." 
                />
              </div>
            </div>

            <button className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <Save size={20} /> Ativar Disciplina
            </button>
          </form>
        </div>
      )}

      {/* Modal Cadastro de Habilidade com Validação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddOrEditSkill} className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingSkill ? 'Editar Critério' : 'Cadastrar BNCC'}</h3>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2"><X /></button>
            </div>

            {validationError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 animate-in shake duration-300">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-black tracking-tight">{validationError}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Código BNCC</label>
                <input 
                  required 
                  className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase transition-all ${validationError ? 'border-rose-400' : 'border-slate-200'}`} 
                  value={newSkill.code} 
                  onChange={e => {setNewSkill({...newSkill, code: e.target.value}); setValidationError(null);}} 
                  placeholder="EF01LP01" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Série / Ano</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={newSkill.grade} onChange={e => {setNewSkill({...newSkill, grade: e.target.value}); setValidationError(null);}}>
                  {grades.map(g => <option key={g} value={g}>{g} Ano</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Disciplina Principal</label>
                <div className="flex gap-2">
                  <select className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={newSkill.discipline} onChange={e => setNewSkill({...newSkill, discipline: e.target.value})}>
                    {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button type="button" onClick={() => setIsDisciplineModalOpen(true)} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all shadow-sm">
                    <Plus size={24} />
                  </button>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Habilidade</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} placeholder="Resumo da competência..." />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                <textarea required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 resize-none outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={newSkill.description} onChange={e => setNewSkill({...newSkill, description: e.target.value})} placeholder="Copie aqui a descrição completa da base nacional..." />
              </div>
            </div>

            <button className="w-full py-5 bg-[#1d63ed] text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              <Save size={20} /> {editingSkill ? 'Atualizar Dados' : 'Salvar no Acervo'}
            </button>
          </form>
        </div>
      )}

      {/* Cabeçalho de Navegação e Ações */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Disciplinas:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveDiscipline('ALL')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeDiscipline === 'ALL' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              Todas
            </button>
            {disciplines.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDiscipline(d)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeDiscipline === d 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDisciplineModalOpen(true)} 
            className="group flex-1 sm:flex-none bg-white text-indigo-600 px-6 py-4 rounded-2xl font-black text-xs shadow-sm border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Library size={18} className="group-hover:rotate-12 transition-transform" /> 
            Criar Disciplina
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex-1 sm:flex-none bg-[#1d63ed] text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl shadow-blue-100 border border-black/10 hover:bg-blue-700 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} /> 
            Cadastrar Habilidade
          </button>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSkills.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
               <BookOpen size={48} />
             </div>
             <p className="font-black text-slate-400 text-lg">Nenhum critério BNCC encontrado nesta seção.</p>
             <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 font-bold hover:underline">Começar cadastro agora</button>
          </div>
        ) : filteredSkills.map((skill) => (
          <div 
            key={skill.id} 
            className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-300 transition-all flex flex-col h-full group relative"
          >
            <div className="absolute top-6 right-6 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => openEditModal(skill)} 
                className="p-3 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 rounded-xl transition-all shadow-sm" 
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => setDeleteConfirm({ isOpen: true, id: skill.id, code: skill.code || skill.name })} 
                className="p-3 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all shadow-sm" 
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${getDisciplineColor(skill.discipline)}`}>
                {skill.discipline}
              </div>
            </div>

            <div className="space-y-3 mb-6 flex-1">
              <span className="inline-block text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest">{skill.code}</span>
              <h4 className="text-xl font-black text-slate-900 leading-tight pr-10">{skill.name}</h4>
              <p className="text-sm text-slate-500 font-medium line-clamp-4 leading-relaxed italic">
                "{skill.description}"
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500">
                  {skill.grade.charAt(0)}
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{skill.grade} Ano</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
