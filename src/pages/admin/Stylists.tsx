import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import AdminLayout from '../../components/AdminLayout'
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
  status: string
  created_at: string
  shop: Shop | null
}

export default function Stylists() {
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState('')

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

  useEffect(() => { load() /* eslint-disable-next-line */ }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load()
  }

  async function toggleStatus(stylist: Stylist) {
    const action = stylist.status === 'active' ? 'suspend' : 'activate'
    const verb = action === 'suspend' ? 'suspendre' : 'réactiver'
    if (!confirm(`Voulez-vous ${verb} ${stylist.first_name} ${stylist.last_name} ?`)) return

    try {
      await api.patch(`/admin/stylists/${stylist.id}/${action}`)
      setSuccess(`Compte ${action === 'suspend' ? 'suspendu' : 'réactivé'}.`)
      await load()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      alert('Erreur lors de la modification')
    }
  }

  return (
    <AdminLayout
      title="Stylistes"
      subtitle={`${stylists.length} compte${stylists.length > 1 ? 's' : ''}`}
    >
      <div className="space-y-6">

        {/* Recherche */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-pierre-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="input-field pl-11"
            />
          </div>
          <button type="submit" className="btn-primary text-sm">Rechercher</button>
        </form>

        {success && (
          <div className="p-4 rounded-[10px] bg-succes-soft border border-succes/20 text-succes text-sm">
            ✅ {success}
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : stylists.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-pierre-500">Aucun styliste trouvé.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="divide-y divide-pierre-100">
              {stylists.map((s) => (
                <div key={s.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-beige-soft flex items-center justify-center shrink-0">
                    <span className="font-display text-lg text-brun">
                      {s.first_name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-noir">
                        {s.first_name} {s.last_name}
                      </p>
                      {s.status === 'active' ? (
                        <span className="badge badge-succes text-[10px] py-0.5">Actif</span>
                      ) : (
                        <span className="badge badge-alerte text-[10px] py-0.5">Suspendu</span>
                      )}
                    </div>
                    <p className="text-sm text-pierre-500 truncate">{s.email}</p>
                    {s.shop ? (
                      <p className="text-xs text-pierre-400 mt-0.5">
                        Boutique : <span className="font-medium">{s.shop.name}</span> · {s.shop.status}
                      </p>
                    ) : (
                      <p className="text-xs text-pierre-400 mt-0.5 italic">
                        Aucune boutique créée
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStatus(s)}
                    className={`text-xs px-4 py-2 rounded-lg font-medium transition shrink-0 ${
                      s.status === 'active'
                        ? 'bg-alerte-soft text-alerte hover:opacity-80'
                        : 'bg-succes-soft text-succes hover:opacity-80'
                    }`}
                  >
                    {s.status === 'active' ? 'Suspendre' : 'Réactiver'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}