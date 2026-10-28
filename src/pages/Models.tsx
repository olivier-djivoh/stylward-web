import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import Spinner from '../components/Spinner'
import { useToast } from '../contexts/ToastContext'
import ImageUploader from '../components/ImageUploader'
import ModelsGridSkeleton from '../components/skeletons/ModelsGridSkeleton'
import { Copy } from 'lucide-react'
import { useConfirm } from '../contexts/ConfirmContext'
import { STORAGE_URL } from '../lib/api'


interface Model {
  id: string
  name: string
  slug: string
  price: string | null
  currency: string
  color: string | null
  status: string
  created_at: string
  category: { id: string; name: string } | null
  images: { id: string; path: string }[]
}

type Filter = 'all' | 'published' | 'draft'
type Sort =
  | 'recent'
  | 'oldest'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'

export default function Models() {
  const toast = useToast()
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<Sort>('recent')
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const confirm = useConfirm()

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
    toast.success('Modèle publié.')
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, status: 'published' } : m))
    )
  }

  async function handleUnpublish(modelId: string) {
    await api.patch(`/models/${modelId}/unpublish`)
    toast.success('Modèle dépublié.')
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, status: 'draft' } : m))
    )
  }

  async function handleDelete(modelId: string, name: string) {
  const isConfirmed = await confirm({
    title: 'Supprimer cette création ?',
    message: `Êtes-vous sûr de vouloir supprimer définitivement "${name}" ? Cette action est irréversible.`,
    confirmText: 'Supprimer',
    variant: 'danger'
  })
  
  if (!isConfirmed) return
    try {
      await api.delete(`/models/${modelId}`)
      toast.success('Modèle supprimé.')
      setModels((prev) => prev.filter((m) => m.id !== modelId))
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  async function handleDuplicate(modelId: string, e: React.MouseEvent) {
  e.preventDefault() // Empêche d'ouvrir le modèle quand on clique sur le bouton
  setDuplicatingId(modelId)
  try {
    await api.post(`/models/${modelId}/duplicate`)
    toast.success('Modèle dupliqué en brouillon.')
    load() // Recharge la liste
  } catch {
    toast.error('Erreur lors de la duplication.')
  } finally {
    setDuplicatingId(null)
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
    .sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name_asc':
          return a.name.localeCompare(b.name)
        case 'name_desc':
          return b.name.localeCompare(a.name)
        case 'price_asc':
          return (Number(a.price) || 0) - (Number(b.price) || 0)
        case 'price_desc':
          return (Number(b.price) || 0) - (Number(a.price) || 0)
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

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
        <ModelsGridSkeleton count={8} />
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
          {/* Barre de filtres, recherche et tri */}
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

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="input-field w-fit pr-8 cursor-pointer"
              title="Trier par"
            >
              <option value="recent">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="name_asc">Nom (A → Z)</option>
              <option value="name_desc">Nom (Z → A)</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
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
                <Link
                  key={model.id}
                  to={`/dashboard/models/${model.id}`}
                  className="group block"
                >
                  <div className="aspect-[3/4] bg-pierre-100 rounded-xl overflow-hidden relative">
                    {model.images?.[0] ? (
                      <img
                        src={`${STORAGE_URL}/${model.images[0].path}`}
                        alt={model.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-pierre-300 text-xs">
                        Sans image
                      </div>
                    )}

                    {model.status === 'published' ? (
                      <span className="absolute top-2 left-2 badge badge-succes text-[10px] py-0.5">
                        En ligne
                      </span>
                    ) : (
                      <span className="absolute top-2 left-2 badge badge-neutre text-[10px] py-0.5">
                        Brouillon
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1">
  <p className="font-medium text-noir text-sm truncate group-hover:text-brun transition-colors">
    {model.name}
  </p>
  {model.price && (
    <p className="text-xs text-pierre-500">
      {Number(model.price).toLocaleString('fr-FR')} {model.currency}
    </p>
  )}
  
  {/* 👇 AJOUTE CE BLOC ICI 👇 */}
  <div className="pt-1">
    <button
      onClick={(e) => handleDuplicate(model.id, e)}
      disabled={duplicatingId === model.id}
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-pierre-400 hover:text-noir transition-colors disabled:opacity-50"
      title="Dupliquer ce modèle"
    >
      {duplicatingId === model.id ? (
        <span className="w-3 h-3 border-2 border-pierre-300 border-t-pierre-600 rounded-full animate-spin" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {duplicatingId === model.id ? 'Copie...' : 'Dupliquer'}
    </button>
  </div>
  {/* 👆 FIN DU BLOC 👆 */}

</div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}