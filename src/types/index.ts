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

export interface UserProfile {
  id: number
  email: string
  role: UserRole
  firstName?: string
  lastName?: string
  phone?: string
  specialization?: string
  createdAt?: string
}

export interface UserProfileUpdateRequest {
  firstName?: string
  lastName?: string
  phone?: string
  specialization?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
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
  groupName?: string
  telegramLinked?: boolean
  tutorName?: string
  tutorEmail?: string
  tutorPhone?: string
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
  groupName?: string
  notes?: string
}

export interface StudentUpdateRequest {
  firstName: string
  lastName?: string
  phone?: string
  telegram?: string
  currentLevel?: string
  hourlyRate?: number
  groupName?: string
  notes?: string
  status?: StudentStatus
}

export interface StudentPageResponse {
  content: StudentProfile[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface StudentGroup {
  name: string
  studentCount: number
  students: StudentProfile[]
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
  studentFirstName?: string
  studentLastName?: string
  topic?: string
  startTime: string
  endTime: string
  price?: number
  meetingUrl?: string
  groupName?: string
  status: LessonStatus
  cancellationReason?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface LessonCancelRequest {
  reason?: string
}

export interface LessonCreateRequest {
  studentId?: string
  startTime: string
  endTime: string
  topic?: string
  meetingUrl?: string
  groupName?: string
  price?: number
  notes?: string
}

export interface LessonUpdateRequest {
  studentId?: string
  startTime: string
  endTime: string
  topic?: string
  meetingUrl?: string
  groupName?: string
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

export interface StudentPaymentsResponse {
  lessonBalance: number
  payments: Payment[]
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
  studentId?: string
  studentName?: string
  groupName?: string
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
  studentId?: string
  groupName?: string
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
  originalFileName?: string
  name?: string
  fileSize?: number
  sizeBytes?: number
  size?: number
  contentType?: string
  uploadedAt?: string
  createdAt?: string
}

export interface TeachingMaterial {
  id: string
  tutorId?: string
  title: string
  description?: string
  category?: string
  fileName: string
  originalFileName: string
  contentType?: string
  sizeBytes: number
  fileSize?: number
  createdAt: string
  updatedAt?: string
}

export interface MaterialCreatePayload {
  title: string
  category?: string
  description?: string
  file: File
}

export interface MaterialUpdatePayload {
  title: string
  category?: string
  description?: string
}

export type TestType = 'INTERNAL' | 'EXTERNAL'
export type TestTargetType = 'ALL' | 'GROUP' | 'INDIVIDUAL'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctOptionIndex: number
  explanation?: string
}

export interface TestSubmission {
  id: string
  testId: string
  testTitle?: string
  studentId: string
  studentName?: string
  score: number
  totalQuestions: number
  percentage: number
  timeSpentSeconds?: number
  answersJson?: string
  submittedAt: string
}

export interface TestSubmissionRequest {
  answersJson?: string
  timeSpentSeconds?: number
}

export interface TestItem {
  id: string
  tutorId?: string
  title: string
  description?: string
  topic?: string
  type: TestType
  externalUrl?: string
  questionsJson?: string
  timeLimitMinutes?: number
  deadline?: string
  targetType?: TestTargetType
  groupName?: string
  studentId?: string | number
  studentName?: string
  submissionsCount?: number
  averageScore?: number
  mySubmission?: TestSubmission
  createdAt: string
  updatedAt?: string
}

export interface TestCreateRequest {
  title: string
  description?: string
  topic?: string
  type: TestType
  externalUrl?: string
  questionsJson?: string
  timeLimitMinutes?: number
  deadline?: string
  targetType?: TestTargetType
  groupName?: string
  studentId?: string | number
}

export interface TestUpdateRequest {
  title?: string
  description?: string
  topic?: string
  type?: TestType
  externalUrl?: string
  questionsJson?: string
  timeLimitMinutes?: number
  deadline?: string
  targetType?: TestTargetType
  groupName?: string
  studentId?: string | number
}

export interface TestPageResponse {
  content: TestItem[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

