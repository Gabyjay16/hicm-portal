export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  isStaff?: boolean;
  matricNo?: string;
  matricule?: string;
  staffCode?: string;
  department?: string;
  level?: string;
  avatarUrl?: string;
  status?: string;
}

export type NavTab = 'home' | 'forum' | 'alerts' | 'notes';

export type SubView = 'dashboard' | 'evaluation' | 'plagiarism' | 'login';

export interface ForumMessage {
  id: string;
  author: string;
  role: 'student' | 'staff' | 'admin';
  text?: string;
  content?: string;
  timestamp: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed index in options
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed?: boolean;
  answers?: Record<number, number>;
  completedAt?: string;
}

export interface PlagiarismState {
  docName: string;
  status: string;
  similarityScore: number;
  tokensRemaining: number;
}

export interface MatchingSource {
  source: string;
  similarity: number; // percentage e.g. 15
  snippet?: string;
}

export interface PlagiarismDoc {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  status: 'analyzing' | 'completed' | 'failed';
  score?: number; // 0-100 similarity score
  tokenCost: number;
  matchingSources?: MatchingSource[];
}

export interface AlertItem {
  id: string;
  title: string;
  category: 'academic' | 'emergency' | 'event' | 'general';
  priority: 'high' | 'medium' | 'low';
  date: string;
  content: string;
  isRead?: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  courseCode: string;
  content: string;
  author: string;
  date: string;
  isShared: boolean;
  tags: string[];
}
