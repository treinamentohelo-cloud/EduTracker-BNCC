
import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Save, Edit, Trash2 } from 'lucide-react';
import { db } from '../services/db';
import { Discipline, BNCCSkill } from '../types';
import { ConfirmModal } from './ConfirmModal';

export const SkillManagement: React.FC = () => {
  const [skills, setSkills] = useState(db.getSkills());
  const [activeDiscipline, setActiveDiscipline] = useState<Discipline | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<BNCCSkill | null>(null);
  const [newSkill, setNewSkill] = useState({
    code: '',
    name: '',
    discipline: Discipline.PORTUGUESE,
    description: '',
    grade: '1º'
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; code: string }>({
    isOpen: false,
    id: '',
    code: ''
  });

  useEffect(() => {
    setSkills(db.getSkills());
  }, []);

  const filteredSkills = activeDiscipline === 'ALL' 
    ? skills 
    : skills.filter(s => s.discipline === activeDiscipline);

  const getDisciplineColor = (discipline: Discipline) => {
    switch (discipline) {
      case Discipline.PORTUGUESE: return 'border-blue-200 bg-blue-50 text-blue-700';
      case Discipline.MATH: return 'border-green-200 bg-green-50 text-green-700';
      case Discipline.SCIENCE: return 'border-purple-200 bg-purple-50 text-purple-700';
      default: return 'border-slate-200 bg-slate-50 text-slate-700';
    }
  };

  const handleAddOrEditSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const skill: BNCCSkill = editingSkill ? {
      ...editingSkill,
      ...newSkill
    } : {
      id: 'sk-' + Math.random().toString(36).substr(2, 5),
      ...newSkill
    };
    db.saveSkill(skill);
    setSkills(db.getSkills());
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
    setNewSkill({ code: '', name: '', discipline: Discipline.PORTUGUESE, description: '', grade: '1º' });
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
    <div className="space-y-6">
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={confirmDeleteSkill}
        title="Excluir Habilidade BNCC?"
        message={`Deseja realmente remover a habilidade ${deleteConfirm.code}? Isso pode afetar relatórios de alunos que já foram avaliados com este critério.`}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddOrEditSkill} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">{editingSkill ? 'Editar Habilidade' : 'Cadastrar Habilidade BNCC'}</h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Código</label>
                  <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={newSkill.code} onChange={e => setNewSkill({...newSkill, code: e.target.value})} placeholder="EF01LP01" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ano</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={newSkill.grade} onChange={e => setNewSkill({...newSkill, grade: e.target.value})}>
                    {['1º', '2º', '3º', '4º', '5º'].map(g => <option key={g} value={g}>{g} Ano</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Disciplina</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={newSkill.discipline} onChange={e => setNewSkill({...newSkill, discipline: e.target.value as Discipline})}>
                  {Object.values(Discipline).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Título Curto</label>
                <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} placeholder="Nome da habilidade" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Descrição</label>
                <textarea required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-24 resize-none outline-none focus:ring-2 focus:ring-indigo-500" value={newSkill.description} onChange={e => setNewSkill({...newSkill, description: e.target.value})} placeholder="Descrição detalhada..." />
              </div>
            </div>
            <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <Save size={18} /> {editingSkill ? 'Salvar Alterações' : 'Salvar Habilidade'}
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl">
          {['ALL', Discipline.PORTUGUESE, Discipline.MATH, Discipline.SCIENCE].map((d) => (
            <button
              key={d}
              onClick={() => setActiveDiscipline(d as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeDiscipline === d 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {d === 'ALL' ? 'Todas' : d}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[#1d63ed] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg border border-black/10 hover:bg-blue-700 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={18} /> Cadastrar Habilidade
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSkills.map((skill) => (
          <div 
            key={skill.id} 
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group relative"
          >
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button 
                onClick={() => openEditModal(skill)} 
                className="p-2 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 rounded-xl transition-all shadow-sm" 
                title="Editar Habilidade"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => setDeleteConfirm({ isOpen: true, id: skill.id, code: skill.code || skill.name })} 
                className="p-2 bg-white border border-slate-200 hover:bg-red-50 text-red-600 rounded-xl transition-all shadow-sm" 
                title="Excluir Habilidade"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-start mb-4">
              <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border-2 ${getDisciplineColor(skill.discipline)}`}>
                {skill.discipline}
              </div>
            </div>
            <div className="mb-2">
              <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-tighter">{skill.code}</span>
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight pr-20">{skill.name}</h4>
            <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3 leading-relaxed">{skill.description}</p>
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{skill.grade} Ano</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
