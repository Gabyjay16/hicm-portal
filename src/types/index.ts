export interface User {
  id: string;
  name: string;
  email?: string;
  role: 'student' | 'staff' | 'admin';
  isStaff?: boolean;
  isForumApproved?: boolean;
  matricNo?: string;
  matricule?: string;
  staffCode?: string;
  department?: string;
  level?: string;
  avatarUrl?: string;
  status?: string;
  phone?: string;
  joinDate?: string;
  canUpdateAnnouncements?: boolean;
  canViewAllForums?: boolean;
  customUsername?: string;
  showAvatarInForum?: boolean;
}

export interface AdminSettingsConfig {
  matriculeVerificationEnabled: boolean;
  validMatricules: string[];
  plagiarismPayment: {
    primaryNumber: string;
    primaryName: string;
    secondaryNumber?: string;
    secondaryName?: string;
    amount?: string;
  };
}

export type NavTab = 'home' | 'forum' | 'alerts' | 'notes';

export type SubView = 'dashboard' | 'evaluation' | 'plagiarism' | 'login';

export interface ForumMessage {
  id: string;
  author: string;
  role: 'student' | 'staff' | 'admin';
  text?: string;
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
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

export type ComplaintType = 'wrong_marks' | 'wrong_course_code' | 'remark_script';

export interface ComplaintField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'toggle';
  placeholder?: string;
  options?: string[];
  autoFill?: 'name' | 'matricule' | 'phone';
  toggleLabel?: string; // e.g., "NO MARK"
}

export interface ComplaintFormConfig {
  type: ComplaintType;
  title: string;
  description: string;
  fields: ComplaintField[];
}

export interface DocumentRequest {
  id: string;
  studentId: string;
  studentName: string;
  documentType: 'attestation' | 'attendance' | 'admission';
  status: 'pending' | 'processing' | 'ready' | 'collected';
  requestDate: string;
  notes?: string;
}

export interface CounsellingSession {
  id: string;
  studentId: string;
  studentName: string;
  isAnonymous: boolean;
  mode: 'online' | 'in_person';
  status: 'pending' | 'active' | 'closed';
  createdAt: string;
  assignedCounsellorId?: string;
  assignedCounsellorName?: string;
  messages: ForumMessage[];
}
