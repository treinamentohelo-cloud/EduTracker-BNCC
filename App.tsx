
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { SkillManagement } from './components/SkillManagement';
import { AssessmentForm } from './components/AssessmentForm';
import { ReinforcementGroups } from './components/ReinforcementGroups';
import { CoordinatorPortal } from './components/CoordinatorPortal';
import { ManagerPortal } from './components/ManagerPortal';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { ConfirmModal } from './components/ConfirmModal';
import { UserRole, ClassRoom, StudentStatus } from './types';
import { db } from './services/db';
import { supabase } from './services/supabase';
import { 
  ChevronRight,
  School,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Users as UsersIcon,
  ArrowLeft,
  GraduationCap,
  AlertCircle,
  User
} from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.TEACHER);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [viewingClassId, setViewingClassId] = useState<string | null>(null);
  const [newClass, setNewClass] = useState({ name: '', grade: '1º', shift: 'Matutino', teacherName: '' });
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ 
    isOpen: false, 
    id: '', 
    name: '' 
  });

  const loadClasses = () => {
    setClasses(db.getClasses());
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await db.syncFromSupabase();
      loadClasses();
    };
    loadInitialData();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user?.email);
        const role = session.user?.user_metadata?.role as UserRole || UserRole.TEACHER;
        setUserRole(role);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user?.email);
        const role = session.user?.user_metadata?.role as UserRole || UserRole.TEACHER;
        setUserRole(role);
      } else {
        setIsAuthenticated(false);
        setUserEmail(undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const currentClass = useMemo(() => classes.find(c => c.id === viewingClassId), [classes, viewingClassId]);
  const classStudents = useMemo(() => db.getStudents().filter(s => s.classId === viewingClassId), [viewingClassId, activeTab]);
  const activeReinforcements = useMemo(() => db.getReinforcements(), [activeTab]);

  const handleCreateOrEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name || !newClass.teacherName) return;
    
    const cls: ClassRoom = editingClass ? {
      ...editingClass,
      name: newClass.name,
      grade: newClass.grade,
      shift: newClass.shift as any,
      teacherName: newClass.teacherName
    } : { 
      id: 'c-' + Math.random().toString(36).substr(2, 5), 
      name: newClass.name, 
      grade: newClass.grade, 
      shift: newClass.shift as any, 
      teacherId: 'prof-generic',
      teacherName: newClass.teacherName
    };
    
    await db.saveClass(cls);
    loadClasses();
    closeClassModal();
  };

  const handleEditClass = (e: React.MouseEvent, cls: ClassRoom) => {
    e.stopPropagation();
    setEditingClass(cls);
    setNewClass({ 
      name: cls.name, 
      grade: cls.grade, 
      shift: cls.shift, 
      teacherName: cls.teacherName || '' 
    });
    setShowClassModal(true);
  };

  const handleDeleteClass = (e: React.MouseEvent, cls: ClassRoom) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, id: cls.id, name: cls.name });
  };

  const closeClassModal = () => {
    setShowClassModal(false);
    setEditingClass(null);
    setNewClass({ name: '', grade: '1º', shift: 'Matutino', teacherName: '' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setViewingClassId(null);
    setIsAuthenticated(false);
  };

  const isStudentInReinforcement = (studentId: string) => {
    return activeReinforcements.some(group => group.studentIds.includes(studentId));
  };

  const renderClassDetail = (cls: ClassRoom) => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setViewingClassId(null); }} 
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all"
      >
        <ArrowLeft size={14} /> Voltar para Listagem de Turmas
      </button>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><School size={100} /></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md"><School size={24} /></div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{cls.name}</h2>
            <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[9px] mt-1">
              <span>{cls.grade} Ano</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <span>{cls.shift}</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <span className="flex items-center gap-1 text-indigo-600 font-black"><User size={10} /> Prof. {cls.teacherName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="text-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 min-w-[100px]">
             <p className="text-xl font-black text-blue-600 leading-none">{classStudents.length}</p>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Estudantes</p>
          </div>
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setActiveTab('students'); }} 
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg flex items-center gap-2"
          >
            <Plus size={14} /> Nova Matrícula
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-xs uppercase tracking-widest"><UsersIcon size={16} className="text-blue-600" /> Lista de Alunos</h3>
        </div>
        <div className="divide-y divide-slate-100">
           {classStudents.map(student => {
             const inReinforcement = isStudentInReinforcement(student.id);
             return (
               <div key={student.id} className="p-4 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-black text-sm text-blue-600 shadow-sm">
                     {student.name.charAt(0)}
                   </div>
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <p className="text-sm font-black text-slate-900 leading-none">{student.name}</p>
                       {inReinforcement && (
                         <span className="flex items-center gap-1 bg-rose-50 text-rose-600 text-[7px] font-black px-1.5 py-0.5 rounded border border-rose-100 uppercase animate-pulse">
                           <AlertCircle size={8} /> Em Apoio/Reforço
                         </span>
                       )}
                     </div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{student.status}</p>
                   </div>
                 </div>
                 <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); setActiveTab('students'); }} 
                  className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 rounded-lg transition-all shadow-sm"
                 >
                   <ChevronRight size={16} />
                 </button>
               </div>
             );
           })}
           {classStudents.length === 0 && (
             <div className="p-12 text-center space-y-3">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200"><GraduationCap size={32} /></div>
               <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Nenhum aluno matriculado nesta turma.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard userEmail={userEmail} />;
      case 'manager': return <ManagerPortal />;
      case 'students': return <StudentManagement />;
      case 'skills': return <SkillManagement />;
      case 'assessments': return <AssessmentForm />;
      case 'reinforcement': return <ReinforcementGroups />;
      case 'reports': return <Reports />;
      case 'coordinator': return <CoordinatorPortal />;
      case 'classes': return viewingClassId && currentClass ? renderClassDetail(currentClass) : (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <div>
               <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Gerenciamento de Turmas</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controle de enturmação e corpo docente</p>
            </div>
            {(userRole === UserRole.COORDINATOR || userRole === UserRole.MANAGER) && (
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); setShowClassModal(true); }} 
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Plus size={14} /> Cadastrar Nova Turma
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => (
              <div 
                key={c.id} 
                onClick={() => setViewingClassId(c.id)} 
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all"><School size={20} /></div>
                    {(userRole === UserRole.COORDINATOR || userRole === UserRole.MANAGER) && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => handleEditClass(e, c)}
                          className="p-1.5 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-md transition-all shadow-sm"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClass(e, c)}
                          className="p-1.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 rounded-md transition-all shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors pr-10 leading-tight mb-1">{c.name}</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest">{c.shift} • {c.grade} Ano</p>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <p className="text-indigo-500 font-black text-[9px] uppercase tracking-widest flex items-center gap-1" title="Professor Responsável">
                      <User size={10}/> {c.teacherName}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">SISTEMA ATIVO</span>
                     <div className="flex items-center text-blue-600 font-black text-[9px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">Ver Alunos <ChevronRight size={14} className="ml-1" /></div>
                  </div>
                </div>
              </div>
            ))}
            {classes.length === 0 && (
              <div className="col-span-full py-16 bg-white border border-dashed border-slate-300 rounded-2xl text-center opacity-50">
                 <School size={32} className="mx-auto mb-2 text-slate-300" />
                 <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Nenhuma turma cadastrada no sistema.</p>
              </div>
            )}
          </div>
        </div>
      );
      default: return <Dashboard userEmail={userEmail} />;
    }
  };

  return (
    <div className="h-full w-full">
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={async () => { await db.deleteClass(deleteConfirm.id); loadClasses(); }}
        title="Excluir Turma Permanentemente?"
        message={`Deseja remover a ${deleteConfirm.name}? Todos os vínculos de alunos desta turma serão perdidos.`}
      />

      {showClassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateOrEditClass} 
            className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200 border border-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{editingClass ? 'Atualizar Turma' : 'Cadastrar Turma'}</h3>
              <button 
                type="button" 
                onClick={closeClassModal} 
                className="text-slate-400 p-1 hover:bg-slate-50 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-0.5">Nome da Turma</label>
                <input required placeholder="Ex: 1º Ano A - Matutino" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-xs transition-all" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-0.5">Professor Responsável</label>
                <input required placeholder="Nome completo do docente" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-xs transition-all" value={newClass.teacherName} onChange={e => setNewClass({...newClass, teacherName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-0.5">Série/Ano</label>
                  <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs h-[48px]" value={newClass.grade} onChange={e => setNewClass({...newClass, grade: e.target.value})}>
                    {['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º'].map(g => <option key={g} value={g}>{g} Ano</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-0.5">Turno</label>
                  <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs h-[48px]" value={newClass.shift} onChange={e => setNewClass({...newClass, shift: e.target.value})}>
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                  </select>
                </div>
              </div>
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Save size={16} /> {editingClass ? 'Confirmar Edição' : 'Salvar Turma'}
            </button>
          </form>
        </div>
      )}

      {!isAuthenticated ? (
        <Login onLoginSuccess={(role) => { setIsAuthenticated(true); setUserRole(role); }} />
      ) : (
        <Layout 
          activeTab={activeTab} 
          setActiveTab={(tab) => { setViewingClassId(null); setActiveTab(tab); }} 
          userRole={userRole} 
          userEmail={userEmail} 
          onLogout={handleLogout}
        >
          {renderContent()}
        </Layout>
      )}
    </div>
  );
};

export default App;
