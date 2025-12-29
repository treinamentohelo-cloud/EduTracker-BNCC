
import React, { useState, useEffect } from 'react';
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
import { UserRole, ClassRoom } from './types';
import { db } from './services/db';
import { supabase } from './services/supabase';
import { 
  ChevronRight,
  School,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.TEACHER);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classes, setClasses] = useState(db.getClasses());
  const [newClass, setNewClass] = useState({ name: '', grade: '1º', shift: 'Matutino' });
  
  // State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ 
    isOpen: false, 
    id: '', 
    name: '' 
  });

  useEffect(() => {
    // Sincronizar dados do Supabase ao iniciar
    db.syncFromSupabase().then(() => {
      setClasses(db.getClasses());
    });

    // Verificar sessão existente do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user?.email);
        const role = session.user?.user_metadata?.role as UserRole || UserRole.TEACHER;
        setUserRole(role);
        if (role === UserRole.MANAGER) setActiveTab('manager');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user?.email);
        const role = session.user?.user_metadata?.role as UserRole || UserRole.TEACHER;
        setUserRole(role);
        if (role === UserRole.MANAGER) setActiveTab('manager');
      } else {
        setIsAuthenticated(false);
        setUserEmail(undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === UserRole.MANAGER) setActiveTab('manager');
    else setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail(undefined);
  };

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
    setNewClass({
      name: cls.name,
      grade: cls.grade,
      shift: cls.shift
    });
    setShowClassModal(true);
  };

  const confirmDeleteClass = async () => {
    await db.deleteClass(deleteConfirm.id);
    setClasses(db.getClasses());
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

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
      case 'classes': return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Gestão de Turmas</h3>
            {(userRole === UserRole.COORDINATOR || userRole === UserRole.MANAGER) && (
              <button 
                onClick={() => setShowClassModal(true)} 
                className="flex items-center gap-2 bg-[#1d63ed] text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg border border-black/10 hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Plus size={18} /> Cadastrar Nova Turma
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                
                {(userRole === UserRole.COORDINATOR || userRole === UserRole.MANAGER) && (
                  <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditClassModal(c); }} 
                      className="p-2 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 rounded-xl transition-all shadow-sm"
                      title="Editar Turma"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setDeleteConfirm({ isOpen: true, id: c.id, name: c.name });
                      }} 
                      className="p-2 bg-white border border-slate-200 hover:bg-red-50 text-red-600 rounded-xl transition-all shadow-sm"
                      title="Excluir Turma"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <School size={24} />
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-green-100 text-green-700 tracking-wider">
                      Ativa
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors pr-16">{c.name}</h4>
                  <p className="text-slate-500 text-sm mb-8 font-medium">{c.shift} • {c.grade} Ano</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                     <span className="text-xs font-bold text-slate-400">EF I</span>
                     <div className="flex items-center text-blue-600 font-bold text-sm">
                        Gerenciar <ChevronRight size={16} className="ml-1 group-hover:ml-2 transition-all" />
                     </div>
                  </div>
                </div>
              </div>
            ))}
            {(userRole === UserRole.COORDINATOR || userRole === UserRole.MANAGER) && (
              <button 
                onClick={() => setShowClassModal(true)}
                className="border-4 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all bg-white/50 min-h-[220px]"
              >
                <Plus size={40} className="mb-2" />
                <span className="font-bold">Criar Nova Turma</span>
              </button>
            )}
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
        onConfirm={confirmDeleteClass}
        title="Excluir Turma?"
        message={`Você está prestes a remover a ${deleteConfirm.name}. Isso não removerá os alunos, mas eles ficarão sem turma associada no sistema.`}
      />

      {showClassModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleCreateOrEditClass} className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">{editingClass ? 'Editar Turma' : 'Nova Turma'}</h3>
              <button type="button" onClick={closeClassModal} className="text-slate-400 hover:text-slate-600 p-2"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome da Turma</label>
                <input 
                  required 
                  placeholder="Ex: 1º Ano A"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                  value={newClass.name} 
                  onChange={e => setNewClass({...newClass, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Série</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newClass.grade} onChange={e => setNewClass({...newClass, grade: e.target.value})}>
                    {['1º', '2º', '3º', '4º', '5º'].map(g => <option key={g} value={g}>{g} Ano</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Turno</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newClass.shift} onChange={e => setNewClass({...newClass, shift: e.target.value})}>
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                  </select>
                </div>
              </div>
            </div>
            <button className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-2">
              <Save size={20} /> {editingClass ? 'Salvar Alterações' : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>
      )}

      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={userRole}
        userEmail={userEmail}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
    </div>
  );
};

export default App;
