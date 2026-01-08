
import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, User, X, Edit, Trash2, FileDown, Loader2, Target } from 'lucide-react';
import { StudentStatus, Student } from '../types';
import { db } from '../services/db';
import { ConfirmModal } from './ConfirmModal';
import { exportStudentDossier } from '../services/pdfService';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({ 
    name: '', 
    age: '', 
    grade: '1º', 
    classId: 'c-1',
    status: StudentStatus.ADEQUATE 
  });
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const loadStudents = () => {
    setStudents(db.getStudents());
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleAddOrEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name) return;

    const studentData: Student = editingStudent ? {
      ...editingStudent,
      name: newStudent.name,
      age: parseInt(newStudent.age) || 7,
      grade: newStudent.grade,
      classId: newStudent.classId,
      status: newStudent.status
    } : {
      id: 's-' + Math.random().toString(36).substr(2, 5),
      name: newStudent.name,
      age: parseInt(newStudent.age) || 7,
      grade: newStudent.grade,
      classId: newStudent.classId,
      status: newStudent.status,
      evaluations: []
    };

    await db.saveStudent(studentData);
    loadStudents();
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setNewStudent({ name: '', age: '', grade: '1º', classId: 'c-1', status: StudentStatus.ADEQUATE });
  };

  const handleGeneratePDF = (student: Student) => {
    setIsGenerating(student.id);
    setTimeout(() => {
      const allEvaluations = db.getStudents()
        .find(s => s.id === student.id)?.evaluations || [];
      const skills = db.getSkills();
      exportStudentDossier(student, allEvaluations, skills);
      setIsGenerating(null);
    }, 800);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setNewStudent({
      name: student.name,
      age: student.age.toString(),
      grade: student.grade,
      classId: student.classId,
      status: student.status
    });
    setIsModalOpen(true);
  };

  const confirmDeleteStudent = async () => {
    await db.deleteStudent(deleteConfirm.id);
    loadStudents();
    setDeleteConfirm({ ...deleteConfirm, isOpen: false });
  };

  const getStatusColor = (status: StudentStatus) => {
    switch (status) {
      case StudentStatus.ADEQUATE: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case StudentStatus.DEVELOPING: return 'bg-amber-50 text-amber-600 border-amber-100';
      case StudentStatus.NEEDS_REINFORCEMENT: return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 w-full">
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={confirmDeleteStudent}
        title="Excluir Aluno?"
        message={`Deseja realmente excluir ${deleteConfirm.name}? Histórico BNCC será perdido.`}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleAddOrEditStudent} className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</h3>
              <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); closeModal(); }} 
                className="text-slate-400 p-1 hover:bg-slate-50 rounded-md"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Nome Completo</label>
                <input required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} placeholder="Ex: Maria Santos" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Idade</label>
                  <input required type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" value={newStudent.age} onChange={e => setNewStudent({...newStudent, age: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Série</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs" value={newStudent.grade} onChange={e => setNewStudent({...newStudent, grade: e.target.value})}>
                    {['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º'].map(g => <option key={g} value={g}>{g} Ano</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Nível Inicial BNCC</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.values(StudentStatus).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={(e) => { e.preventDefault(); setNewStudent({...newStudent, status}); }}
                      className={`p-2 rounded-lg border-2 text-[7px] font-black uppercase tracking-tight text-center transition-all ${
                        newStudent.status === status 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      {status.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all"
            >
              {editingStudent ? 'Gravar Alterações' : 'Concluir Matrícula'}
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
          <input 
            type="text" 
            placeholder="Buscar aluno..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[11px] font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-md"
        >
          <Plus size={14} /> Matricular Estudante
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Série</th>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status BNCC</th>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black text-[10px]">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{student.name}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-tight">{student.age} anos</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{student.grade} Ano</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight border ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); handleGeneratePDF(student); }}
                        className={`p-2 bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all ${isGenerating === student.id ? 'animate-pulse' : ''}`}
                        title="Dossiê PDF"
                      >
                        {isGenerating === student.id ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />}
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); openEditModal(student); }}
                        className="p-2 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit size={12} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setDeleteConfirm({ isOpen: true, id: student.id, name: student.name }); }}
                        className="p-2 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                        title="Remover"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                   <td colSpan={4} className="p-12 text-center">
                      <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">Nenhum resultado encontrado.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
