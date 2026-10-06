import { ReactNode, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export default function DashboardLayout({ children, title, subtitle, actions }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Tableau de bord', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/dashboard/models', label: 'Mes créations', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { to: '/dashboard/shop', label: 'Ma boutique', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  ]

  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* ============ SIDEBAR DESKTOP ============ */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col bg-noir text-blanc-casse/90 z-30">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blanc-casse flex items-center justify-center">
              <span className="font-serif text-xl text-noir leading-none pt-0.5">S</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blanc-casse">SaaS Stylistes</p>
              <p className="text-[10px] uppercase tracking-widest text-blanc-casse/40">
                Studio
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
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-white/10 text-blanc-casse font-medium'
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

        {/* Bouton Voir ma boutique */}
        {user?.role === 'stylist' && (
          <div className="px-3 pb-3">
            <Link
              to="/dashboard/shop"
              className="block w-full text-center text-xs font-medium text-blanc-casse/80 bg-white/5 hover:bg-white/10 rounded-lg py-2.5 transition"
            >
              Voir ma boutique →
            </Link>
          </div>
        )}

        {/* Admin */}
        {user?.role === 'admin' && (
          <div className="px-3 pb-3">
            <Link
              to="/admin"
              className="block w-full text-center text-xs font-medium text-dore bg-dore/10 hover:bg-dore/20 rounded-lg py-2.5 transition"
            >
              Administration
            </Link>
          </div>
        )}

        {/* Profil */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-beige/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-beige">
                {user?.first_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blanc-casse truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[11px] text-blanc-casse/40 truncate">
                {user?.email}
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
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-pierre-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-noir"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-noir flex items-center justify-center">
              <span className="font-serif text-lg text-blanc-casse leading-none pt-0.5">S</span>
            </div>
          </Link>
          <div className="w-8" />
        </div>
      </header>

      {/* ============ MENU MOBILE OVERLAY ============ */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-72 bg-noir text-blanc-casse flex flex-col">
            <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm font-medium">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-blanc-casse/60">
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
                end={item.to === '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-white/10 text-blanc-casse font-medium'
                      : 'text-blanc-casse/60 hover:text-blanc-casse hover:bg-white/5'
                  }`
                }
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Lien Admin (visible uniquement pour les admins) */}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all text-[#B08D57] hover:bg-[#B08D57]/10 mt-3 border-t border-white/5 pt-4"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium">Administration</span>
              </NavLink>
            )}
          </nav>
            <div className="px-3 py-4 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full text-xs text-blanc-casse/50 hover:text-blanc-casse px-3 py-2 text-left"
              >
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ============ MAIN CONTENT ============ */}
      <div className="lg:pl-64">
        {/* Page header (optionnel) */}
        {(title || actions) && (
          <header className="bg-white border-b border-pierre-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="font-display text-3xl text-noir">{title}</h1>
                  )}
                  {subtitle && (
                    <p className="text-pierre-500 text-sm mt-1">{subtitle}</p>
                  )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            </div>
          </header>
        )}

        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}