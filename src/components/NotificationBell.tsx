import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import NotificationIcon from './NotificationIcon'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  read_at: string | null
  created_at: string
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Charge le compteur toutes les 30 secondes
  useEffect(() => {
    async function fetchCount() {
      try {
        const { data } = await api.get('/notifications/unread-count')
        setUnread(data.count)
      } catch {}
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Charge les notifs à l'ouverture du dropdown
  useEffect(() => {
    if (!open) return

    async function fetchNotifications() {
      try {
        const { data } = await api.get('/notifications')
        setNotifications(data.data.slice(0, 5))
      } catch {}
    }
    fetchNotifications()
  }, [open])

  // Fermer au clic en dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all')
      setUnread(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
    } catch {}
  }

  function timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours} h`
    const days = Math.floor(hours / 24)
    return `Il y a ${days} j`
  }

 

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-pierre-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-pierre-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-alerte text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-pierre-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-[fade-down_0.2s_ease-out]">

          {/* Header */}
          <div className="px-4 py-3 border-b border-pierre-100 flex items-center justify-between">
            <p className="font-serif text-base text-noir">Notifications</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] uppercase tracking-[0.15em] text-pierre-500 hover:text-noir transition font-medium"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-pierre-400">
                Aucune notification
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-pierre-50 last:border-0 ${
                    !n.read_at ? 'bg-ivoire/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="shrink-0">
                      <NotificationIcon type={n.type} className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-noir leading-snug">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-pierre-500 mt-0.5 leading-relaxed line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <p className="text-[10px] text-pierre-400 mt-1.5 uppercase tracking-wider">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-pierre-100 text-center">
            <button
              onClick={() => {
                setOpen(false)
                navigate('/dashboard/notifications')
              }}
              className="text-[10px] uppercase tracking-[0.15em] text-pierre-500 hover:text-noir transition font-medium"
            >
              Voir toutes les notifications →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}