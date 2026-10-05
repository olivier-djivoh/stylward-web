import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

interface Shop {
  id: string
  name: string
  slug: string
  status: string
  models_count: number
  created_at: string
  user: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function AdminShops() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      const { data } = await api.get(`/admin/shops${params}`)
      setShops(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load()
  }

  async function toggleStatus(shop: Shop) {
    const action = shop.status === 'active' ? 'suspend' : 'activate'
    const verb = action === 'suspend' ? 'suspendre' : 'réactiver'

    if (!confirm(`Voulez-vous ${verb} la boutique "${shop.name}" ?`)) {
      return
    }

    setError('')
    setSuccess('')
    try {
      await api.patch(`/admin/shops/${shop.id}/${action}`)
      setSuccess(
        `Boutique ${action === 'suspend' ? 'suspendue' : 'réactivée'} : ${shop.name}`
      )
      await load()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Erreur lors de la modification')
    }
  }

  function statusLabel(status: string) {
    switch (status) {
      case 'active':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
      case 'suspended':
        return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Suspendue</span>
      default:
        return <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">Brouillon</span>
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin" className="text-neutral-500 hover:text-neutral-900">
            ← Admin
          </Link>
          <h1 className="text-lg font-bold text-neutral-900">Boutiques</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou slug..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary text-sm py-2 px-6">
            Rechercher
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            ✅ {success}
          </div>
        )}

        <div className="card">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900">
              {shops.length} boutique{shops.length > 1 ? 's' : ''}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8 text-neutral-500">Chargement...</div>
          ) : shops.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              Aucune boutique trouvée.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {shops.map((s) => (
                <div key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-neutral-900">{s.name}</p>
                      {statusLabel(s.status)}
                    </div>
                    <p className="text-sm text-neutral-500 font-mono truncate">
                      /shops/{s.slug}
                    </p>
                    {s.user && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Par {s.user.first_name} {s.user.last_name} ({s.user.email})
                      </p>
                    )}
                    <p className="text-xs text-neutral-400">
                      {s.models_count} modèle{s.models_count > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/shops/${s.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-600 hover:text-neutral-900 underline"
                    >
                      Voir
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleStatus(s)}
                      className={`text-xs px-3 py-1.5 rounded ${
                        s.status === 'active'
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {s.status === 'active' ? 'Suspendre' : 'Activer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}