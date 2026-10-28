import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import Spinner from '../components/Spinner'
import { emitNotificationsChanged } from '../lib/notifications'
import NotificationsSkeleton from '../components/skeletons/NotificationsSkeleton'
import NotificationIcon from '../components/NotificationIcon'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  read_at: string | null
  created_at: string
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function markAllRead() {
  await api.patch('/notifications/read-all')
  emitNotificationsChanged()
  await load()
}

async function handleRead(n: Notification) {
  if (n.read_at) return
  await api.patch(`/notifications/${n.id}/read`)
  emitNotificationsChanged()
  setNotifications((prev) =>
    prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x))
  )
}

async function handleDelete(id: string) {
  if (!confirm('Supprimer cette notification ?')) return
  await api.delete(`/notifications/${id}`)
  emitNotificationsChanged()
  setNotifications((prev) => prev.filter((x) => x.id !== id))
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
    <DashboardLayout
      title="Notifications"
      subtitle={`${notifications.filter((n) => !n.read_at).length} non lue${notifications.filter((n) => !n.read_at).length > 1 ? 's' : ''}`}
      actions={
        notifications.some((n) => !n.read_at) ? (
          <button onClick={markAllRead} className="btn-secondary text-sm">
            Tout marquer lu
          </button>
        ) : undefined
      }
    >
      {loading ? (
        <NotificationsSkeleton count={6} />
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <p className="font-serif text-2xl text-noir mb-2">Aucune notification</p>
          <p className="text-pierre-500 text-sm">
            Les nouvelles visites et commandes apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-pierre-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleRead(n)}
                className={`p-4 flex gap-4 cursor-pointer hover:bg-pierre-50 transition ${
                  !n.read_at ? 'bg-ivoire/40' : ''
                }`}
              >
                  <span className="shrink-0">
                    <NotificationIcon type={n.type} className="w-6 h-6" />
                  </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-noir leading-snug">
                      {n.title}
                      {!n.read_at && (
                        <span className="inline-block w-2 h-2 ml-2 bg-dore rounded-full align-middle" />
                      )}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(n.id)
                      }}
                      className="text-pierre-400 hover:text-alerte transition shrink-0"
                      aria-label="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {n.body && (
                    <p className="text-sm text-pierre-600 mt-1 leading-relaxed">
                      {n.body}
                    </p>
                  )}
                  <p className="text-[10px] text-pierre-400 mt-2 uppercase tracking-wider">
                    {timeAgo(n.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}