import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

interface Stats {
  stylists: number
  shops: number
  models: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ stylists: 0, shops: 0, models: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [stylists, shops] = await Promise.all([
          api.get('/admin/stylists'),
          api.get('/admin/shops'),
        ])
        // Total approximatif (les deux endpoints sont paginés)
        const totalModels = shops.data.data.reduce(
          (sum: number, s: any) => sum + (s.models_count || 0),
          0
        )
        setStats({
          stylists: stylists.data.total ?? stylists.data.data.length,
          shops: shops.data.total ?? shops.data.data.length,
          models: totalModels,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/dashboard" className="text-neutral-500 hover:text-neutral-900">
            ← Retour
          </Link>
          <h1 className="text-lg font-bold text-neutral-900">Administration</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-sm text-neutral-500 mb-1">Stylistes</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.stylists}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-neutral-500 mb-1">Boutiques</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.shops}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-neutral-500 mb-1">Modèles publiés</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.models}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/categories"
            className="card hover:shadow-md transition cursor-pointer"
          >
            <h3 className="font-bold text-neutral-900 mb-1">Catégories</h3>
            <p className="text-sm text-neutral-500">
              Gérer les catégories de modèles
            </p>
          </Link>

          <Link
            to="/admin/stylists"
            className="card hover:shadow-md transition cursor-pointer"
          >
            <h3 className="font-bold text-neutral-900 mb-1">Stylistes</h3>
            <p className="text-sm text-neutral-500">
              Voir et gérer les comptes stylistes
            </p>
          </Link>

          <Link
            to="/admin/shops"
            className="card hover:shadow-md transition cursor-pointer"
          >
            <h3 className="font-bold text-neutral-900 mb-1">Boutiques</h3>
            <p className="text-sm text-neutral-500">
              Voir et gérer les boutiques
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}