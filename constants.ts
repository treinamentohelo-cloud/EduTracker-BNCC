
import { BNCCSkill, Discipline, ClassRoom, Student, StudentStatus } from './types';

export const BNCC_SKILLS: BNCCSkill[] = [
  // Português
  { id: 'p1', code: 'EF01LP01', name: 'Leitura e interpretação', discipline: Discipline.PORTUGUESE, grade: '1º', description: 'Reconhecer que textos são lidos e escritos da esquerda para a direita.' },
  { id: 'p2', code: 'EF01LP02', name: 'Produção de textos', discipline: Discipline.PORTUGUESE, grade: '1º', description: 'Escrever, espontaneamente ou por ditado, palavras e frases.' },
  { id: 'p3', code: 'EF01LP03', name: 'Consciência fonológica', discipline: Discipline.PORTUGUESE, grade: '1º', description: 'Identificar fonemas e sua representação por letras.' },
  // Matemática
  { id: 'm1', code: 'EF01MA01', name: 'Operações básicas', discipline: Discipline.MATH, grade: '1º', description: 'Utilizar números naturais como indicador de quantidade ou de ordem.' },
  { id: 'm2', code: 'EF01MA02', name: 'Resolução de problemas', discipline: Discipline.MATH, grade: '1º', description: 'Contar de maneira exata ou aproximada.' },
  { id: 'm3', code: 'EF01MA03', name: 'Raciocínio lógico', discipline: Discipline.MATH, grade: '1º', description: 'Estimar e comparar quantidades de objetos.' },
  // Ciências
  { id: 'c1', code: 'EF01CI01', name: 'Seres vivos e meio ambiente', discipline: Discipline.SCIENCE, grade: '1º', description: 'Comparar características de differentes materiais.' },
  { id: 'c2', code: 'EF01CI02', name: 'Corpo humano e saúde', discipline: Discipline.SCIENCE, grade: '1º', description: 'Localizar, nomear e representar as partes do corpo humano.' },
];

export const MOCK_CLASSES: ClassRoom[] = [
  // Fixed: Added missing teacherName property as required by ClassRoom interface
  { id: 'c-1', name: 'Turma A', grade: '1º', shift: 'Matutino', teacherId: 'prof-1', teacherName: 'Marcos Oliveira' },
  { id: 'c-2', name: 'Turma B', grade: '2º', shift: 'Vespertino', teacherId: 'prof-1', teacherName: 'Marcos Oliveira' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's-1', name: 'Ana Silva', age: 7, grade: '1º', classId: 'c-1', status: StudentStatus.ADEQUATE, evaluations: [] },
  { id: 's-2', name: 'Bruno Gomes', age: 7, grade: '1º', classId: 'c-1', status: StudentStatus.NEEDS_REINFORCEMENT, evaluations: [] },
  { id: 's-3', name: 'Carla Dias', age: 7, grade: '1º', classId: 'c-1', status: StudentStatus.DEVELOPING, evaluations: [] },
  { id: 's-4', name: 'Daniel Souza', age: 8, grade: '2º', classId: 'c-2', status: StudentStatus.ADEQUATE, evaluations: [] },
];
