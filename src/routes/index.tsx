import { type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

import {
  LoginPage,
  TutorRegisterPage,
  StudentRegisterPage,
} from '@/pages/auth'

import { TutorLayout } from '@/layouts/TutorLayout'
import {
  TutorStudentsPage,
  TutorLessonsPage,
  TutorPaymentsPage,
  TutorHomeworkPage,
} from '@/pages/tutor'

import { StudentLayout } from '@/layouts/StudentLayout'
import {
  StudentProfilePage,
  StudentLessonsPage,
  StudentHomeworkPage,
  StudentPaymentsPage,
} from '@/pages/student'
import { Loader2 } from 'lucide-react'

function RootRedirect() {
  const { isAuthenticated, role, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={role === 'TUTOR' ? '/tutor/students' : '/student'} replace />
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, role, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={role === 'TUTOR' ? '/tutor/students' : '/student'} replace />
  }

  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <TutorRegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register-tutor"
        element={<Navigate to="/register" replace />}
      />
      <Route
        path="/register/student"
        element={
          <PublicOnlyRoute>
            <StudentRegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register-student"
        element={<Navigate to="/register/student" replace />}
      />

      {/* Tutor routes */}
      <Route
        path="/tutor"
        element={
          <ProtectedRoute allowedRole="TUTOR">
            <TutorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="students" replace />} />
        <Route path="students" element={<TutorStudentsPage />} />
        <Route path="lessons" element={<TutorLessonsPage />} />
        <Route path="payments" element={<TutorPaymentsPage />} />
        <Route path="homework" element={<TutorHomeworkPage />} />
      </Route>

      {/* Student routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="STUDENT">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentProfilePage />} />
        <Route path="lessons" element={<StudentLessonsPage />} />
        <Route path="homework" element={<StudentHomeworkPage />} />
        <Route path="payments" element={<StudentPaymentsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
