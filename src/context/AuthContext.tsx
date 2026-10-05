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
import type { TelegramUser } from '@/types/telegram'

export interface AuthContextType {
  user: User | null
  role: UserRole | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isTelegramWebApp: boolean
  telegramUser: TelegramUser | null
  telegramLinkRequired: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  loginWithTelegram: (linkCode?: string) => Promise<AuthResponse>
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
  const [isTelegramWebApp, setIsTelegramWebApp] = useState<boolean>(false)
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null)
  const [telegramLinkRequired, setTelegramLinkRequired] = useState<boolean>(false)

  const normalizeRole = (r?: string | null): UserRole | null => {
    if (!r) return null
    const clean = r.replace(/^ROLE_/, '')
    return clean === 'TUTOR' || clean === 'STUDENT' ? clean : null
  }

  const handleAuthSuccess = (res: AuthResponse, email: string) => {
    const normalizedRole = normalizeRole(res.role) || 'STUDENT'
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
    setTelegramLinkRequired(false)
  }

  useEffect(() => {
    const initAuth = async () => {
      const storedAccess = getStoredAccessToken()
      const storedRefresh = getStoredRefreshToken()
      const storedRole = normalizeRole(localStorage.getItem(USER_ROLE_KEY))
      const storedEmail = localStorage.getItem(USER_EMAIL_KEY)

      // Initialize Telegram WebApp SDK if available
      const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
      const isTg = !!(tg && tg.initData)
      setIsTelegramWebApp(isTg)

      if (tg) {
        try {
          tg.ready()
          tg.expand()
          if (tg.initDataUnsafe?.user) {
            setTelegramUser(tg.initDataUnsafe.user)
          }
        } catch (e) {
          console.error('Error initializing Telegram WebApp SDK', e)
        }
      }

      if (storedAccess && storedRefresh && storedRole) {
        setAccessToken(storedAccess)
        setRefreshToken(storedRefresh)
        setRole(storedRole)
        setUser({
          email: storedEmail || '',
          role: storedRole,
        })
        setIsLoading(false)
        return
      }

      // If opened in Telegram Mini App without stored tokens, attempt auto-login
      if (isTg && tg.initData) {
        try {
          const startParam = tg.initDataUnsafe?.start_param
          const res = await authApi.loginWithTelegramWebApp({
            initData: tg.initData,
            linkCode: startParam,
          })
          handleAuthSuccess(res, `tg_${tg.initDataUnsafe?.user?.id || 'student'}`)
        } catch (err) {
          console.log('Telegram auto-login not yet linked or requires link code', err)
          setTelegramLinkRequired(true)
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await authApi.login({ email, password })
    handleAuthSuccess(res, email)
    return res
  }

  const loginWithTelegram = async (linkCode?: string): Promise<AuthResponse> => {
    const tg = window.Telegram?.WebApp
    if (!tg?.initData) {
      throw new Error('Данные Telegram WebApp не найдены')
    }
    const res = await authApi.loginWithTelegramWebApp({
      initData: tg.initData,
      linkCode,
    })
    handleAuthSuccess(res, `tg_${tg.initDataUnsafe?.user?.id || 'student'}`)
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
    setTelegramLinkRequired(false)
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
        isTelegramWebApp,
        telegramUser,
        telegramLinkRequired,
        login,
        loginWithTelegram,
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
