import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import ImageUploader from '../components/ImageUploader'
import ShopImageUploader from '../components/ShopImageUploader'
import Spinner from '../components/Spinner'

interface Shop {
  id: string
  name: string
  slug: string
  description: string | null
  whatsapp: string | null
  status: string
  logo_path: string | null      // ← ajouté
  cover_path: string | null  
}

interface Model {
  id: string
  name: string
  slug: string
  price: string | null
  currency: string
  status: string
  images: { id: string; path: string }[]
}

interface ShopStats {
  views: {
    this_week: number
    last_week: number
    total: number
    evolution: number | null
  }
  visitors: {
    this_week: number
    last_week: number
    total: number
    evolution: number | null
  }
  whatsapp_clicks: {
    this_week: number
    last_week: number
    evolution: number | null
  }
  top_models: { id: string; name: string; views: number; visitors: number }[]
  daily_views: { date: string; label: string; count: number }[]
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [shop, setShop] = useState<Shop | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ShopStats | null>(null)

  useEffect(() => {
  async function load() {
    try {
      const shopRes = await api.get('/shop').catch(() => ({ data: null }))
      setShop(shopRes.data)

      if (shopRes.data) {
        const [modelsRes, statsRes] = await Promise.all([
          api.get('/models').catch(() => ({ data: { data: [] } })),
          api.get('/shop/stats').catch(() => ({ data: null })),
        ])
        setModels(modelsRes.data.data || [])
        setStats(statsRes.data)
      }
    } finally {
      setLoading(false)
    }
  }
  load()
}, [])

  function handleImageUploaded(modelId: string, image: { id: string; path: string; type: string }) {
  setModels((prev) =>
    prev.map((m) =>
      m.id === modelId
        ? { ...m, images: [{ id: image.id, path: image.path }, ...m.images] }
        : m
    )
  )
 }

 async function handlePublish(modelId: string) {
  try {
    await api.patch(`/models/${modelId}/publish`)
    setModels((prev) =>
      prev.map((m) =>
        m.id === modelId ? { ...m, status: 'published' } : m
      )
    )
  } catch {
    alert('Erreur lors de la publication')
  }
}

async function handleUnpublish(modelId: string) {
  try {
    await api.patch(`/models/${modelId}/unpublish`)
    setModels((prev) =>
      prev.map((m) =>
        m.id === modelId ? { ...m, status: 'draft' } : m
      )
    )
  } catch {
    alert('Erreur lors de la dépublication')
  }
}

async function handleActivate() {
  try {
    const { data } = await api.patch('/shop/activate')
    setShop(data)
  } catch {
    alert('Erreur lors de l\'activation')
  }
}

function handleShopImageUpdated(field: 'logo_path' | 'cover_path', path: string) {
  setShop((prev) => (prev ? { ...prev, [field]: path } : prev))
}

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (loading) {
  return <Spinner fullScreen label="Chargement..." />
}

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">SaaS Stylistes</h1>
            <p className="text-xs text-neutral-500">
              Bonjour {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div className="flex items-center">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition mr-4"
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Boutique */}
        <section className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Ma boutique</h2>
              <p className="text-sm text-neutral-500">
                {shop ? `Statut : ${shop.status}` : 'Aucune boutique créée'}
              </p>
            </div>
          </div>

          {shop ? (
            <div className="space-y-3">
              <div>
                <p className="text-lg font-medium text-neutral-900">{shop.name}</p>
                {shop.description && (
                  <p className="text-sm text-neutral-600 mt-1">{shop.description}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-neutral-100">
                <div className="flex-1">
                  <p className="text-sm text-neutral-500 mb-1">Lien public :</p>
                  <a
                    href={`/shops/${shop.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-neutral-900 text-sm hover:underline"
                  >
                    /shops/{shop.slug}
                  </a>
                </div>
                {shop.status === 'active' ? (
                  <a
                    href={`/shops/${shop.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Voir la boutique
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleActivate}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Activer la boutique
                  </button>
                )}
              </div>
                            {/* Personnalisation */}
              <div className="pt-4 border-t border-neutral-100 space-y-4">
                <h3 className="text-sm font-bold text-neutral-900">
                  Personnalisation
                </h3>

                <ShopImageUploader
                  type="logo"
                  currentUrl={shop.logo_path}
                  onUploaded={(path) => handleShopImageUpdated('logo_path', path)}
                  label="Logo"
                  hint="Format carré recommandé (ex: 400×400)."
                />

                <ShopImageUploader
                  type="cover"
                  currentUrl={shop.cover_path}
                  onUploaded={(path) => handleShopImageUpdated('cover_path', path)}
                  label="Photo de couverture"
                  hint="Format paysage recommandé (ex: 1200×600)."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-neutral-500">
                Vous n'avez pas encore créé votre boutique. Créez-la pour commencer
                à ajouter vos modèles.
              </p>
              <Link
                to="/dashboard/shop/new"
                className="btn-primary inline-block text-sm py-2 px-4"
              >
                + Créer ma boutique
              </Link>
            </div>
          )}
        </section>

        {/* Statistiques */}
{/* Statistiques */}
{shop && stats && (
  <section className="card">
    <h2 className="text-xl font-bold text-neutral-900 mb-4">
      Statistiques
    </h2>

    {/* Chiffres clés */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {/* Vues cette semaine */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <p className="text-xs text-neutral-500 mb-1">Vues cette semaine</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-neutral-900">
            {stats.views.this_week}
          </p>
          {stats.views.evolution !== null && (
            <span
              className={`text-xs font-medium ${
                stats.views.evolution >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.views.evolution >= 0 ? '+' : ''}{stats.views.evolution}%
            </span>
          )}
        </div>
      </div>

      {/* Spectateurs uniques */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <p className="text-xs text-neutral-500 mb-1">Spectateurs uniques</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-neutral-900">
            {stats.visitors.total}
          </p>
          {stats.visitors.evolution !== null && (
            <span
              className={`text-xs font-medium ${
                stats.visitors.evolution >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.visitors.evolution >= 0 ? '+' : ''}{stats.visitors.evolution}%
            </span>
          )}
        </div>
      </div>

      {/* Clics WhatsApp */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <p className="text-xs text-neutral-500 mb-1">Clics WhatsApp</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-neutral-900">
            {stats.whatsapp_clicks.this_week}
          </p>
          {stats.whatsapp_clicks.evolution !== null && (
            <span
              className={`text-xs font-medium ${
                stats.whatsapp_clicks.evolution >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {stats.whatsapp_clicks.evolution >= 0 ? '+' : ''}
              {stats.whatsapp_clicks.evolution}%
            </span>
          )}
        </div>
      </div>

      {/* Vues totales */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <p className="text-xs text-neutral-500 mb-1">Vues totales</p>
        <p className="text-2xl font-bold text-neutral-900">
          {stats.views.total}
        </p>
      </div>
    </div>

    {/* Graphique 7 jours */}
    {stats.daily_views.length > 0 && (
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
          7 derniers jours
        </p>
        <div className="flex items-end justify-between gap-2 h-24">
          {stats.daily_views.map((day) => {
            const max = Math.max(...stats.daily_views.map((d) => d.count), 1)
            const height = (day.count / max) * 100
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-neutral-400">
                  {day.count > 0 ? day.count : ''}
                </span>
                <div
                  className="w-full bg-neutral-900 rounded-t transition-all"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className="text-[10px] text-neutral-500 capitalize">
                  {day.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )}

    {/* Top modèles */}
    {stats.top_models.length > 0 && (
  <div>
    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
      Top modèles vus
    </p>
    <ul className="divide-y divide-neutral-100">
      {stats.top_models.map((m, i) => (
        <li
          key={m.id}
          className="flex items-center justify-between gap-3 py-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs text-neutral-400 font-mono w-5 shrink-0">
              #{i + 1}
            </span>
            <span className="text-neutral-900 text-sm font-medium truncate">
              {m.name}
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0 text-xs">
            <div className="text-right">
              <p className="font-semibold text-neutral-900">
                {m.views}
              </p>
              <p className="text-neutral-400 text-[10px] uppercase tracking-wider">
                vue{m.views > 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-neutral-900">
                {m.visitors}
              </p>
              <p className="text-neutral-400 text-[10px] uppercase tracking-wider">
                spectateur{m.visitors > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
)}

    {/* État vide */}
    {stats.views.total === 0 && (
      <p className="text-sm text-neutral-500 text-center py-4">
        Aucune visite pour le moment. Partagez le lien de votre boutique pour
        commencer à voir les statistiques.
      </p>
    )}
  </section>
)}

        {/* Modèles */}
        {shop && (
          <section className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Mes modèles</h2>
              <p className="text-sm text-neutral-500">
                {models.length} modèle{models.length > 1 ? 's' : ''}
              </p>
            </div>
            <Link
              to="/dashboard/models/new"
              className="btn-primary text-sm py-2 px-4"
            >
              + Nouveau modèle
            </Link>
          </div>

            {models.length === 0 ? (
              <p className="text-neutral-500">Aucun modèle pour l'instant.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="border border-neutral-200 rounded-lg overflow-hidden bg-white"
                  >
                    <div className="aspect-square bg-neutral-100 flex items-center justify-center">
                      {model.images?.[0] ? (
                        <img
                          src={`/storage/${model.images[0].path}`}
                          alt={model.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-neutral-400 text-xs">Sans image</span>
                      )}
                    </div>
                    <div className="p-2 space-y-2">
                      <div>
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {model.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {model.status === 'published' ? '✅ Publié' : '📝 Brouillon'}
                        </p>
                      </div>

                      <ImageUploader
                        modelId={model.id}
                        onUploaded={(image) => handleImageUploaded(model.id, image)}
                      />

                      {model.status === 'published' ? (
                        <button
                          type="button"
                          onClick={() => handleUnpublish(model.id)}
                          className="w-full text-xs text-neutral-600 hover:text-neutral-900 underline"
                        >
                          Dépublier
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePublish(model.id)}
                          className="w-full text-xs bg-neutral-900 hover:bg-neutral-800 text-white py-1.5 px-3 rounded"
                        >
                          Publier
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  )
}