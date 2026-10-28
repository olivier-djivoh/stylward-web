import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import Spinner from '../components/Spinner'
import { useToast } from '../contexts/ToastContext'
import ModelsGridSkeleton from '../components/skeletons/ModelsGridSkeleton'
import { CheckCircle } from 'lucide-react'
import { useConfirm } from '../contexts/ConfirmContext'

interface Model {
  id: string
  name: string
  slug: string
  price: string | null
  currency: string
  status: string
  images: { id: string; path: string }[]
}

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  cover_path: string | null
  status: string
  models: Model[]
}

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()
  const inputRef = useRef<HTMLInputElement>(null)

  const [collection, setCollection] = useState<Collection | null>(null)
  const [allModels, setAllModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showAddModel, setShowAddModel] = useState(false)

  const [form, setForm] = useState({ name: '', description: '' })

  async function load() {
    if (!id) return
    try {
      const [colRes, modelsRes] = await Promise.all([
        api.get(`/collections/${id}`),
        api.get('/models'),
      ])
      setCollection(colRes.data)
      setForm({
        name: colRes.data.name,
        description: colRes.data.description || '',
      })
      setAllModels(modelsRes.data.data || [])
    } catch {
      toast.error('Collection introuvable')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!collection) return
    setSaving(true)
    setError('')
    try {
      const { data } = await api.put(`/collections/${collection.id}`, form)
      setCollection({ ...collection, ...data })
      toast.success('Modifications enregistrées.')
      
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  async function handleCoverUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !collection) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const { data } = await api.post(`/collections/${collection.id}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setCollection({ ...collection, cover_path: data.cover_path })
    } catch {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleAddModel(modelId: string) {
    if (!collection) return
    try {
      await api.post(`/collections/${collection.id}/models`, { model_id: modelId })
      await load()
      setShowAddModel(false)
    } catch {
      toast.error('Erreur')
    }
  }

    async function handleRemoveModel(modelId: string) {
    if (!collection) return
    // Remplacer le confirm
    const isConfirmed = await confirm({
      title: 'Retirer la création ?',
      message: 'Cette création sera retirée de la collection (elle ne sera pas supprimée de votre catalogue).',
      confirmText: 'Retirer',
      variant: 'default'
    })
    if (!isConfirmed) return

    try {
      await api.delete(`/collections/${collection.id}/models/${modelId}`)
      setCollection({
        ...collection,
        models: collection.models.filter((m) => m.id !== modelId),
      })
    } catch {
      toast.error('Erreur')
    }
  }

  async function handlePublish() {
    if (!collection) return
    await api.patch(`/collections/${collection.id}/publish`)
    setCollection({ ...collection, status: 'published' })
  }

  async function handleUnpublish() {
    if (!collection) return
    await api.patch(`/collections/${collection.id}/unpublish`)
    setCollection({ ...collection, status: 'draft' })
  }

    async function handleDelete() {
    if (!collection) return
    // Remplacer le confirm
    const isConfirmed = await confirm({
      title: 'Supprimer la collection ?',
      message: `Êtes-vous sûr de vouloir supprimer la collection "${collection.name}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      variant: 'danger'
    })
    if (!isConfirmed) return

    await api.delete(`/collections/${collection.id}`)
    navigate('/dashboard/collections')
  }

  if (loading) {
  return (
    <DashboardLayout>
      <ModelsGridSkeleton count={6} />
    </DashboardLayout>
  )
}

  if (!collection) {
    return (
      <DashboardLayout>
        <div className="card text-center py-16 max-w-md">
          <p className="font-serif text-2xl text-noir mb-3">Collection introuvable</p>
          <Link to="/dashboard/collections" className="btn-primary inline-block">
            Retour aux collections
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  // Modèles qui ne sont PAS encore dans la collection
  const availableModels = allModels.filter(
    (m) => !collection.models.some((cm) => cm.id === m.id)
  )

  return (
    <DashboardLayout>
      {/* Fil d'Ariane */}
      <Link
        to="/dashboard/collections"
        className="text-[11px] uppercase tracking-[0.22em] text-pierre-500 hover:text-noir transition inline-flex items-center gap-2 mb-6"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Toutes les collections
      </Link>

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {collection.status === 'published' ? (
              <span className="badge badge-succes">En ligne</span>
            ) : (
              <span className="badge badge-neutre">Brouillon</span>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-noir">
            {collection.name}
          </h1>
        </div>

        <div className="flex gap-2 shrink-0">
          {collection.status === 'published' ? (
            <button onClick={handleUnpublish} className="btn-secondary text-sm">
              Dépublier
            </button>
          ) : (
            <button onClick={handlePublish} className="btn-primary text-sm">
              Publier
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-[10px] bg-succes-soft border border-succes/20 text-succes text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-[10px] bg-alerte-soft border border-alerte/20 text-alerte text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-8">

          {/* Couverture */}
          <div>
            <p className="font-overline text-pierre-500 mb-4">Couverture</p>
            <div
              onClick={() => inputRef.current?.click()}
              className="aspect-[16/9] bg-pierre-100 rounded-2xl overflow-hidden cursor-pointer relative group"
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverUpload}
                className="hidden"
              />

              {collection.cover_path ? (
                <>
                  <img
                    src={`/storage/${collection.cover_path}`}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                    <span className="text-white text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition">
                      Changer la couverture
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-pierre-400">
                  <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs uppercase tracking-widest">
                    Ajouter une couverture
                  </span>
                </div>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
            </div>
          </div>

          {/* Créations dans la collection */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-overline text-pierre-500 mb-1">Contenu</p>
                <h2 className="font-display text-2xl text-noir">
                  {collection.models.length} création{collection.models.length > 1 ? 's' : ''}
                </h2>
              </div>
              {availableModels.length > 0 && (
                <button
                  onClick={() => setShowAddModel(true)}
                  className="btn-secondary text-sm"
                >
                  + Ajouter
                </button>
              )}
            </div>

            {collection.models.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-pierre-500 text-sm mb-4">
                  Aucune création dans cette collection.
                </p>
                {availableModels.length > 0 && (
                  <button
                    onClick={() => setShowAddModel(true)}
                    className="btn-primary inline-flex"
                  >
                    Ajouter une création
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {collection.models.map((m) => (
                  <div key={m.id} className="group relative">
                    <div className="aspect-[3/4] bg-pierre-100 rounded-xl overflow-hidden">
                      {m.images?.[0] ? (
                        <img
                          src={`/storage/${m.images[0].path}`}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-pierre-300 text-xs">
                          Sans image
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-noir truncate">
                        {m.name}
                      </p>
                      {m.price && (
                        <p className="text-xs text-pierre-500">
                          {Number(m.price).toLocaleString('fr-FR')} {m.currency}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemoveModel(m.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 backdrop-blur shadow flex items-center justify-center text-pierre-500 hover:text-alerte opacity-0 group-hover:opacity-100 transition"
                      aria-label="Retirer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div>
            <p className="font-overline text-pierre-500 mb-4">Informations</p>
            <form onSubmit={handleSave} className="card space-y-5">
              <div>
                <label className="input-label">Nom</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={150}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  maxLength={2000}
                  className="input-field resize-none"
                />
              </div>
              <div>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6">

            {/* Publication */}
            <div className="card">
              <p className="font-overline text-pierre-500 mb-3">Publication</p>
              <p className="text-sm text-noir mb-4 leading-relaxed">
                {collection.status === 'published'
                  ? 'Cette collection est visible par vos clients.'
                  : 'Cette collection est en brouillon.'}
              </p>
              {collection.status === 'published' ? (
                <button onClick={handleUnpublish} className="btn-secondary text-sm w-full">
                  Dépublier
                </button>
              ) : (
                <button onClick={handlePublish} className="btn-primary text-sm w-full">
                  Publier cette collection
                </button>
              )}
            </div>

            {/* Zone sensible */}
            <div className="card border-alerte/20">
              <p className="font-overline text-alerte mb-3">Zone sensible</p>
              <button
                onClick={handleDelete}
                className="w-full text-sm font-medium text-alerte border border-alerte/30 hover:bg-alerte-soft rounded-[10px] py-2.5 transition"
              >
                Supprimer la collection
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal ajout modèle */}
      {showAddModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddModel(false)} />
          <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-pierre-100 flex items-center justify-between">
              <h3 className="font-serif text-xl text-noir">
                Ajouter des créations
              </h3>
              <button onClick={() => setShowAddModel(false)} className="text-pierre-400 hover:text-noir">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {availableModels.length === 0 ? (
                <p className="text-center text-pierre-500 py-8">
                  Toutes vos créations sont déjà dans cette collection.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {availableModels.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleAddModel(m.id)}
                      className="group text-left"
                    >
                      <div className="aspect-[3/4] bg-pierre-100 rounded-xl overflow-hidden relative">
                        {m.images?.[0] ? (
                          <img
                            src={`/storage/${m.images[0].path}`}
                            alt={m.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-pierre-300 text-xs">
                            Sans image
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                          <span className="text-white text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition">
                            + Ajouter
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm font-medium text-noir truncate">
                        {m.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}