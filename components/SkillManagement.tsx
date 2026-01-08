
import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Save, Edit, Trash2, Filter, Info, AlertCircle, BookOpen } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [newDisciplineName, setNewDisciplineName] = useState('');
  
  const [newSkill, setNewSkill] = useState({
    code: '',
    name: '',
    discipline: '',
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
    const loadedDisciplines = db.getDisciplines();
    setDisciplines(loadedDisciplines);
    if (loadedDisciplines.length > 0 && !newSkill.discipline) {
      setNewSkill(prev => ({ ...prev, discipline: loadedDisciplines[0] }));
    }
    setSkills(db.getSkills());
  }, []);

  const filteredSkills = skills.filter(s => {
    const matchesDiscipline = activeDiscipline === 'ALL' || s.discipline === activeDiscipline;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDiscipline && matchesSearch;
  });

  const handleAddOrEditSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.code || !newSkill.name) return;
    
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
    setNewDisciplineName('');
    setIsDisciplineModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
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

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={() => { db.deleteSkill(deleteConfirm.id); setSkills(db.getSkills()); }}
        title="Excluir?"
        message={`Remover habilidade ${deleteConfirm.code}?`}
      />

      {/* Modal de Nova Disciplina */}
      {isDisciplineModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
          <form onSubmit={handleAddDiscipline} className="bg-white rounded-2xl w-full max-w-xs shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase">Nova Disciplina</h3>
            <input 
              required 
              placeholder="Ex: Geografia" 
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none" 
              value={newDisciplineName} 
              onChange={e => setNewDisciplineName(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase">Salvar</button>
              <button type="button" onClick={() => setIsDisciplineModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-lg font-black text-[10px] uppercase">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleAddOrEditSkill} className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {editingSkill ? 'Editar Habilidade' : 'Nova Habilidade BNCC'}
              </h3>
              <button type="button" onClick={closeModal} className="text-slate-400 p-1 hover:bg-slate-50 rounded-md">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Código (BNCC)</label>
                  <input required placeholder="EF01LP01" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs" value={newSkill.code} onChange={e => setNewSkill({...newSkill, code: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Série</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs" value={newSkill.grade} onChange={e => setNewSkill({...newSkill, grade: e.target.value})}>
                    {series.map(g => <option key={g} value={g}>{g} Ano</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Título Curto</label>
                <input required placeholder="Ex: Interpretação Textual" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Componente Curricular</label>
                  <button type="button" onClick={() => setIsDisciplineModalOpen(true)} className="text-[8px] font-black text-blue-600 hover:underline uppercase">+ Nova</button>
                </div>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs" value={newSkill.discipline} onChange={e => setNewSkill({...newSkill, discipline: e.target.value})}>
                  {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Descrição Oficial</label>
                <textarea rows={3} placeholder="Texto completo da habilidade..." className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs resize-none" value={newSkill.description} onChange={e => setNewSkill({...newSkill, description: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              <Save size={16} /> Gravar Habilidade
            </button>
          </form>
        </div>
      )}

      {/* Grid de Filtros Compacto */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
          <div className="flex items-center gap-1.5 text-slate-400 px-1 flex-shrink-0">
             <Filter size={14} />
             <span className="text-[8px] font-black uppercase tracking-widest">Filtros:</span>
          </div>
          <button onClick={() => setActiveDiscipline('ALL')} className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-all ${activeDiscipline === 'ALL' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>TUDO</button>
          {disciplines.map((d) => (
            <button key={d} onClick={() => setActiveDiscipline(d)} className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-all whitespace-nowrap ${activeDiscipline === d ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{d.toUpperCase()}</button>
          ))}
          <button onClick={() => setIsDisciplineModalOpen(true)} className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg flex-shrink-0"><Plus size={14}/></button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] outline-none w-32 focus:w-48 transition-all font-bold"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-black text-[10px] shadow hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 uppercase tracking-widest shrink-0">
            <Plus size={14} /> Nova BNCC
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredSkills.map((skill) => (
          <div key={skill.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col group relative overflow-hidden">
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditModal(skill)} className="p-1.5 bg-white border border-slate-100 hover:bg-blue-50 text-blue-600 rounded-md"><Edit size={12} /></button>
              <button onClick={() => setDeleteConfirm({ isOpen: true, id: skill.id, code: skill.code || 'BNCC' })} className="p-1.5 bg-white border border-slate-100 hover:bg-rose-50 text-rose-600 rounded-md"><Trash2 size={12} /></button>
            </div>
            <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase tracking-widest w-fit mb-2 border border-indigo-100">{skill.discipline}</span>
            <div className="flex-1 space-y-1.5">
              <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-widest">{skill.code}</span>
              <h4 className="text-[13px] font-black text-slate-900 leading-tight pr-6">{skill.name}</h4>
              <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed line-clamp-3">"{skill.description}"</p>
            </div>
            <div className="pt-2 border-t border-slate-50 mt-3 flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
               <span>{skill.grade} Ano</span>
               <div className="flex items-center gap-1 text-blue-500">PRO</div>
            </div>
          </div>
        ))}
        {filteredSkills.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
             <Info size={32} className="text-slate-200 mx-auto mb-2" />
             <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Nenhuma habilidade encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
};
