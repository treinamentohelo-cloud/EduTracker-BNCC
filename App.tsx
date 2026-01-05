
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
import { UserRole, ClassRoom, Student } from './types';
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
  GraduationCap
} from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.TEACHER);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classes, setClasses] = useState(db.getClasses());
  const [viewingClassId, setViewingClassId] = useState<string | null>(null);
  const [newClass, setNewClass] = useState({ name: '', grade: '1º', shift: 'Matutino' });
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ 
    isOpen: false, 
    id: '', 
    name: '' 
  });

  useEffect(() => {
    db.syncFromSupabase().then(() => {
      setClasses(db.getClasses());
    });

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
  const classStudents = useMemo(() => db.getStudents().filter(s => s.classId === viewingClassId), [viewingClassId]);

  const handleCreateOrEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name) return;
    const cls: ClassRoom = editingClass ? {
      ...editingClass,
      name: newClass.name,
      grade: newClass.grade,
      shift: newClass.shift as any
    } : { 
      id: 'c-' + Math.random().toString(36).substr(2, 5), 
      name: newClass.name, 
      grade: newClass.grade, 
      shift: newClass.shift as any, 
      teacherId: 'prof-1' 
    };
    await db.saveClass(cls);
    setClasses(db.getClasses());
    closeClassModal();
  };

  const closeClassModal = () => {
    setShowClassModal(false);
    setEditingClass(null);
    setNewClass({ name: '', grade: '1º', shift: 'Matutino' });
  };

  const openEditClassModal = (cls: ClassRoom) => {
    setEditingClass(cls);
    setNewClass({ name: cls.name, grade: cls.grade, shift: cls.shift });
    setShowClassModal(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setViewingClassId(null);
  };

  const renderClassDetail = (cls: ClassRoom) => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <button onClick={() => setViewingClassId(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all">
        <ArrowLeft size={16} /> Voltar para Turmas
      </button>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><School size={150} /></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100"><School size={32} /></div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{cls.name}</h2>
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-xs">
              <span>{cls.grade} Ano</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>{cls.shift}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-center">
             <p className="text-2xl font-black text-blue-600">{classStudents.length}</p>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alunos</p>
          </div>
          <button onClick={() => { setActiveTab('students'); }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-lg flex items-center gap-2">
            <Plus size={16} /> Gerenciar Alunos
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-800 flex items-center gap-3"><UsersIcon size={20} className="text-blue-600" /> Lista de Alunos</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{classStudents.length} MATRICULADOS</span>
        </div>
        <div className="divide-y divide-slate-100">
           {classStudents.map(student => (
             <div key={student.id} className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
               <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-xl text-blue-600 shadow-sm">{student.name.charAt(0)}</div>
                 <div>
                   <p className="text-xl font-black text-slate-900 leading-none mb-1">{student.name}</p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{student.status}</p>
                 </div>
               </div>
               <button onClick={() => { setActiveTab('students'); }} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 rounded-xl transition-all shadow-sm">
                 <ChevronRight size={20} />
               </button>
             </div>
           ))}
           {classStudents.length === 0 && (
             <div className="p-20 text-center space-y-4">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200"><GraduationCap size={40} /></div>
               <p className="text-slate-400 font-bold">Nenhum aluno matriculado nesta turma.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'manager': return <ManagerPortal />;
      case 'students': return <StudentManagement />;
      case 'skills': return <SkillManagement />;
      case 'assessments': return <AssessmentForm />;
      case 'reinforcement': return <ReinforcementGroups />;
      case 'reports': return <Reports />;
      case 'coordinator': return <CoordinatorPortal />;
      case 'classes': return viewingClassId && currentClass ? renderClassDetail(currentClass) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Turmas</h3>
            {(userRole === UserRole.COORDINATOR || userRole === UserRole.MANAGER) && (
              <button onClick={() => setShowClassModal(true)} className="flex items-center gap-2 bg-[#1d63ed] text-white px-8 py-4 rounded-2xl text-xs font-black shadow-xl shadow-blue-100 border border-black/10 hover:bg-blue-700 active:scale-95 transition-all">
                <Plus size={18} /> Cadastrar Nova Turma
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((c) => (
              <div key={c.id} onClick={() => setViewingClassId(c.id)} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                {(userRole === UserRole.COORDINATOR || userRole === UserRole.MANAGER) && (
                  <div className="absolute top-8 right-8 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openEditClassModal(c); }} className="p-3 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 rounded-xl transition-all shadow-sm"><Edit size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, id: c.id, name: c.name }); }} className="p-3 bg-white border border-slate-200 hover:bg-red-50 text-red-600 rounded-xl transition-all shadow-sm"><Trash2 size={16} /></button>
                  </div>
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all"><School size={28} /></div>
                  <h4 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors pr-16 leading-tight mb-2">{c.name}</h4>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-10">{c.shift} • {c.grade} Ano</p>
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ensino Fundamental I</span>
                     <div className="flex items-center text-blue-600 font-black text-xs uppercase tracking-widest">Gerenciar <ChevronRight size={16} className="ml-1 group-hover:ml-3 transition-all" /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      default: return <Dashboard />;
    }
  };

  return (
    <div className="relative">
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={() => { db.deleteClass(deleteConfirm.id); setClasses(db.getClasses()); }}
        title="Excluir Turma?"
        message={`Deseja remover a ${deleteConfirm.name}?`}
      />

      {showClassModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleCreateOrEditClass} className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800">{editingClass ? 'Editar Turma' : 'Nova Turma'}</h3>
              <button type="button" onClick={closeClassModal} className="text-slate-400 hover:text-slate-600 p-2"><X /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Identificação da Turma</label>
                <input required placeholder="Ex: 1º Ano A" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Série</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newClass.grade} onChange={e => setNewClass({...newClass, grade: e.target.value})}>
                    {['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º'].map(g => <option key={g} value={g}>{g} Ano</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Turno</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newClass.shift} onChange={e => setNewClass({...newClass, shift: e.target.value})}>
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                  </select>
                </div>
              </div>
            </div>
            <button className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-blue-700 transition-all text-lg flex items-center justify-center gap-2"><Save size={20} /> Salvar Turma</button>
          </form>
        </div>
      )}

      {!isAuthenticated ? (
        <Login onLoginSuccess={(role) => { setIsAuthenticated(true); setUserRole(role); }} />
      ) : (
        <Layout activeTab={activeTab} setActiveTab={(tab) => { setViewingClassId(null); setActiveTab(tab); }} userRole={userRole} userEmail={userEmail} onLogout={handleLogout}>
          {renderContent()}
        </Layout>
      )}
    </div>
  );
};

export default App;
