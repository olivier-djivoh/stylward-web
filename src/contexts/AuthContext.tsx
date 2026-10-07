import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '../lib/api'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  role: string
  status: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{
  pendingDeletion: boolean
  deletionDueAt: string | null
  daysUntilDeletion: number | null
} | void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

interface RegisterData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  password: string
  password_confirmation: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Au démarrage, on vérifie que le token est encore valide
  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get<User>('/me')
        setUser(data)
        localStorage.setItem('user', JSON.stringify(data))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(email: string, password: string) {
  const { data } = await api.post('/login', { email, password })
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  setToken(data.token)
  setUser(data.user)

  return {
    pendingDeletion: data.pending_deletion ?? false,
    deletionDueAt: data.deletion_due_at ?? null,
    daysUntilDeletion: data.days_until_deletion ?? null,
  }
}

  async function register(formData: RegisterData) {
    const { data } = await api.post('/register', formData)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // Ignore
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}