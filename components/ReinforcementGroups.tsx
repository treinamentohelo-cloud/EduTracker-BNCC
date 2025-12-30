
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Calendar, 
  ArrowRight, 
  BrainCircuit, 
  X, 
  Check, 
  Search, 
  Plus, 
  AlertCircle, 
  Edit, 
  Trash2, 
  ClipboardCheck, 
  History, 
  UserCheck, 
  UserX, 
  Save,
  ChevronRight,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { ReinforcementGroup, AttendanceRecord, Student, Discipline } from '../types';
import { db } from '../services/db';

export const ReinforcementGroups: React.FC = () => {
  const [groups, setGroups] = useState<ReinforcementGroup[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isCallDiaryOpen, setIsCallDiaryOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ReinforcementGroup | null>(null);
  const [editingGroup, setEditingGroup] = useState<ReinforcementGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Português');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState('A definir');
  
  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'history'>('attendance');

  const students = db.getStudents();
  const disciplines = db.getDisciplines();
  const needsRef = students.filter(s => s.status === 'Precisa de reforço');

  useEffect(() => {
    setGroups(db.getReinforcements());
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      const history = db.getAttendance(selectedGroup.id);
      setAttendanceHistory(history);
      
      const existing = history.find(r => r.date === attendanceDate);
      setPresentStudents(existing ? existing.presentStudentIds : []);
    }
  }, [selectedGroup, attendanceDate]);

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

  const handleSaveAttendance = async () => {
    if (!selectedGroup) return;
    
    const record: AttendanceRecord = {
      id: `att-${selectedGroup.id}-${attendanceDate}`,
      groupId: selectedGroup.id,
      date: attendanceDate,
      presentStudentIds: presentStudents
    };
    
    await db.saveAttendance(record);
    const history = db.getAttendance(selectedGroup.id);
    setAttendanceHistory(history);
    alert('Diário de chamada atualizado com sucesso!');
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

  const openCallDiary = (group: ReinforcementGroup) => {
    setSelectedGroup(group);
    setAttendanceDate(new Date().toISOString().split('T')[0]);
    setIsCallDiaryOpen(true);
    setActiveTab('attendance');
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

  const togglePresence = (studentId: string) => {
    setPresentStudents(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const getAttendanceRate = (studentId: string) => {
    if (attendanceHistory.length === 0) return 100;
    const count = attendanceHistory.filter(r => r.presentStudentIds.includes(studentId)).length;
    return Math.round((count / attendanceHistory.length) * 100);
  };

  const formatDateLong = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  return (
    <div className="space-y-10 relative max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Modal Diário de Chamada Otimizado */}
      {isCallDiaryOpen && selectedGroup && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300 overflow-hidden">
            
            {/* Header Modal */}
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white relative">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <ClipboardCheck size={160} />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                  <ClipboardCheck size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight leading-none mb-1">Diário de Chamada</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-100/70">Unidade: {selectedGroup.name}</span>
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full"></span>
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-100/70">{selectedGroup.discipline}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsCallDiaryOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all shadow-sm">
                <X size={28} />
              </button>
            </div>

            {/* Abas de Navegação do Modal */}
            <div className="flex items-center gap-8 px-10 py-6 border-b border-slate-100 bg-slate-50/50">
               <button 
                onClick={() => setActiveTab('attendance')}
                className={`text-sm font-black uppercase tracking-[0.2em] pb-2 transition-all border-b-4 ${activeTab === 'attendance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
               >
                 Lançar Presença
               </button>
               <button 
                onClick={() => setActiveTab('history')}
                className={`text-sm font-black uppercase tracking-[0.2em] pb-2 transition-all border-b-4 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
               >
                 Histórico do Grupo
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              {activeTab === 'attendance' ? (
                <>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 shadow-inner">
                    <div className="space-y-2 w-full md:w-auto">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Data da Atividade</label>
                      <div className="relative">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={24} />
                        <input 
                          type="date" 
                          className="w-full md:w-64 pl-14 pr-8 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-black text-slate-700 text-lg shadow-sm"
                          value={attendanceDate}
                          onChange={(e) => setAttendanceDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-6 w-full md:w-auto">
                      <div className="flex-1 md:flex-none text-center bg-white px-8 py-4 rounded-3xl border-2 border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmados</p>
                        <p className="text-3xl font-black text-green-600">{presentStudents.length}</p>
                      </div>
                      <div className="flex-1 md:flex-none text-center bg-white px-8 py-4 rounded-3xl border-2 border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ausências</p>
                        <p className="text-3xl font-black text-rose-500">{selectedGroup.studentIds.length - presentStudents.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                      <UserCheck size={20} className="text-indigo-600" /> Chamada de Alunos
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedGroup.studentIds.map(sid => {
                        const student = students.find(s => s.id === sid);
                        if (!student) return null;
                        const isPresent = presentStudents.includes(sid);
                        const rate = getAttendanceRate(sid);

                        return (
                          <div key={sid} className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all group ${isPresent ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                            <div className="flex items-center gap-6">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl transition-all ${isPresent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className={`text-xl font-black leading-none mb-2 ${isPresent ? 'text-indigo-900' : 'text-slate-800'}`}>{student.name}</p>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequência: {rate}%</span>
                                     <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-700 ${rate > 80 ? 'bg-green-500' : rate > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{width: `${rate}%`}}></div>
                                     </div>
                                  </div>
                                  {rate < 50 && (
                                     <span className="flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg animate-pulse uppercase tracking-tighter">
                                       <AlertCircle size={10} /> Alerta de Evasão
                                     </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => togglePresence(sid)}
                              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${
                                isPresent 
                                ? 'bg-indigo-600 text-white shadow-indigo-100' 
                                : 'bg-white border-2 border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-300'
                              }`}
                            >
                              {isPresent ? <UserCheck size={20} /> : <UserX size={20} />}
                              {isPresent ? 'Presença' : 'Ausente'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-6">
                   <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 flex items-center gap-6">
                      <div className="bg-white p-4 rounded-2xl text-indigo-600 shadow-lg">
                        <History size={32} />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-indigo-900 leading-none mb-1">Registros Anteriores</h4>
                        <p className="text-indigo-600 font-bold">Histórico consolidado das aulas de reforço.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {attendanceHistory.length === 0 ? (
                       <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400">
                          <Clock size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="font-black">Ainda não há aulas registradas para este grupo.</p>
                       </div>
                     ) : [...attendanceHistory].sort((a, b) => b.date.localeCompare(a.date)).map(record => (
                       <div 
                         key={record.id} 
                         onClick={() => { setAttendanceDate(record.date); setActiveTab('attendance'); }}
                         className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all group flex items-center gap-5 sm:gap-6 cursor-pointer"
                       >
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-sm">
                             <Calendar size={24} />
                          </div>
                          <div className="flex-1">
                             <p className="text-base sm:text-lg font-black text-slate-800 leading-tight mb-1 group-hover:text-indigo-700">
                               {formatDateLong(record.date)}
                             </p>
                             <p className="text-[10px] sm:text-[11px] font-black text-[#6366f1] uppercase tracking-widest">
                               {record.presentStudentIds.length} Alunos Presentes
                             </p>
                          </div>
                          <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-400 transition-all" />
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
                <History size={20} className="text-indigo-400" />
                <div className="flex flex-col">
                  <span className="font-black text-slate-600">{attendanceHistory.length} Aulas Ministradas</span>
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Histórico Escolar 2025</span>
                </div>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button onClick={() => setIsCallDiaryOpen(false)} className="flex-1 sm:flex-none px-10 py-5 font-black text-slate-500 hover:text-slate-900 transition-colors uppercase text-xs tracking-widest">Fechar</button>
                {activeTab === 'attendance' && (
                  <button 
                    onClick={handleSaveAttendance}
                    className="flex-1 sm:flex-none px-14 py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    <Save size={24} /> Salvar Chamada
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cadastro de Grupo */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-12 duration-300 overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                   <UserPlus size={24} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900">{editingGroup ? 'Editar Grupo' : 'Expandir Rede de Reforço'}</h3>
              </div>
              <button onClick={closeModal} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400">
                <X size={28} />
              </button>
            </div>
            
            <div className="p-10 overflow-y-auto space-y-10 flex-1 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Identificação Estratégica</label>
                <input 
                  type="text" 
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 font-black text-xl placeholder:text-slate-300" 
                  placeholder="Ex: Alfabetização Nível I - 2º Ano B"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Disciplina Alvo</label>
                  <select 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none font-black text-slate-700 cursor-pointer"
                    value={selectedDiscipline}
                    onChange={(e) => setSelectedDiscipline(e.target.value)}
                  >
                    {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Horário Previsto</label>
                  <input 
                    type="text"
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none font-black text-slate-700 placeholder:text-slate-300"
                    value={selectedSchedule}
                    onChange={(e) => setSelectedSchedule(e.target.value)}
                    placeholder="Ex: Segundas, 15:30h"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Composição do Grupo ({selectedStudents.length})</label>
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-tighter">Foco em Baixo Desempenho</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {students.map(student => (
                    <button
                      key={student.id}
                      onClick={() => toggleStudentSelection(student.id)}
                      className={`flex items-center justify-between p-5 rounded-[1.75rem] border-2 transition-all text-left group ${
                        selectedStudents.includes(student.id) 
                        ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-100' 
                        : 'bg-white border-slate-100 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner transition-colors ${selectedStudents.includes(student.id) ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-300'}`}>
                          {student.name.charAt(0)}
                        </div>
                        <span className={`text-base font-black tracking-tight ${selectedStudents.includes(student.id) ? 'text-white' : 'text-slate-700'}`}>{student.name}</span>
                      </div>
                      {selectedStudents.includes(student.id) ? <Check size={20} className="text-white" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-100"></div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-6 rounded-b-[3rem]">
              <button onClick={closeModal} className="px-10 py-4 font-black text-slate-400 hover:text-slate-700 transition-colors uppercase text-xs tracking-widest">Voltar</button>
              <button onClick={handleCreateOrEditGroup} className="px-14 py-4 bg-blue-600 text-white rounded-[1.75rem] font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all text-lg flex items-center gap-3">
                <Save size={24} /> {editingGroup ? 'Salvar Edição' : 'Ativar Grupo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner de Inteligência */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 p-12 rounded-[3.5rem] text-white shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none group-hover:rotate-12 group-hover:scale-125 transition-all duration-1000">
          <BrainCircuit size={280} />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/20 backdrop-blur-3xl rounded-full text-[10px] font-black tracking-[0.3em] uppercase ring-1 ring-white/30 shadow-2xl">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Alerta Pedagógico IA
            </div>
            <h3 className="text-5xl font-black leading-tight tracking-tight">Otimize a Recuperação</h3>
            <p className="text-indigo-100 max-w-2xl text-xl leading-relaxed opacity-90 font-medium">
              Identificamos <span className="text-white font-black underline decoration-amber-400 decoration-4 underline-offset-8">4 novos alunos</span> que entraram em zona de risco em Matemática. Ativar um novo grupo de intervenção lúdica pode reverter o quadro em 15 dias.
            </p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="whitespace-nowrap px-14 py-6 bg-white text-indigo-900 font-black rounded-[2.5rem] hover:bg-indigo-50 hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all shadow-2xl flex items-center justify-center gap-4 text-xl group active:scale-95"
          >
            <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
            Criar Intervenção
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                 <LayoutDashboard size={24} />
               </div>
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">Células de Reforço</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             {groups.length === 0 ? (
               <div className="col-span-2 py-32 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3.5rem] flex flex-col items-center justify-center text-slate-300">
                  <UserPlus size={64} className="mb-6 opacity-30" />
                  <p className="font-black text-xl">Nenhuma célula de reforço ativa.</p>
                  <button onClick={() => setIsCreating(true)} className="mt-4 text-blue-600 font-bold hover:underline">Adicionar primeira célula</button>
               </div>
             ) : groups.map((group) => (
               <div key={group.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-lg hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col">
                  {/* Decoração Visual */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                  
                  <div className="absolute top-8 right-8 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openCallDiary(group); }} 
                      className="p-3 bg-white border border-slate-200 hover:bg-indigo-50 text-indigo-600 rounded-2xl transition-all shadow-sm"
                      title="Diário de Chamada"
                    >
                      <ClipboardCheck size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditModal(group); }} 
                      className="p-3 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all shadow-sm"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }} 
                      className="p-3 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-2xl transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-[0.2em] border border-indigo-100">{group.discipline}</span>
                  </div>

                  <h4 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors pr-20 leading-tight flex-1">{group.name}</h4>
                  
                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-black">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Clock size={18} />
                      </div>
                      <span className="uppercase tracking-widest">{group.schedule}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-black">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <UserPlus size={18} />
                      </div>
                      <span className="uppercase tracking-widest">{group.studentIds.length} Alunos Inscritos</span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <div className="flex -space-x-4">
                      {group.studentIds.slice(0, 4).map((sid, i) => {
                        const s = students.find(x => x.id === sid);
                        return (
                          <div key={i} className="w-12 h-12 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600 ring-1 ring-slate-100 shadow-xl" title={s?.name}>
                            {s?.name?.charAt(0) || '?'}
                          </div>
                        );
                      })}
                      {group.studentIds.length > 4 && (
                        <div className="w-12 h-12 rounded-2xl border-4 border-white bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                          +{group.studentIds.length - 4}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => openCallDiary(group)}
                      className="flex items-center gap-3 text-indigo-600 font-black text-xs hover:gap-5 transition-all uppercase tracking-widest"
                    >
                      CHAMADA <ArrowRight size={18} />
                    </button>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/40 sticky top-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
               <AlertCircle size={100} />
            </div>
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Zona de Alerta</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Déficit Crítico de Desempenho</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
               {needsRef.length === 0 ? (
                 <div className="p-8 text-center space-y-3">
                   <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500">
                     <Check size={32} />
                   </div>
                   <p className="text-slate-400 font-bold leading-relaxed">Parabéns! Nenhuma pendência de reforço detectada na unidade.</p>
                 </div>
               ) : needsRef.map(student => (
                 <div key={student.id} className="flex items-center justify-between p-6 bg-rose-50/50 rounded-[2rem] border border-rose-100 group transition-all hover:bg-rose-50">
                   <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-white border-2 border-rose-200 rounded-2xl flex items-center justify-center font-black text-rose-500 shadow-sm">
                       {student.name.charAt(0)}
                     </div>
                     <div>
                       <p className="text-base font-black text-slate-900 leading-none mb-1">{student.name}</p>
                       <p className="text-[10px] font-black text-rose-600/80 uppercase tracking-widest">Foco em {student.grade} Ano</p>
                     </div>
                   </div>
                   <button 
                    onClick={() => setIsCreating(true)}
                    className="p-3 bg-white border border-rose-200 text-rose-500 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                   >
                      <Plus size={20} />
                   </button>
                 </div>
               ))}
            </div>
            
            <button className="w-full mt-10 py-6 bg-slate-50 border-2 border-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-xs uppercase tracking-[0.3em] shadow-sm">
              Consolidar Diagnóstico
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
