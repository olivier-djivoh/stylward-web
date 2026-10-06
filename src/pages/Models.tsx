import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import Spinner from '../components/Spinner'
import ImageUploader from '../components/ImageUploader'

interface Model {
  id: string
  name: string
  slug: string
  price: string | null
  currency: string
  color: string | null
  status: string
  category: { id: string; name: string } | null
  images: { id: string; path: string }[]
}

type Filter = 'all' | 'published' | 'draft'

export default function Models() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  async function load() {
    try {
      const { data } = await api.get('/models')
      setModels(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function handleImageUploaded(modelId: string, image: { id: string; path: string }) {
    setModels((prev) =>
      prev.map((m) =>
        m.id === modelId ? { ...m, images: [image, ...m.images] } : m
      )
    )
  }

  async function handlePublish(modelId: string) {
    await api.patch(`/models/${modelId}/publish`)
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, status: 'published' } : m))
    )
  }

  async function handleUnpublish(modelId: string) {
    await api.patch(`/models/${modelId}/unpublish`)
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, status: 'draft' } : m))
    )
  }

  async function handleDelete(modelId: string, name: string) {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return
    try {
      await api.delete(`/models/${modelId}`)
      setModels((prev) => prev.filter((m) => m.id !== modelId))
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const filtered = models
    .filter((m) => {
      if (filter === 'published') return m.status === 'published'
      if (filter === 'draft') return m.status !== 'published'
      return true
    })
    .filter((m) =>
      search ? m.name.toLowerCase().includes(search.toLowerCase()) : true
    )

  const counts = {
    all: models.length,
    published: models.filter((m) => m.status === 'published').length,
    draft: models.filter((m) => m.status !== 'published').length,
  }

  return (
    <DashboardLayout
      title="Mes créations"
      subtitle={`${counts.all} création${counts.all > 1 ? 's' : ''} au total`}
      actions={
        <Link to="/dashboard/models/new" className="btn-primary text-sm">
          + Nouvelle création
        </Link>
      }
    >
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner label="Chargement..." />
        </div>
      ) : models.length === 0 ? (
        <div className="card text-center py-16">
          <p className="font-display text-2xl text-noir mb-2">
            Votre catalogue est vide
          </p>
          <p className="text-pierre-500 text-sm mb-6 max-w-md mx-auto">
            Ajoutez votre première création pour commencer à construire votre
            vitrine.
          </p>
          <Link to="/dashboard/models/new" className="btn-primary">
            Ajouter ma première création
          </Link>
        </div>
      ) : (
        <>
          {/* Barre de filtres et recherche */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-1 p-1 bg-pierre-100 rounded-lg w-fit">
              {([
                { key: 'all', label: 'Tout', count: counts.all },
                { key: 'published', label: 'Publiées', count: counts.published },
                { key: 'draft', label: 'Brouillons', count: counts.draft },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filter === tab.key
                      ? 'bg-white text-noir shadow-sm'
                      : 'text-pierre-500 hover:text-noir'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs text-pierre-400">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-1 relative">
              <svg
                className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-pierre-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une création..."
                className="input-field pl-11"
              />
            </div>
          </div>

          {/* Grille de créations */}
          {filtered.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-pierre-500 text-sm">
                Aucune création ne correspond à ces critères.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((model) => (
                <div key={model.id} className="group">
                  {/* Image */}
                  <div className="aspect-[3/4] bg-pierre-100 rounded-xl overflow-hidden relative">
                    {model.images?.[0] ? (
                      <img
                        src={`/storage/${model.images[0].path}`}
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-pierre-300 text-xs">
                        Sans image
                      </div>
                    )}

                    {model.status === 'published' && (
                      <span className="absolute top-2 left-2 badge badge-succes text-[10px] py-0.5">
                        En ligne
                      </span>
                    )}
                    {model.status !== 'published' && (
                      <span className="absolute top-2 left-2 badge badge-neutre text-[10px] py-0.5">
                        Brouillon
                      </span>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-sm font-medium text-noir truncate">
                        {model.name}
                      </p>
                      {model.price && (
                        <p className="text-xs text-pierre-500 mt-0.5">
                          {Number(model.price).toLocaleString('fr-FR')}{' '}
                          {model.currency}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <ImageUploader
                        modelId={model.id}
                        onUploaded={(img) => handleImageUploaded(model.id, img)}
                      />
                      {model.status === 'published' ? (
                        <button
                          type="button"
                          onClick={() => handleUnpublish(model.id)}
                          className="text-left text-xs text-pierre-500 hover:text-noir transition"
                        >
                          Dépublier
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePublish(model.id)}
                          className="text-left text-xs text-succes hover:opacity-80 font-medium transition"
                        >
                          Publier
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(model.id, model.name)}
                        className="text-left text-xs text-pierre-400 hover:text-alerte transition"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}