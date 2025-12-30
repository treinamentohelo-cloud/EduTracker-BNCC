
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { SkillLevel, StudentStatus, Bimester, StudentEvaluation, AssessmentType } from '../types';
import { 
  Save, 
  CheckCircle, 
  MessageSquare, 
  ListFilter, 
  Users, 
  Info, 
  ChevronDown, 
  FileText,
  Target,
  Trophy,
  Search,
  AlertCircle,
  FilterX
} from 'lucide-react';

export const AssessmentForm: React.FC = () => {
  const [skills, setSkills] = useState(db.getSkills());
  const [classes, setClasses] = useState(db.getClasses());
  const [selectedClassId, setSelectedClassId] = useState('c-1');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedBimester, setSelectedBimester] = useState<Bimester>(Bimester.B1);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>(AssessmentType.TEST);
  const [maxScore, setMaxScore] = useState<number>(10);
  
  // Advanced filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'ALL'>('ALL');
  
  // State for results
  const [results, setResults] = useState<Record<string, { level: SkillLevel, feedback: string, score: string }>>({});
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    const loadedSkills = db.getSkills();
    setSkills(loadedSkills);
    if (loadedSkills.length > 0) setSelectedSkillId(loadedSkills[0].id);
    setClasses(db.getClasses());
  }, []);

  const students = useMemo(() => {
    return db.getStudents().filter(s => s.classId === selectedClassId);
  }, [selectedClassId]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchName = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchName && matchStatus;
    });
  }, [students, searchTerm, statusFilter]);

  const handleLevelSelect = (studentId: string, level: SkillLevel) => {
    setResults(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId],
        level, 
        feedback: prev[studentId]?.feedback || '',
        score: prev[studentId]?.score || ''
      }
    }));
  };

  const handleScoreChange = (studentId: string, score: string) => {
    const numScore = parseFloat(score);
    if (!isNaN(numScore) && numScore > maxScore) return;

    setResults(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId],
        level: prev[studentId]?.level || SkillLevel.ACHIEVED,
        score,
        feedback: prev[studentId]?.feedback || ''
      }
    }));
  };

  const handleFeedbackChange = (studentId: string, feedback: string) => {
    setResults(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId],
        level: prev[studentId]?.level || SkillLevel.ACHIEVED, 
        feedback,
        score: prev[studentId]?.score || ''
      }
    }));
  };

  const setAllToLevel = (level: SkillLevel) => {
    const newResults: Record<string, { level: SkillLevel, feedback: string, score: string }> = { ...results };
    filteredStudents.forEach(s => {
      newResults[s.id] = { 
        level, 
        feedback: results[s.id]?.feedback || '',
        score: results[s.id]?.score || '' 
      };
    });
    setResults(newResults);
  };

  const handleSave = () => {
    (Object.entries(results) as [string, { level: SkillLevel, feedback: string, score: string }][]).forEach(([studentId, data]) => {
      const evaluation: StudentEvaluation = {
        id: `ev-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        skillId: selectedSkillId,
        level: data.level,
        date: new Date().toISOString(),
        bimester: selectedBimester,
        feedback: data.feedback,
        type: assessmentType,
        maxScore: maxScore,
        score: data.score ? parseFloat(data.score) : undefined
      };
      db.saveEvaluation(evaluation);
    });
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setResults({});
    setExpandedStudent(null);
  };

  const getLevelStyles = (level: SkillLevel, isSelected: boolean) => {
    if (!isSelected) return "bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600";
    
    switch (level) {
      case SkillLevel.EXCEEDED: return "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200";
      case SkillLevel.ACHIEVED: return "bg-green-600 border-green-600 text-white shadow-lg shadow-green-200";
      case SkillLevel.DEVELOPING: return "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200";
      case SkillLevel.NOT_ACHIEVED: return "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200";
      default: return "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200";
    }
  };

  const currentSkill = skills.find(s => s.id === selectedSkillId);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Toast Notificação */}
      {showSuccess && (
        <div className="fixed top-8 right-8 z-[300] bg-green-600 text-white px-10 py-5 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-right-10 shadow-2xl border-2 border-white/20">
          <CheckCircle size={32} className="animate-bounce" />
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight">Avaliações Consolidadas!</span>
            <span className="text-sm font-bold opacity-90 uppercase tracking-widest">{selectedBimester} atualizado no diário.</span>
          </div>
        </div>
      )}

      {/* Painel de Configuração */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/40 space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Trophy size={180} />
        </div>
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Trophy size={28} />
              </div>
              Controle Pedagógico
            </h3>
            <p className="text-slate-500 font-bold text-lg max-w-xl">Defina o contexto da atividade e lance os registros de desempenho BNCC.</p>
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl shadow-inner border border-slate-200">
            {Object.values(Bimester).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBimester(b)}
                className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${
                  selectedBimester === b 
                  ? 'bg-white text-blue-600 shadow-lg ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {b.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Users size={14} className="text-indigo-400" /> Turma Ativa
            </label>
            <div className="relative">
              <select 
                value={selectedClassId}
                onChange={(e) => {setSelectedClassId(e.target.value); setResults({});}}
                className="w-full appearance-none pl-6 pr-14 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer text-lg"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} • {c.grade} Ano</option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={24} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <FileText size={14} className="text-blue-400" /> Modalidade
            </label>
            <div className="relative">
              <select 
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                className="w-full appearance-none pl-6 pr-14 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer text-lg"
              >
                {Object.values(AssessmentType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={24} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Target size={14} className="text-rose-400" /> Teto de Nota
            </label>
            <input 
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(parseFloat(e.target.value) || 0)}
              className="w-full p-4.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-700 focus:ring-4 focus:ring-rose-100 transition-all text-lg"
              placeholder="10.0"
              step="0.5"
              min="1"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <ListFilter size={14} className="text-green-400" /> Critério BNCC
            </label>
            <div className="relative">
              <select 
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="w-full appearance-none pl-6 pr-14 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer text-lg"
              >
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.code} • {skill.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={24} />
            </div>
          </div>
        </div>

        {currentSkill && (
          <div className="p-8 bg-indigo-50/50 border-2 border-indigo-100 rounded-[2rem] flex items-start gap-6 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-white p-4 rounded-2xl text-indigo-600 shadow-xl shadow-indigo-100 flex-shrink-0">
              <Info size={32} />
            </div>
            <div>
              <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Habilidade em Avaliação:</p>
              <p className="text-xl font-black text-indigo-900 leading-tight mb-2">{currentSkill.code} • {currentSkill.name}</p>
              <p className="text-lg text-indigo-700 leading-relaxed font-medium italic">"{currentSkill.description}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Alunos e Filtros de Lista */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
              <Users size={20} className="text-blue-600" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase">Efetivo Filtrado</span>
                <span className="text-xl font-black text-slate-800 leading-none">{filteredStudents.length} Alunos</span>
              </div>
            </div>

            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={24} />
              <input 
                type="text" 
                placeholder="Localizar aluno pelo nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 font-bold text-lg transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filtrar por Status</label>
                <div className="flex gap-2">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="pl-5 pr-10 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm text-slate-600 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
                  >
                    <option value="ALL">Todos os Alunos</option>
                    <option value={StudentStatus.ADEQUATE}>Adequados</option>
                    <option value={StudentStatus.DEVELOPING}>Em Desenvolvimento</option>
                    <option value={StudentStatus.NEEDS_REINFORCEMENT}>Precisa de Reforço</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-inner border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter px-3">Lançamento em Massa:</span>
            <button onClick={() => setAllToLevel(SkillLevel.ACHIEVED)} className="px-4 py-2.5 bg-green-50 text-green-700 text-[10px] font-black rounded-xl hover:bg-green-600 hover:text-white transition-all uppercase tracking-widest">Atingido</button>
            <button onClick={() => setAllToLevel(SkillLevel.DEVELOPING)} className="px-4 py-2.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-xl hover:bg-amber-600 hover:text-white transition-all uppercase tracking-widest">Em Desenv.</button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="py-32 text-center space-y-6">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-100">
                  <FilterX size={56} />
               </div>
               <div>
                 <p className="text-xl font-black text-slate-400">Nenhum resultado para os filtros atuais.</p>
                 <button onClick={() => {setSearchTerm(''); setStatusFilter('ALL');}} className="text-blue-600 font-bold text-sm hover:underline mt-2">Limpar todos os filtros</button>
               </div>
            </div>
          ) : filteredStudents.map((student) => (
            <div key={student.id} className={`transition-all ${expandedStudent === student.id ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
              <div 
                className="p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8 cursor-pointer"
                onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
              >
                <div className="flex items-center gap-6 min-w-[340px]">
                  <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center font-black text-2xl shadow-xl transition-all ${results[student.id] ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-100 text-slate-300'}`}>
                    {student.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-black text-slate-900 text-2xl block mb-1 leading-tight">{student.name}</span>
                    <div className="flex items-center gap-2">
                       <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                         student.status === StudentStatus.ADEQUATE ? 'bg-blue-100 text-blue-600' : 
                         student.status === StudentStatus.DEVELOPING ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                       }`}>
                         Status Atual: {student.status}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 flex-1 justify-end">
                  {/* Nota Numérica */}
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nota Lançada</label>
                    <div className="relative">
                      <input 
                        type="number"
                        step="0.1"
                        min="0"
                        max={maxScore}
                        value={results[student.id]?.score || ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        className={`w-full sm:w-28 p-4 bg-white border-2 rounded-2xl outline-none font-black text-center text-xl transition-all ${
                          results[student.id]?.score ? 'border-blue-500 text-blue-700 shadow-lg shadow-blue-50' : 'border-slate-100 text-slate-400 focus:border-blue-400'
                        }`}
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  {/* Nível BNCC */}
                  <div className="flex flex-col gap-2 w-full sm:w-auto flex-1 max-w-lg">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Desenvolvimento BNCC</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {Object.values(SkillLevel).map((level) => (
                        <button
                          key={level}
                          onClick={(e) => { e.stopPropagation(); handleLevelSelect(student.id, level); }}
                          className={`px-4 py-3 rounded-xl text-[10px] font-black transition-all border-2 uppercase tracking-widest flex-1 min-w-[100px] ${
                            getLevelStyles(level, results[student.id]?.level === level)
                          }`}
                        >
                          {level === SkillLevel.NOT_ACHIEVED ? 'Inic.' : level === SkillLevel.DEVELOPING ? 'Desenv.' : level === SkillLevel.ACHIEVED ? 'Ating.' : 'Super.'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    className={`p-4 rounded-2xl border-2 transition-all h-fit self-end ${results[student.id]?.feedback ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-300 hover:text-blue-500 hover:border-blue-400 shadow-sm'}`}
                    onClick={(e) => { e.stopPropagation(); setExpandedStudent(expandedStudent === student.id ? null : student.id); }}
                  >
                    <MessageSquare size={24} />
                  </button>
                </div>
              </div>

              {expandedStudent === student.id && (
                <div className="px-10 pb-10 pt-2 animate-in slide-in-from-top-6 duration-300">
                  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-100 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-blue-600">
                        <MessageSquare size={20} />
                        <p className="text-sm font-black uppercase tracking-widest">Parecer Pedagógico Individualizado</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aluno: {student.name}</span>
                    </div>
                    <textarea 
                      value={results[student.id]?.feedback || ''}
                      onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                      placeholder="Relate aqui as evidências de aprendizagem, dificuldades específicas observadas e sugestões para o próximo ciclo..."
                      className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl min-h-[160px] outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-700 text-lg shadow-inner resize-none placeholder:text-slate-300"
                    />
                    <div className="flex justify-end">
                       <button 
                        onClick={(e) => {e.stopPropagation(); setExpandedStudent(null);}}
                        className="px-8 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-xs hover:bg-blue-100 transition-all uppercase tracking-widest"
                       >
                         Concluir Parecer
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rodapé de Lançamento */}
        <div className="p-12 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-2xl">
              {Object.keys(results).length}
            </div>
            <div className="space-y-1">
              <p className="text-white font-black text-xl leading-none">Registros Prontos</p>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Os dados serão exportados para o histórico de {selectedBimester}.</p>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={Object.keys(results).length === 0}
            className={`group flex items-center gap-6 px-16 py-6 rounded-[2.5rem] font-black transition-all shadow-[0_20px_50px_rgba(29,99,237,0.3)] active:scale-95 text-xl ${
              Object.keys(results).length === 0
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed grayscale'
              : 'bg-[#1d63ed] text-white hover:bg-blue-600 hover:-translate-y-1'
            }`}
          >
            <Save size={28} className="group-hover:scale-110 transition-transform" />
            Lançar Notas no Diário
          </button>
        </div>
      </div>
    </div>
  );
};
