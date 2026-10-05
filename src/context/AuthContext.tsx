import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { authApi } from '@/api/auth'
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  USER_ROLE_KEY,
  USER_EMAIL_KEY,
} from '@/api/client'
import type { User, UserRole, AuthResponse } from '@/types'

export interface AuthContextType {
  user: User | null
  role: UserRole | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  registerTutor: (email: string, password: string) => Promise<AuthResponse>
  registerStudent: (
    inviteToken: string,
    email: string,
    password: string,
  ) => Promise<AuthResponse>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const normalizeRole = (r?: string | null): UserRole | null => {
    if (!r) return null
    const clean = r.replace(/^ROLE_/, '')
    return clean === 'TUTOR' || clean === 'STUDENT' ? clean : null
  }

  useEffect(() => {
    const storedAccess = getStoredAccessToken()
    const storedRefresh = getStoredRefreshToken()
    const storedRole = normalizeRole(localStorage.getItem(USER_ROLE_KEY))
    const storedEmail = localStorage.getItem(USER_EMAIL_KEY)

    if (storedAccess && storedRefresh && storedRole) {
      setAccessToken(storedAccess)
      setRefreshToken(storedRefresh)
      setRole(storedRole)
      setUser({
        email: storedEmail || '',
        role: storedRole,
      })
    }
    setIsLoading(false)
  }, [])

  const handleAuthSuccess = (res: AuthResponse, email: string) => {
    const normalizedRole = normalizeRole(res.role) || 'TUTOR'
    setStoredTokens({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      role: normalizedRole,
      email,
    })
    setAccessToken(res.accessToken)
    setRefreshToken(res.refreshToken)
    setRole(normalizedRole)
    setUser({
      email,
      role: normalizedRole,
    })
  }

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await authApi.login({ email, password })
    handleAuthSuccess(res, email)
    return res
  }

  const registerTutor = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const res = await authApi.registerTutor({ email, password })
    if (res.accessToken) {
      handleAuthSuccess(res, email)
    }
    return res
  }

  const registerStudent = async (
    inviteToken: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const res = await authApi.registerStudent({ inviteToken, email, password })
    if (res.accessToken) {
      handleAuthSuccess(res, email)
    }
    return res
  }

  const logout = () => {
    clearStoredTokens()
    setAccessToken(null)
    setRefreshToken(null)
    setRole(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        registerTutor,
        registerStudent,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
