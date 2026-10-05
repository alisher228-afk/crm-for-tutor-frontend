import { type ReactNode, lazy, Suspense } from 'react'
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
  TutorMaterialsPage,
  TutorTestsPage,
  TutorProfilePage,
} from '@/pages/tutor'

import { StudentLayout } from '@/layouts/StudentLayout'
import {
  StudentProfilePage,
  StudentLessonsPage,
  StudentHomeworkPage,
  StudentPaymentsPage,
  StudentMaterialsPage,
  StudentTestsPage,
} from '@/pages/student'
import { LandingPage } from '@/pages/landing'
import { Loader2 } from 'lucide-react'

const DesignPage = lazy(() =>
  import('@/pages/design/DesignPage').then((m) => ({ default: m.DesignPage }))
)

const isDevEnv =
  import.meta.env.DEV ||
  (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))

function RootRedirect() {
  const { isAuthenticated, role, isLoading, isTelegramWebApp } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    if (isTelegramWebApp) {
      return <Navigate to="/login" replace />
    }
    return <LandingPage />
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
      <Route path="/landing" element={<LandingPage />} />

      {/* Dev-only design system showcase */}
      {isDevEnv && (
        <Route
          path="/design"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }
            >
              <DesignPage />
            </Suspense>
          }
        />
      )}

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
        <Route path="individual" element={<Navigate to="/tutor/students" replace />} />
        <Route path="groups" element={<Navigate to="/tutor/students?tab=groups" replace />} />
        <Route path="lessons" element={<TutorLessonsPage />} />
        <Route path="payments" element={<TutorPaymentsPage />} />
        <Route path="homework" element={<TutorHomeworkPage />} />
        <Route path="materials" element={<TutorMaterialsPage />} />
        <Route path="tests" element={<TutorTestsPage />} />
        <Route path="profile" element={<TutorProfilePage />} />
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
        <Route path="materials" element={<StudentMaterialsPage />} />
        <Route path="payments" element={<StudentPaymentsPage />} />
        <Route path="tests" element={<StudentTestsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
