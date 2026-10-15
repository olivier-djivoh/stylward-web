import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import { useNavigate } from 'react-router-dom'
import AdminListSkeleton from '../../components/skeletons/AdminListSkeleton'

interface Archive {
  id: string
  email_hash: string
  shop_name: string | null
  shop_slug: string | null
  shop_views_total: number
  shop_visitors_total: number
  shop_whatsapp_clicks: number
  models_count: number
  published_models_count: number
  deletion_reason: string | null
  deletion_reason_detail: string | null
  registered_at: string | null
  deletion_requested_at: string | null
  deleted_at: string
}

interface Stats {
  total: number
  by_reason: { reason: string; label: string; count: number }[]
  averages: {
    avg_models: number
    avg_views: number
    avg_visitors: number
    avg_whatsapp: number
  }
  by_month: { month: string; count: number }[]
}

export default function AdminArchives() {
  const [archives, setArchives] = useState<Archive[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [archivesRes, statsRes] = await Promise.all([
          api.get('/admin/archives'),
          api.get('/admin/archives/stats'),
        ])
        setArchives(archivesRes.data.data)
        setStats(statsRes.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
  return (
    <AdminLayout>
      <AdminListSkeleton count={5} />
    </AdminLayout>
  )
}

  async function handleClear() {
  if (!confirm('Vider toute l\'archive ? Cette action est irréversible.')) return
  setClearing(true)
  try {
    await api.delete('/admin/archives')
    window.location.reload()
  } catch {
    alert('Erreur')
    setClearing(false)
  }
}

  return (
    <AdminLayout
        title="Archives"
        subtitle="Comptes supprimés — données anonymisées"
        actions={
          archives.length > 0 ? (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="text-xs font-medium text-alerte border border-alerte/30 hover:bg-alerte-soft rounded-[10px] py-2 px-4 transition disabled:opacity-50"
            >
              {clearing ? 'Suppression...' : 'Vider l\'archive'}
            </button>
          ) : undefined
        }
      >
      <div className="space-y-8">

        {/* ═══ STATS GLOBALES ═══ */}
        {stats && stats.total > 0 && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <p className="font-overline text-pierre-500 mb-2">Départs totaux</p>
                <p className="text-4xl font-display text-noir">{stats.total}</p>
              </div>
              <div className="card">
                <p className="font-overline text-pierre-500 mb-2">Modèles moyens</p>
                <p className="text-4xl font-display text-noir">
                  {stats.averages.avg_models}
                </p>
              </div>
              <div className="card">
                <p className="font-overline text-pierre-500 mb-2">Vues moyennes</p>
                <p className="text-4xl font-display text-noir">
                  {stats.averages.avg_views}
                </p>
              </div>
              <div className="card">
                <p className="font-overline text-pierre-500 mb-2">Clics WhatsApp</p>
                <p className="text-4xl font-display text-noir">
                  {stats.averages.avg_whatsapp}
                </p>
              </div>
            </div>

            {/* Motifs de départ */}
            {stats.by_reason.length > 0 && (
              <div className="card">
                <p className="font-overline text-pierre-500 mb-5">Motifs de départ</p>
                <div className="space-y-3">
                  {stats.by_reason.map((r) => {
                    const pct = Math.round((r.count / stats.total) * 100)
                    return (
                      <div key={r.reason}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-noir">{r.label}</span>
                          <span className="text-xs text-pierre-500 font-medium">
                            {r.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 bg-pierre-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-noir rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ LISTE DES ARCHIVES ═══ */}
        <div>
          <p className="font-overline text-pierre-500 mb-4">Historique</p>

          {archives.length === 0 ? (
            <div className="card text-center py-16">
              <p className="font-serif text-xl text-noir mb-2">
                Aucune archive
              </p>
              <p className="text-pierre-500 text-sm">
                Les comptes supprimés apparaîtront ici après la période de rétention de 30 jours.
              </p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="divide-y divide-pierre-100">
                {archives.map((a) => (
                  <div key={a.id} className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                      {/* Boutique */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-noir truncate">
                          {a.shop_name || 'Sans nom'}
                        </p>
                        <p className="text-xs text-pierre-400 font-mono truncate">
                          /shops/{a.shop_slug || '—'}
                        </p>
                        <p className="text-[10px] text-pierre-400 mt-1 font-mono">
                          Hash : {a.email_hash.substring(0, 16)}...
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-3 shrink-0">
                        <div className="text-center">
                          <p className="text-lg font-medium text-noir">
                            {a.models_count}
                          </p>
                          <p className="text-[9px] uppercase tracking-wider text-pierre-400">
                            Modèles
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-medium text-noir">
                            {a.shop_views_total}
                          </p>
                          <p className="text-[9px] uppercase tracking-wider text-pierre-400">
                            Vues
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-medium text-noir">
                            {a.shop_visitors_total}
                          </p>
                          <p className="text-[9px] uppercase tracking-wider text-pierre-400">
                            Visiteurs
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-medium text-noir">
                            {a.shop_whatsapp_clicks}
                          </p>
                          <p className="text-[9px] uppercase tracking-wider text-pierre-400">
                            WhatsApp
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Motif + date */}
                    <div className="mt-3 pt-3 border-t border-pierre-100 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                      {a.deletion_reason && (
                        <span className="text-pierre-500">
                          Motif : <span className="text-noir">
                            {a.deletion_reason.replace(/_/g, ' ')}
                          </span>
                        </span>
                      )}
                      <span className="text-pierre-400">
                        Supprimé le{' '}
                        {new Date(a.deleted_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}