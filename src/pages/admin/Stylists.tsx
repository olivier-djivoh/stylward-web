import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import Spinner from '../../components/Spinner'

interface Shop {
  id: string
  name: string
  slug: string
  status: string
}

interface Stylist {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  status: string
  created_at: string
  shop: Shop | null
}

export default function Stylists() {
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      const { data } = await api.get(`/admin/stylists${params}`)
      setStylists(data.data)
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

  async function toggleStatus(stylist: Stylist) {
    const action = stylist.status === 'active' ? 'suspend' : 'activate'
    const verb = action === 'suspend' ? 'suspendre' : 'réactiver'

    if (!confirm(`Voulez-vous ${verb} le compte de ${stylist.first_name} ${stylist.last_name} ?`)) {
      return
    }

    setError('')
    setSuccess('')
    try {
      await api.patch(`/admin/stylists/${stylist.id}/${action}`)
      setSuccess(
        `Compte ${action === 'suspend' ? 'suspendu' : 'réactivé'} : ${stylist.first_name} ${stylist.last_name}`
      )
      await load()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Erreur lors de la modification')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin" className="text-neutral-500 hover:text-neutral-900">
            ← Admin
          </Link>
          <h1 className="text-lg font-bold text-neutral-900">Stylistes</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Recherche */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
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
              {stylists.length} styliste{stylists.length > 1 ? 's' : ''}
            </h2>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <Spinner label="Chargement..." />
            </div>
          ) : stylists.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              Aucun styliste trouvé.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {stylists.map((s) => (
                <div key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-neutral-900">
                        {s.first_name} {s.last_name}
                      </p>
                      {s.status === 'suspended' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Suspendu
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 truncate">{s.email}</p>
                    {s.shop && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Boutique : {s.shop.name} ({s.shop.status})
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStatus(s)}
                    className={`text-xs px-3 py-1.5 rounded shrink-0 ${
                      s.status === 'active'
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {s.status === 'active' ? 'Suspendre' : 'Réactiver'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}