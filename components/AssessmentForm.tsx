
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { SkillLevel, StudentStatus, Bimester, StudentEvaluation, AssessmentType } from '../types';
import { 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  MessageSquare, 
  ListFilter, 
  Users, 
  Star, 
  Info, 
  ChevronDown, 
  Check,
  FileText,
  Target,
  Trophy
} from 'lucide-react';

export const AssessmentForm: React.FC = () => {
  const [skills, setSkills] = useState(db.getSkills());
  const [classes, setClasses] = useState(db.getClasses());
  const [selectedClassId, setSelectedClassId] = useState('c-1');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedBimester, setSelectedBimester] = useState<Bimester>(Bimester.B1);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>(AssessmentType.TEST);
  const [maxScore, setMaxScore] = useState<number>(10);
  
  // State for results now includes numeric score
  const [results, setResults] = useState<Record<string, { level: SkillLevel, feedback: string, score: string }>>({});
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    const loadedSkills = db.getSkills();
    setSkills(loadedSkills);
    if (loadedSkills.length > 0) setSelectedSkillId(loadedSkills[0].id);
    setClasses(db.getClasses());
  }, []);

  const students = db.getStudents().filter(s => s.classId === selectedClassId);

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
    // Basic validation for score
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
    const newResults: Record<string, { level: SkillLevel, feedback: string, score: string }> = {};
    students.forEach(s => {
      newResults[s.id] = { 
        level, 
        feedback: results[s.id]?.feedback || '',
        score: results[s.id]?.score || '' 
      };
    });
    setResults(newResults);
  };

  const handleSave = () => {
    Object.entries(results).forEach(([studentId, data]) => {
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
  };

  const getLevelStyles = (level: SkillLevel, isSelected: boolean) => {
    if (!isSelected) return "bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600";
    
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
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Toast de Sucesso */}
      {showSuccess && (
        <div className="fixed top-8 right-8 z-[300] bg-green-600 text-white px-8 py-4 rounded-3xl flex items-center gap-3 animate-in slide-in-from-right-8 shadow-2xl">
          <CheckCircle size={24} />
          <div className="flex flex-col">
            <span className="font-bold text-lg">Avaliações Salvas!</span>
            <span className="text-sm opacity-90 text-white/80">{selectedBimester} atualizado com sucesso.</span>
          </div>
        </div>
      )}

      {/* Cabeçalho de Filtros e Configuração da Avaliação */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Trophy className="text-amber-400 fill-amber-400" />
              Ciclo de Avaliação
            </h3>
            <p className="text-slate-500 font-medium">Configure os parâmetros da atividade e atribua os resultados.</p>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
            {Object.values(Bimester).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBimester(b)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                  selectedBimester === b 
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {b.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} /> Turma
            </label>
            <div className="relative">
              <select 
                value={selectedClassId}
                onChange={(e) => {setSelectedClassId(e.target.value); setResults({});}}
                className="w-full appearance-none pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.grade} Ano</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={14} /> Tipo de Avaliação
            </label>
            <div className="relative">
              <select 
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                className="w-full appearance-none pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {Object.values(AssessmentType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Target size={14} /> Pontuação Máxima
            </label>
            <input 
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(parseFloat(e.target.value) || 0)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ex: 10.0"
              step="0.5"
              min="0"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ListFilter size={14} /> Habilidade Alvo
            </label>
            <div className="relative">
              <select 
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="w-full appearance-none pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.code} • {skill.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>
        </div>

        {currentSkill && (
          <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
            <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm">
              <Info size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900 leading-tight mb-1">Critério BNCC:</p>
              <p className="text-sm text-blue-700 leading-relaxed italic">"{currentSkill.description}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Alunos Reestilizada */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm">
              {students.length}
            </div>
            <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Alunos Avaliados</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mr-2">Preencher Nível BNCC para todos:</span>
            <button onClick={() => setAllToLevel(SkillLevel.ACHIEVED)} className="px-3 py-1.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg hover:bg-green-100 border border-green-200 transition-all">Atingido</button>
            <button onClick={() => setAllToLevel(SkillLevel.DEVELOPING)} className="px-3 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg hover:bg-amber-100 border border-amber-200 transition-all">Em Desenv.</button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {students.map((student) => (
            <div key={student.id} className={`transition-all ${expandedStudent === student.id ? 'bg-slate-50/80' : 'hover:bg-slate-50/40'}`}>
              <div 
                className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 cursor-pointer"
                onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
              >
                <div className="flex items-center gap-5 min-w-[300px]">
                  <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg shadow-sm">
                    {student.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-black text-slate-800 text-xl block mb-0.5">{student.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest">
                      Ano Atual: {student.grade}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 justify-end">
                  {/* Numeric Score Field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nota (Max {maxScore})</label>
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      max={maxScore}
                      value={results[student.id]?.score || ''}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleScoreChange(student.id, e.target.value)}
                      className="w-24 p-3 bg-white border border-slate-200 rounded-xl outline-none font-black text-center text-blue-600 focus:ring-2 focus:ring-blue-500 shadow-inner"
                      placeholder="0.0"
                    />
                  </div>

                  {/* Level Selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nível de Habilidade BNCC</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Object.values(SkillLevel).map((level) => (
                        <button
                          key={level}
                          onClick={(e) => { e.stopPropagation(); handleLevelSelect(student.id, level); }}
                          className={`px-4 py-2.5 rounded-xl text-[9px] font-black transition-all border-2 uppercase tracking-widest ${
                            getLevelStyles(level, results[student.id]?.level === level)
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    className={`p-3 rounded-2xl border-2 transition-all h-fit self-end mb-1 ${results[student.id]?.feedback ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-400'}`}
                    onClick={(e) => { e.stopPropagation(); setExpandedStudent(expandedStudent === student.id ? null : student.id); }}
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>

              {expandedStudent === student.id && (
                <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-300">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-blue-600">
                      <MessageSquare size={16} />
                      <p className="text-xs font-black uppercase tracking-widest">Observações Pedagógicas para este Aluno</p>
                    </div>
                    <textarea 
                      value={results[student.id]?.feedback || ''}
                      onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                      placeholder="Descreva observações específicas sobre o desempenho nesta avaliação..."
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 text-sm resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Barra de Ação Final */}
        <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-slate-500">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-blue-600 font-black">
              {Object.keys(results).length}
            </div>
            <p className="text-xs font-bold leading-tight uppercase tracking-tighter">
              Registros Prontos<br/>
              <span className="text-[10px] text-slate-400 font-medium">Os dados serão consolidados no histórico individual.</span>
            </p>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={Object.keys(results).length === 0}
            className={`flex items-center gap-4 px-12 py-5 rounded-[2rem] font-black transition-all shadow-2xl active:scale-95 text-lg ${
              Object.keys(results).length === 0
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed grayscale'
              : 'bg-[#1d63ed] text-white hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            <Save size={24} />
            Lançar Resultados no Diário
          </button>
        </div>
      </div>
    </div>
  );
};
