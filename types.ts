
export enum UserRole {
  TEACHER = 'Professor',
  COORDINATOR = 'Coordenador Pedagógico',
  MANAGER = 'Gestor Escolar'
}

export enum Discipline {
  PORTUGUESE = 'Português',
  MATH = 'Matemática',
  SCIENCE = 'Ciências'
}

export enum SkillLevel {
  NOT_ACHIEVED = 'Não atingiu',
  DEVELOPING = 'Em desenvolvimento',
  ACHIEVED = 'Atingiu',
  EXCEEDED = 'Superou'
}

export enum StudentStatus {
  ADEQUATE = 'Adequado',
  DEVELOPING = 'Em desenvolvimento',
  NEEDS_REINFORCEMENT = 'Precisa de reforço'
}

export enum Bimester {
  B1 = '1º Bimestre',
  B2 = '2º Bimestre',
  B3 = '3º Bimestre',
  B4 = '4º Bimestre'
}

export enum AssessmentType {
  TEST = 'Prova',
  PROJECT = 'Trabalho',
  PARTICIPATION = 'Participação',
  EXERCISE = 'Exercício em Sala',
  OTHER = 'Outros'
}

export interface BNCCSkill {
  id: string;
  code?: string;
  name: string;
  discipline: string;
  description: string;
  grade: string;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  grade: string;
  classId: string;
  status: StudentStatus;
  evaluations: StudentEvaluation[];
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  shift: 'Matutino' | 'Vespertino';
  teacherId: string;
}

export interface StudentEvaluation {
  id: string;
  studentId: string;
  skillId: string;
  level: SkillLevel;
  date: string;
  bimester: Bimester;
  feedback?: string;
  type?: AssessmentType;
  maxScore?: number;
  score?: number;
}

export interface AttendanceRecord {
  id: string;
  groupId: string;
  date: string;
  presentStudentIds: string[];
}

export interface ReinforcementGroup {
  id: string;
  name: string;
  discipline: string;
  skillIds: string[];
  studentIds: string[];
  schedule: string;
  startDate: string; // Nova data de início
  expectedEndDate?: string; // Nova previsão de saída
}

export interface TeacherInvite {
  id: string;
  email: string;
  role: UserRole;
  status: 'Pendente' | 'Aceito';
  inviteLink: string;
}
