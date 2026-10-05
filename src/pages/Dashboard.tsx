import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import ImageUploader from '../components/ImageUploader'

interface Shop {
  id: string
  name: string
  slug: string
  description: string | null
  whatsapp: string | null
  status: string
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

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [shop, setShop] = useState<Shop | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const shopRes = await api.get('/shop').catch(() => ({ data: null }))
        setShop(shopRes.data)

        const modelsRes = await api.get('/models').catch(() => ({ data: { data: [] } }))
        setModels(modelsRes.data.data || [])
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

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Chargement...</div>
      </div>
    )
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