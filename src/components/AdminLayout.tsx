import { ReactNode, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export default function AdminLayout({ children, title, subtitle, actions }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/admin', label: 'Vue d\'ensemble', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/admin/stylists', label: 'Stylistes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { to: '/admin/shops', label: 'Boutiques', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { to: '/admin/categories', label: 'Catégories', icon: 'M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  ]

  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* ============ SIDEBAR ADMIN ============ */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col bg-pierre-900 text-blanc-casse/90 z-30">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-dore flex items-center justify-center">
              <svg className="w-4 h-4 text-pierre-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blanc-casse">Administration</p>
              <p className="text-[10px] uppercase tracking-widest text-blanc-casse/40">
                SaaS Stylistes
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-dore/10 text-dore font-medium'
                    : 'text-blanc-casse/60 hover:text-blanc-casse hover:bg-white/5'
                }`
              }
            >
              <svg
                className="w-[18px] h-[18px] shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Retour au dashboard styliste */}
        <div className="px-3 pb-3">
          <Link
            to="/dashboard"
            className="block w-full text-center text-xs font-medium text-blanc-casse/70 bg-white/5 hover:bg-white/10 rounded-lg py-2.5 transition"
          >
            ← Retour au studio
          </Link>
        </div>

        {/* Profil */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-dore/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-dore">
                {user?.first_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blanc-casse truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[11px] text-dore/70 truncate">
                Administrateur
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 text-xs text-blanc-casse/50 hover:text-blanc-casse px-3 py-2 text-left transition"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ============ HEADER MOBILE ============ */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#1C1917] text-white border-b border-white/5">
  <div className="flex items-center justify-between px-4 py-3">
    <button
      onClick={() => setMobileMenuOpen(true)}
      className="p-2 -ml-2 text-white"
      aria-label="Ouvrir le menu"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <Link to="/admin" className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#B08D57] flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-[#1C1917]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white leading-tight">
          Administration
        </span>
        <span className="text-[10px] uppercase tracking-widest text-[#B08D57] mt-0.5">
          SaaS Stylistes
        </span>
      </div>
    </Link>

    <div className="w-6" />
  </div>
</header>

      {/* ============ MENU MOBILE ============ */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-72 bg-[#1C1917] text-white flex flex-col">
  <div className="px-5 py-5 border-b border-white/5 flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#B08D57] flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-[#1C1917]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white leading-tight">
          Administration
        </span>
        <span className="text-[10px] uppercase tracking-widest text-[#B08D57] mt-0.5">
          SaaS Stylistes
        </span>
      </div>
    </div>
    <button
      onClick={() => setMobileMenuOpen(false)}
      className="p-1.5 text-white/60 hover:text-white transition"
      aria-label="Fermer"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <nav className="flex-1 px-3 py-6 space-y-1">
    {navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/admin'}
        onClick={() => setMobileMenuOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${
            isActive
              ? 'bg-[#B08D57]/10 text-[#B08D57] font-medium'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`
        }
      >
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path d={item.icon} />
        </svg>
        <span>{item.label}</span>
      </NavLink>
    ))}
  </nav>
</aside>
        </div>
      )}

      {/* ============ CONTENU ============ */}
      <div className="lg:pl-64 w-full min-w-0">
        {(title || actions) && (
          <header className="bg-white border-b border-pierre-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {title && <h1 className="font-display text-3xl text-noir">{title}</h1>}
                  {subtitle && <p className="text-pierre-500 text-sm mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            </div>
          </header>
        )}

        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}