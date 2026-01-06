
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Calendar, 
  ArrowRight, 
  BrainCircuit, 
  X, 
  Search, 
  Plus, 
  AlertCircle, 
  Trash2, 
  ClipboardCheck, 
  UserCheck, 
  UserX, 
  Save,
  ChevronRight,
  Clock,
  LayoutDashboard,
  BellRing,
  Printer,
  Check,
  History,
  Timer
} from 'lucide-react';
import { ReinforcementGroup, AttendanceRecord, Student, StudentStatus } from '../types';
import { db } from '../services/db';
import { ConfirmModal } from './ConfirmModal';

export const ReinforcementGroups: React.FC = () => {
  const [groups, setGroups] = useState<ReinforcementGroup[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isCallDiaryOpen, setIsCallDiaryOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ReinforcementGroup | null>(null);
  
  // Create Group State
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Português');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedEndDate, setExpectedEndDate] = useState('');

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'history'>('attendance');

  // Modal Deletar
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const students = db.getStudents();
  const disciplines = db.getDisciplines();
  const needsRef = students.filter(s => s.status === StudentStatus.NEEDS_REINFORCEMENT);

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

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || selectedStudents.length === 0) {
      alert("Preencha o nome do grupo e selecione pelo menos um aluno.");
      return;
    }

    const group: ReinforcementGroup = {
      id: `rg-${Math.random().toString(36).substr(2, 9)}`,
      name: newGroupName,
      discipline: selectedDiscipline,
      studentIds: selectedStudents,
      skillIds: [],
      schedule: selectedSchedule || 'Horário a definir',
      startDate: startDate,
      expectedEndDate: expectedEndDate || undefined
    };

    db.saveReinforcement(group);
    setGroups(db.getReinforcements());
    setIsCreating(false);
    resetForm();
  };

  const handleDeleteGroup = async () => {
    await db.deleteReinforcement(deleteConfirm.id);
    setGroups(db.getReinforcements());
    setDeleteConfirm({ isOpen: false, id: '', name: '' });
  };

  const resetForm = () => {
    setNewGroupName('');
    setSelectedStudents([]);
    setSelectedSchedule('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setExpectedEndDate('');
  };

  const calculateDaysInRef = (startStr: string) => {
    const start = new Date(startStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const togglePresence = (studentId: string) => {
    setPresentStudents(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
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
    alert('Frequência registrada com sucesso!');
    setAttendanceHistory(db.getAttendance(selectedGroup.id));
  };

  const formatDateLong = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { 
      day: '2-digit', month: 'long', year: 'numeric' 
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={handleDeleteGroup}
        title="Excluir Grupo de Reforço?"
        message={`Deseja realmente excluir o grupo "${deleteConfirm.name}"? Isso removerá o histórico de presença e o vínculo dos alunos com esta célula de intervenção.`}
      />

      {/* Modal Criar Grupo */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleCreateGroup} className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl p-10 space-y-8 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <UserPlus className="text-blue-600" /> Nova Célula de Reforço
              </h3>
              <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600"><X size={28}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Grupo</label>
                <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-300 font-bold" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Ex: Reforço Alfabetização A" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disciplina</label>
                <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" value={selectedDiscipline} onChange={e => setSelectedDiscipline(e.target.value)}>
                  {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Início</label>
                <input type="date" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-300 font-bold" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Previsão de Saída</label>
                <input type="date" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-300 font-bold" value={expectedEndDate} onChange={e => setExpectedEndDate(e.target.value)} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário/Dias</label>
                <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" value={selectedSchedule} onChange={e => setSelectedSchedule(e.target.value)} placeholder="Ex: Segundas e Quartas, 14:00 às 15:30" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Alunos (Recomendados)</label>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {needsRef.map(student => (
                  <div 
                    key={student.id} 
                    onClick={() => toggleStudentSelection(student.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedStudents.includes(student.id) ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${selectedStudents.includes(student.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{student.name}</span>
                    </div>
                    {selectedStudents.includes(student.id) && <Check size={18} className="text-blue-600" />}
                  </div>
                ))}
                {needsRef.length === 0 && <p className="text-center text-slate-400 py-4 text-sm italic">Nenhum aluno com status de reforço pendente.</p>}
              </div>
            </div>

            <button className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-700 transition-all">
              Confirmar Cadastro do Grupo
            </button>
          </form>
        </div>
      )}

      {/* Modal Diário de Chamada */}
      {isCallDiaryOpen && selectedGroup && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                  <ClipboardCheck size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black leading-none mb-1">Diário de Chamada</h3>
                  <p className="text-indigo-100 opacity-80 font-bold">{selectedGroup.name} • {selectedGroup.discipline}</p>
                </div>
              </div>
              <button onClick={() => setIsCallDiaryOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white">
                <X size={28} />
              </button>
            </div>

            <div className="flex gap-8 px-10 py-4 border-b border-slate-100 bg-slate-50/50">
               <button onClick={() => setActiveTab('attendance')} className={`text-xs font-black uppercase tracking-widest pb-2 border-b-4 transition-all ${activeTab === 'attendance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Registrar Aula</button>
               <button onClick={() => setActiveTab('history')} className={`text-xs font-black uppercase tracking-widest pb-2 border-b-4 transition-all ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Histórico de Presença</button>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
              {activeTab === 'attendance' ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Encontro</label>
                      <input type="date" className="p-3 bg-white border-2 border-slate-200 rounded-xl outline-none font-black text-slate-700" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
                    </div>
                    <div className="text-right">
                       <p className="text-3xl font-black text-indigo-600">{presentStudents.length}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alunos Presentes</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {selectedGroup.studentIds.map(sid => {
                      const student = students.find(s => s.id === sid);
                      if (!student) return null;
                      const isPresent = presentStudents.includes(sid);
                      return (
                        <div key={sid} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${isPresent ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${isPresent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              {student.name.charAt(0)}
                            </div>
                            <span className={`text-lg font-black ${isPresent ? 'text-indigo-900' : 'text-slate-800'}`}>{student.name}</span>
                          </div>
                          <button 
                            onClick={() => togglePresence(sid)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-sm ${isPresent ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400 hover:text-indigo-600'}`}
                          >
                            {isPresent ? <UserCheck size={20} /> : <UserX size={20} />}
                            {isPresent ? 'Presente' : 'Ausente'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendanceHistory.length === 0 ? (
                    <div className="text-center py-20 text-slate-300">
                      <Clock size={64} className="mx-auto mb-4 opacity-20" />
                      <p className="font-black text-xl">Nenhum registro de chamada ainda.</p>
                    </div>
                  ) : [...attendanceHistory].sort((a,b) => b.date.localeCompare(a.date)).map(record => (
                    <div key={record.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 flex items-center justify-between hover:border-indigo-300 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600"><Calendar size={24}/></div>
                        <div>
                          <p className="font-black text-slate-800 text-lg">{formatDateLong(record.date)}</p>
                          <p className="text-xs font-bold text-slate-400">{record.presentStudentIds.length} alunos presentes de {selectedGroup.studentIds.length}</p>
                        </div>
                      </div>
                      <button onClick={() => { setAttendanceDate(record.date); setActiveTab('attendance'); }} className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Ver Detalhes</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setIsCallDiaryOpen(false)} className="px-8 py-4 font-black text-slate-500 uppercase text-xs tracking-widest">Fechar</button>
              {activeTab === 'attendance' && (
                <button onClick={handleSaveAttendance} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <Save size={20} /> Salvar Frequência
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-950 p-12 rounded-[4rem] text-white shadow-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <BrainCircuit size={320} />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-14">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/20 backdrop-blur-3xl rounded-full text-[10px] font-black tracking-widest uppercase ring-1 ring-white/30">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Intervenção Pedagógica
            </div>
            <h3 className="text-6xl font-black leading-none tracking-tight">Recuperação de Aprendizagem</h3>
            <p className="text-indigo-100 max-w-2xl text-2xl font-medium leading-relaxed opacity-90">
              Gerencie grupos de reforço escolar com foco nas habilidades não atingidas. Registre presenças e monitore a evolução.
            </p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="whitespace-nowrap px-16 py-8 bg-white text-indigo-900 font-black rounded-[2.5rem] hover:bg-indigo-50 transition-all shadow-2xl flex items-center justify-center gap-4 text-2xl"
          >
            <Plus size={36} />
            Nova Célula
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-4 px-4">
             <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><LayoutDashboard size={24} /></div>
             <h3 className="text-3xl font-black text-slate-900 tracking-tight">Células Ativas</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             {groups.length === 0 ? (
               <div className="col-span-2 py-40 bg-slate-100/50 border-4 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center text-slate-300">
                  <UserPlus size={80} className="mb-6 opacity-20" />
                  <p className="font-black text-2xl">Nenhum grupo de reforço cadastrado.</p>
               </div>
             ) : groups.map((group) => (
               <div key={group.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-lg hover:shadow-2xl hover:border-indigo-400 transition-all group relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                  
                  <div className="absolute top-8 right-8 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setDeleteConfirm({ isOpen: true, id: group.id, name: group.name });
                      }} 
                      className="p-3 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all shadow-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-widest w-fit mb-6 border border-indigo-100">{group.discipline}</span>
                  <h4 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors pr-12 leading-tight flex-1">{group.name}</h4>
                  
                  <div className="space-y-3 mb-10">
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                      <Clock size={18} className="text-indigo-400" /> {group.schedule}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                      <Timer size={18} className="text-indigo-400" /> 
                      Há <span className="text-indigo-600 font-black">{calculateDaysInRef(group.startDate)} dias</span> no reforço
                    </div>
                    {group.expectedEndDate && (
                      <div className="flex items-center gap-3 text-slate-500 font-bold text-sm italic">
                        <History size={18} className="text-indigo-400" /> Previsão: {new Date(group.expectedEndDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                      <UserPlus size={18} className="text-indigo-400" /> {group.studentIds.length} Alunos Inscritos
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                    <button 
                      onClick={() => { setSelectedGroup(group); setIsCallDiaryOpen(true); }}
                      className="flex items-center gap-3 text-indigo-600 font-black text-xs hover:gap-5 transition-all uppercase tracking-widest"
                    >
                      DIÁRIO DE CHAMADA <ArrowRight size={18} />
                    </button>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100/50">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Atenção Crítica</h3>
            </div>

            <div className="space-y-4">
               {needsRef.map(student => (
                 <div key={student.id} className="flex items-center justify-between p-5 bg-rose-50/40 rounded-3xl border border-rose-100 group transition-all hover:bg-rose-50">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white border-2 border-rose-200 rounded-xl flex items-center justify-center font-black text-xl text-rose-500 shadow-sm group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-all">
                       {student.name.charAt(0)}
                     </div>
                     <div>
                       <p className="text-base font-black text-slate-900 leading-none mb-1">{student.name}</p>
                       <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{student.grade} Ano</p>
                     </div>
                   </div>
                   <button 
                    onClick={() => setIsCreating(true)}
                    className="p-3 bg-white border-2 border-rose-200 text-rose-500 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                   >
                      <Plus size={20} />
                   </button>
                 </div>
               ))}
               {needsRef.length === 0 && (
                 <div className="text-center py-8 text-slate-400 italic text-sm">Nenhum aluno identificado com atraso crítico.</div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
