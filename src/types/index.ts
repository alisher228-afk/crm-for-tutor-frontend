export type UserRole = 'TUTOR' | 'STUDENT'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  role: UserRole
}

export interface User {
  id?: string
  email: string
  role: UserRole
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterTutorRequest {
  email: string
  password: string
}

export interface RegisterStudentRequest {
  inviteToken: string
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export type StudentStatus = 'ACTIVE' | 'ARCHIVED' | string

export interface StudentProfile {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  phone?: string
  telegram?: string
  currentLevel?: string
  status?: StudentStatus
  hourlyRate?: number
  balance?: number
  lessonBalance?: number
  notes?: string
  telegramLinked?: boolean
  tutorName?: string
  tutorEmail?: string
  createdAt?: string
  updatedAt?: string
}

export interface StudentCreateRequest {
  firstName: string
  lastName?: string
  phone?: string
  telegram?: string
  currentLevel?: string
  hourlyRate?: number
  notes?: string
}

export interface StudentUpdateRequest {
  firstName: string
  lastName?: string
  phone?: string
  telegram?: string
  currentLevel?: string
  hourlyRate?: number
  notes?: string
}

export interface StudentPageResponse {
  content: StudentProfile[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface InviteTokenResponse {
  inviteToken?: string
  token?: string
}

export interface TelegramLinkCodeResponse {
  code?: string
  telegramLinkCode?: string
}

export type LessonStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED_BY_TUTOR'
  | 'CANCELLED_BY_STUDENT'
  | string

export interface Lesson {
  id: string
  studentId: string
  studentName?: string
  topic?: string
  startTime: string
  endTime: string
  price?: number
  meetingUrl?: string
  status: LessonStatus
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface LessonCreateRequest {
  studentId: string
  startTime: string
  endTime: string
  topic?: string
  meetingUrl?: string
  price?: number
  notes?: string
}

export interface LessonUpdateRequest {
  studentId?: string
  startTime: string
  endTime: string
  topic?: string
  meetingUrl?: string
  price?: number
  notes?: string
}

export interface LessonStatusUpdateRequest {
  status: LessonStatus
}

export interface Payment {
  id: string
  studentId: string
  studentName?: string
  amount: number
  lessonsCount?: number
  paymentDate: string
  notes?: string
  newBalance?: number
  studentBalance?: number
  balance?: number
  createdAt?: string
}

export interface PaymentCreateRequest {
  studentId: string
  amount: number
  lessonsCount?: number
  paymentDate: string
  notes?: string
}

export interface PaymentUpdateRequest {
  studentId?: string
  amount: number
  lessonsCount?: number
  paymentDate: string
  notes?: string
}

export interface IncomeAnalytics {
  month: number
  year: number
  totalIncome: number
  lessonCount?: number
  paymentsCount?: number
}

export type HomeworkStatus = 'ASSIGNED' | 'SUBMITTED' | 'REVIEWED' | string

export interface Homework {
  id: string
  studentId: string
  studentName?: string
  lessonId?: string
  lessonTopic?: string
  title: string
  description?: string
  deadline?: string
  status: HomeworkStatus
  tutorFeedback?: string
  studentNotes?: string
  attachments?: Attachment[]
  createdAt?: string
  updatedAt?: string
}

export interface HomeworkCreateRequest {
  studentId: string
  lessonId?: string
  title: string
  description?: string
  deadline?: string
}

export interface HomeworkStatusPatchRequest {
  status: HomeworkStatus
}

export interface Attachment {
  id: string
  homeworkId?: string
  fileName: string
  name?: string
  fileSize?: number
  size?: number
  contentType?: string
  uploadedAt?: string
  createdAt?: string
}
