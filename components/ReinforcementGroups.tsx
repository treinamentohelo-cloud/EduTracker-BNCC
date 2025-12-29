
import React, { useState, useEffect } from 'react';
import { UserPlus, Calendar, ArrowRight, BrainCircuit, X, Check, Search, Plus, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { BNCC_SKILLS } from '../constants';
import { Discipline, ReinforcementGroup } from '../types';
import { db } from '../services/db';

export const ReinforcementGroups: React.FC = () => {
  const [groups, setGroups] = useState<ReinforcementGroup[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ReinforcementGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline>(Discipline.PORTUGUESE);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState('A definir');

  const students = db.getStudents();
  const needsRef = students.filter(s => s.status === 'Precisa de reforço');

  useEffect(() => {
    setGroups(db.getReinforcements());
  }, []);

  const handleCreateOrEditGroup = () => {
    if (!newGroupName || selectedStudents.length === 0) return;
    const group: ReinforcementGroup = editingGroup ? {
      ...editingGroup,
      name: newGroupName,
      discipline: selectedDiscipline,
      studentIds: selectedStudents,
      schedule: selectedSchedule
    } : {
      id: Math.random().toString(36).substr(2, 9),
      name: newGroupName,
      discipline: selectedDiscipline,
      studentIds: selectedStudents,
      skillIds: [],
      schedule: selectedSchedule
    };
    db.saveReinforcement(group);
    setGroups(db.getReinforcements());
    closeModal();
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingGroup(null);
    setNewGroupName('');
    setSelectedStudents([]);
    setSelectedSchedule('A definir');
  };

  const openEditModal = (group: ReinforcementGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setSelectedDiscipline(group.discipline);
    setSelectedStudents(group.studentIds);
    setSelectedSchedule(group.schedule);
    setIsCreating(true);
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm("Deseja realmente excluir este grupo de reforço?")) {
      db.deleteReinforcement(id);
      setGroups(db.getReinforcements());
    }
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 relative">
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">{editingGroup ? 'Editar Grupo' : 'Novo Grupo de Reforço'}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8 flex-1">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Identificação do Grupo</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  placeholder="Ex: Alfabetização Intensiva - 1º Ano"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Disciplina</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                    value={selectedDiscipline}
                    onChange={(e) => setSelectedDiscipline(e.target.value as Discipline)}
                  >
                    {Object.values(Discipline).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Horário / Cronograma</label>
                  <input 
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                    value={selectedSchedule}
                    onChange={(e) => setSelectedSchedule(e.target.value)}
                    placeholder="Ex: Terças e Quintas, 14h"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selecionar Alunos ({selectedStudents.length})</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {students.map(student => (
                    <button
                      key={student.id}
                      onClick={() => toggleStudentSelection(student.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left group ${
                        selectedStudents.includes(student.id) 
                        ? 'bg-indigo-50 border-indigo-500 shadow-md' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${selectedStudents.includes(student.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {student.name.charAt(0)}
                        </div>
                        <span className={`text-sm font-bold ${selectedStudents.includes(student.id) ? 'text-indigo-900' : 'text-slate-600'}`}>{student.name}</span>
                      </div>
                      {selectedStudents.includes(student.id) && <Check size={18} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 rounded-b-[2.5rem]">
              <button onClick={closeModal} className="px-8 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors">Voltar</button>
              <button onClick={handleCreateOrEditGroup} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
                {editingGroup ? 'Salvar Alterações' : 'Ativar Grupo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      <div className="bg-gradient-to-br from-indigo-700 to-blue-800 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <BrainCircuit size={180} />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-10">
          <div className="flex-1 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full text-[10px] font-bold tracking-widest uppercase ring-1 ring-white/30">
              <BrainCircuit size={14} className="animate-pulse" />
              Inteligência Pedagógica
            </div>
            <h3 className="text-3xl font-bold">Recomendação de Intervenção</h3>
            <p className="text-indigo-50 max-w-2xl text-lg leading-relaxed opacity-90">
              Detectamos que <span className="font-bold text-white underline decoration-blue-400 decoration-2 underline-offset-4">4 alunos</span> não atingiram a meta em <span className="text-blue-200">Raciocínio Lógico</span>. Deseja organizar uma oficina de jogos matemáticos?
            </p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="whitespace-nowrap px-10 py-5 bg-white text-indigo-800 font-bold rounded-2xl hover:bg-indigo-50 hover:shadow-2xl transition-all shadow-xl shadow-indigo-900/30 flex items-center justify-center gap-3 text-lg group active:scale-95"
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
            Criar Grupo Sugerido
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-bold text-slate-800">Grupos em Andamento</h3>
            <button 
              onClick={() => setIsCreating(true)} 
              className="bg-[#1d63ed] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg border border-black/10 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={18} /> Novo Grupo
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             {groups.length === 0 ? (
               <div className="col-span-2 py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                  <UserPlus size={48} className="mb-4 opacity-50" />
                  <p className="font-bold">Nenhum grupo ativo no momento</p>
               </div>
             ) : groups.map((group) => (
               <div key={group.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-xl transition-all group cursor-pointer border-t-8 border-t-indigo-500 relative">
                  <div className="absolute top-6 right-6 flex gap-2 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditModal(group); }} 
                      className="p-2 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 rounded-xl transition-all shadow-sm"
                      title="Editar Grupo"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }} 
                      className="p-2 bg-white border border-slate-200 hover:bg-red-50 text-red-600 rounded-xl transition-all shadow-sm"
                      title="Excluir Grupo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-widest">{group.discipline}</span>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors pr-20">{group.name}</p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                      <Calendar size={16} className="text-slate-300" />
                      {group.schedule}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                      <UserPlus size={16} className="text-slate-300" />
                      {group.studentIds.length} Alunos na trilha
                    </div>
                  </div>
                  <div className="flex -space-x-3">
                    {group.studentIds.map((sid, i) => {
                      const s = students.find(x => x.id === sid);
                      return (
                        <div key={i} className="w-10 h-10 rounded-xl border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 ring-1 ring-slate-100 shadow-sm" title={s?.name}>
                          {s?.name?.charAt(0) || '?'}
                        </div>
                      );
                    })}
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm sticky top-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Alerta de Déficit</h3>
            </div>
            <div className="space-y-4">
               {needsRef.length === 0 ? (
                 <p className="text-slate-400 text-center py-6">Parabéns! Todos os alunos estão adequados.</p>
               ) : needsRef.map(student => (
                 <div key={student.id} className="flex items-center justify-between p-4 bg-rose-50/30 rounded-2xl border border-rose-100 group transition-all">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-white border border-rose-100 rounded-xl flex items-center justify-center font-bold text-rose-400">
                       {student.name.charAt(0)}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-900 leading-tight">{student.name}</p>
                       <p className="text-[10px] font-bold text-rose-500/70 uppercase tracking-tighter">Precisa de Foco</p>
                     </div>
                   </div>
                   <button 
                    onClick={() => setIsCreating(true)}
                    className="p-2 bg-white border border-rose-200 text-rose-500 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                   >
                      <Plus size={18} />
                   </button>
                 </div>
               ))}
            </div>
            <button className="w-full mt-8 py-4 border-2 border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm">
              Gerar Relatório de Pendências
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
