
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, 
  ArrowRight, 
  BrainCircuit, 
  X, 
  Plus, 
  AlertCircle, 
  Trash2, 
  Save,
  Clock,
  LayoutDashboard,
  Timer,
  CheckCircle,
  UserCheck,
  UserX,
  Calendar,
  History,
  TrendingUp,
  Award,
  Star,
  MessageSquare
} from 'lucide-react';
import { ReinforcementGroup, Student, StudentStatus, AttendanceRecord, ReinforcementHistory, SkillLevel, StudentEvaluation, Bimester, AssessmentType } from '../types';
import { db } from '../services/db';
import { ConfirmModal } from './ConfirmModal';

export const ReinforcementGroups: React.FC = () => {
  const [groups, setGroups] = useState<ReinforcementGroup[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isCallDiaryOpen, setIsCallDiaryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ReinforcementGroup | null>(null);
  
  // States para o modal de conclusão
  const [conclusionData, setConclusionData] = useState<{ studentId: string; studentName: string } | null>(null);
  const [conclLevel, setConclLevel] = useState<SkillLevel>(SkillLevel.ACHIEVED);
  const [conclScore, setConclScore] = useState('');
  const [conclFeedback, setConclFeedback] = useState('');
  
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [presentStudents, setPresentStudents] = useState<string[]>([]);

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const disciplines = db.getDisciplines();
  const reinforcementHistory = db.getReinforcementHistory();

  // Carrega dados iniciais e atualiza estados
  const refreshData = () => {
    setGroups(db.getReinforcements());
    setAllStudents(db.getStudents());
  };

  useEffect(() => {
    refreshData();
    if (disciplines.length > 0) setSelectedDiscipline(disciplines[0]);
  }, []);

  const needsRef = useMemo(() => 
    allStudents.filter(s => s.status === StudentStatus.NEEDS_REINFORCEMENT),
    [allStudents]
  );

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || selectedStudents.length === 0) return;
    const group: ReinforcementGroup = {
      id: `rg-${Math.random().toString(36).substr(2, 9)}`,
      name: newGroupName,
      discipline: selectedDiscipline,
      studentIds: selectedStudents,
      skillIds: [],
      schedule: `${startTime} - ${endTime}`,
      startDate: startDate
    };
    await db.saveReinforcement(group);
    refreshData();
    closeCreateModal();
  };

  const closeCreateModal = () => {
    setIsCreating(false);
    setNewGroupName('');
    setSelectedStudents([]);
  };

  const handleSaveAttendance = () => {
    if (!selectedGroup) return;
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      groupId: selectedGroup.id,
      date: attendanceDate,
      presentStudentIds: presentStudents
    };
    db.saveAttendance(record);
    setIsCallDiaryOpen(false);
    setPresentStudents([]);
  };

  const handleOpenConclusion = (sid: string, sname: string) => {
    setConclusionData({ studentId: sid, studentName: sname });
    setConclLevel(SkillLevel.ACHIEVED);
    setConclScore('');
    setConclFeedback('');
  };

  const finalizeConclusion = async () => {
    if (!selectedGroup || !conclusionData) return;

    const { studentId, studentName } = conclusionData;
    const student = allStudents.find(s => s.id === studentId);

    if (student) {
      // 1. Grava a avaliação final do reforço
      const evaluation: StudentEvaluation = {
        id: `ev-ref-${Date.now()}`,
        studentId: studentId,
        skillId: 'reforcement-final', 
        level: conclLevel,
        date: new Date().toISOString(),
        bimester: Bimester.B1, 
        feedback: conclFeedback || `Alta de reforço: ${selectedGroup.name}`,
        type: AssessmentType.OTHER,
        score: conclScore ? parseFloat(conclScore) : undefined
      };
      
      // 2. Atualiza status do aluno (Remoção da lista de pendências BNCC)
      const updatedStatus = (conclLevel === SkillLevel.ACHIEVED || conclLevel === SkillLevel.EXCEEDED) 
        ? StudentStatus.ADEQUATE 
        : StudentStatus.DEVELOPING;
      
      const updatedStudent: Student = {
        ...student,
        status: updatedStatus,
        evaluations: [...(student.evaluations || []), evaluation]
      };
      
      await db.saveStudent(updatedStudent);

      // 3. Salva no histórico de conclusões
      const historyRecord: ReinforcementHistory = {
        id: `rh-${Date.now()}`,
        studentId: studentId,
        studentName: studentName,
        groupName: selectedGroup.name,
        discipline: selectedGroup.discipline,
        startDate: selectedGroup.startDate, 
        completionDate: new Date().toISOString()
      };
      await db.saveReinforcementHistory(historyRecord);
    }

    // 4. REMOVE O ALUNO DO GRUPO (Remoção da lista de chamada)
    const updatedGroup = {
      ...selectedGroup,
      studentIds: selectedGroup.studentIds.filter(id => id !== studentId)
    };
    
    await db.saveReinforcement(updatedGroup);
    
    // 5. Atualiza todos os estados locais para refletir a saída imediata
    refreshData();
    setSelectedGroup(updatedGroup);
    setConclusionData(null);
  };

  const calculateDaysInRef = (startStr: string) => {
    const start = new Date(startStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const groupAttendanceRecords = useMemo(() => {
    if (!selectedGroup) return [];
    return db.getAttendance(selectedGroup.id);
  }, [selectedGroup, isHistoryOpen]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={async () => { await db.deleteReinforcement(deleteConfirm.id); refreshData(); }}
        title="Excluir Grupo?"
        message={`Remover grupo ${deleteConfirm.name}? Esta ação não pode ser desfeita.`}
      />

      {/* Modal de Conclusão de Reforço com Alta Pedagógica */}
      {conclusionData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">Alta Pedagógica</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{conclusionData.studentName}</p>
                </div>
              </div>
              <button onClick={() => setConclusionData(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Critério de Avaliação Final</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(SkillLevel).map((level) => (
                    <button
                      key={level}
                      onClick={() => setConclLevel(level)}
                      className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-tight text-center transition-all ${
                        conclLevel === level 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                        : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Star size={12} className="text-amber-500" /> Nota Final
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="0.0"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-emerald-100 font-black text-slate-700" 
                    value={conclScore}
                    onChange={e => setConclScore(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data da Alta</label>
                   <div className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-500 text-sm flex items-center gap-2">
                      <Calendar size={16} /> {new Date().toLocaleDateString('pt-BR')}
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <MessageSquare size={12} className="text-indigo-500" /> Parecer de Conclusão
                </label>
                <textarea 
                  placeholder="Descreva a evolução do estudante para o dossiê..." 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 text-sm min-h-[100px] resize-none"
                  value={conclFeedback}
                  onChange={e => setConclFeedback(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={finalizeConclusion}
              className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle size={20} /> Efetivar Alta e Remover Aluno
            </button>
          </div>
        </div>
      )}

      {/* Modal de Criação de Grupo Estratégico */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleCreateGroup} className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Novo Grupo de Reforço</h3>
              <button type="button" onClick={closeCreateModal} className="text-slate-400 p-1 hover:bg-slate-50 rounded-md"><X size={18} /></button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Nome da Oficina/Grupo</label>
                <input required placeholder="Ex: Oficina de Alfabetização B" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Componente</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none" value={selectedDiscipline} onChange={e => setSelectedDiscipline(e.target.value)}>
                    {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Data Início</label>
                  <input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Entrada</label>
                  <input type="time" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none" value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Saída</label>
                  <input type="time" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Selecionar Alunos (Em Alerta)</label>
                <div className="max-h-32 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50/50 space-y-1 custom-scrollbar">
                   {needsRef.map(s => (
                     <label key={s.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-100">
                        <input 
                          type="checkbox" 
                          checked={selectedStudents.includes(s.id)} 
                          onChange={e => {
                            if (e.target.checked) setSelectedStudents([...selectedStudents, s.id]);
                            else setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span className="text-[10px] font-bold text-slate-700">{s.name} ({s.grade} Ano)</span>
                     </label>
                   ))}
                   {needsRef.length === 0 && <p className="text-[9px] text-slate-400 text-center py-4 italic">Nenhum aluno em alerta no momento.</p>}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95">
              <UserPlus size={16} /> Salvar Grupo de Intervenção
            </button>
          </form>
        </div>
      )}

      {/* Modal Diário de Presença e Alta */}
      {isCallDiaryOpen && selectedGroup && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-all ${!isHistoryOpen ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}
                >Lista Atual</button>
                <button 
                  onClick={() => setIsHistoryOpen(true)}
                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-all ${isHistoryOpen ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}
                >Histórico</button>
              </div>
              <button onClick={() => setIsCallDiaryOpen(false)} className="text-slate-400 p-1 hover:bg-slate-50 rounded-md transition-colors"><X size={18} /></button>
            </div>

            {!isHistoryOpen ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Data da Atividade</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input type="date" className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[11px] outline-none" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Controle de Presença e Alta</label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedGroup.studentIds.map(sid => {
                      const student = allStudents.find(s => s.id === sid);
                      if (!student) return null;
                      const isPresent = presentStudents.includes(sid);
                      return (
                        <div key={sid} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group/item">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-700">{student.name}</span>
                              <button 
                                onClick={() => handleOpenConclusion(sid, student.name)}
                                className="text-[8px] font-black uppercase text-indigo-600 hover:text-white hover:bg-indigo-600 px-3 py-1.5 rounded-lg mt-2 border-2 border-indigo-100 w-fit transition-all flex items-center gap-1.5"
                              >
                                <Award size={10} /> Alta Pedagógica
                              </button>
                            </div>
                            <div className="flex gap-1.5">
                               <button 
                                  onClick={() => setPresentStudents([...presentStudents, sid])}
                                  className={`p-2 rounded-lg transition-all shadow-sm ${isPresent ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-300 hover:text-emerald-500'}`}
                                  title="Marcar Presença"
                               >
                                 <UserCheck size={14} />
                               </button>
                               <button 
                                  onClick={() => setPresentStudents(presentStudents.filter(id => id !== sid))}
                                  className={`p-2 rounded-lg transition-all shadow-sm ${!isPresent && presentStudents.length > 0 ? 'bg-rose-500 text-white' : 'bg-white border border-slate-200 text-slate-300 hover:text-rose-500'}`}
                                  title="Marcar Falta"
                               >
                                 <UserX size={14} />
                               </button>
                            </div>
                        </div>
                      );
                    })}
                    {selectedGroup.studentIds.length === 0 && (
                      <div className="text-center py-8 opacity-40">
                         <CheckCircle size={24} className="mx-auto mb-2 text-indigo-500" />
                         <p className="text-[9px] font-black uppercase tracking-widest">Todos os alunos receberam alta</p>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={handleSaveAttendance} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                  <Save size={16} /> Salvar Frequência
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                {groupAttendanceRecords.length > 0 ? groupAttendanceRecords.sort((a,b) => b.date.localeCompare(a.date)).map(record => (
                  <div key={record.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-700">{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                    <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase">{record.presentStudentIds.length} PRESENTES</span>
                  </div>
                )) : (
                  <p className="text-[10px] text-slate-400 text-center py-10 italic">Nenhum registro de frequência.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Banner Informativo */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
          <BrainCircuit size={150} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight">Intervenção e Reforço</h3>
            <p className="text-indigo-100 text-xs font-medium leading-relaxed opacity-90 max-w-lg">
              Gerencie grupos de apoio pedagógico focados em habilidades críticas da BNCC. Acompanhe a evolução até a alta pedagógica.
            </p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-6 py-2.5 bg-white text-indigo-900 font-black rounded-lg hover:bg-indigo-50 transition-all text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95"
          >
            <Plus size={16} /> Criar Novo Grupo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 px-1">
             <LayoutDashboard size={18} className="text-indigo-600" />
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Grupos em Andamento</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {groups.map((group) => (
               <div key={group.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-all flex flex-col group relative overflow-hidden">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setDeleteConfirm({ isOpen: true, id: group.id, name: group.name })} className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-md shadow-sm"><Trash2 size={14}/></button>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase tracking-widest w-fit border border-indigo-100">{group.discipline}</span>
                    <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase border border-emerald-100">
                      <TrendingUp size={10} /> {group.studentIds.length} ATIVOS
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors flex-1">{group.name}</h4>
                  
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                      <Clock size={12} className="text-indigo-400" /> {group.schedule}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                      <Calendar size={12} className="text-indigo-400" /> Início: {new Date(group.startDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                    <button 
                      onClick={() => { setSelectedGroup(group); setIsCallDiaryOpen(true); setIsHistoryOpen(false); }}
                      className="flex items-center gap-2 text-indigo-600 font-black text-[9px] uppercase tracking-widest hover:translate-x-1 transition-transform"
                    >
                      Abrir Diário <ArrowRight size={14} />
                    </button>
                    <button 
                      onClick={() => { setSelectedGroup(group); setIsCallDiaryOpen(true); setIsHistoryOpen(true); }}
                      className="text-slate-300 hover:text-indigo-600 transition-colors"
                      title="Relatório de Frequência"
                    >
                      <History size={14} />
                    </button>
                  </div>
               </div>
             ))}
             {groups.length === 0 && (
               <div className="col-span-full py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center opacity-40">
                  <UserPlus size={32} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhum grupo de reforço criado.</p>
               </div>
             )}
          </div>
        </div>

        {/* Sidebar de Pendências - Atualiza em Tempo Real */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center shadow-sm">
              <AlertCircle size={18} />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Alerta BNCC: Reforço</h3>
          </div>

          <div className="space-y-2.5">
             {needsRef.map(student => (
               <div key={student.id} className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-100 hover:bg-rose-50 transition-all group">
                 <div className="flex items-center gap-2.5">
                   <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-black text-[10px] text-rose-500 shadow-sm">
                     {student.name.charAt(0)}
                   </div>
                   <div>
                     <p className="text-[11px] font-black text-slate-900 leading-none mb-0.5">{student.name}</p>
                     <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest">{student.grade} Ano</p>
                   </div>
                 </div>
                 <button onClick={() => setIsCreating(true)} className="p-1.5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-md transition-colors border border-rose-200 shadow-sm"><Plus size={14}/></button>
               </div>
             ))}
             {needsRef.length === 0 && (
               <div className="text-center py-10 opacity-30 flex flex-col items-center">
                  <CheckCircle size={32} className="mb-2 text-emerald-500" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Todos os alunos com status adequado</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
