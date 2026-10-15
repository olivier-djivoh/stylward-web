import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import Spinner from '../components/Spinner'
import { useToast } from '../contexts/ToastContext'
import MultiImageUploader from '../components/MultiImageUploader'
import ShareModal from '../components/ShareModal'
import ModelsGridSkeleton from '../components/skeletons/ModelsGridSkeleton'
import Skeleton from '../components/Skeleton'

interface Category {
  id: string
  name: string
}

interface Model {
  id: string
  name: string
  description: string | null
  price: string | null
  currency: string
  color: string | null
  reference: string | null
  status: string
  category: { id: string; name: string } | null
  images: { id: string; path: string; type: string }[]
}

export default function ModelDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [model, setModel] = useState<Model | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shopName, setShopName] = useState('')

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    color: '',
    reference: '',
  })

  useEffect(() => {
  async function load() {
    if (!id) return
    try {
      const [modelRes, catRes, shopRes] = await Promise.all([
        api.get(`/models/${id}`),
        api.get('/categories'),
        api.get('/shop').catch(() => ({ data: null })),
      ])
      const m = modelRes.data.data
      setModel(m)
      setCategories(catRes.data.data)
      setShopName(shopRes.data?.name || '')
      setForm({
        name: m.name,
        category_id: m.category?.id || '',
        description: m.description || '',
        price: m.price ? String(Number(m.price)) : '',
        color: m.color || '',
        reference: m.reference || '',
      })
    } catch {
      setError('Modèle introuvable')
    } finally {
      setLoading(false)
    }
  }
  load()
}, [id])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!model) return
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const payload: any = {
        name: form.name,
        description: form.description || null,
        color: form.color || null,
        reference: form.reference || null,
        category_id: form.category_id || null,
      }
      if (form.price) payload.price = Number(form.price)

      const { data } = await api.put(`/models/${model.id}`, payload)
      setModel(data.data)
      toast.success('Modifications enregistrées.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } else {
       toast.error ('Erreur lors de l\'enregistrement')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleImagesUploaded(newImages: { id: string; path: string; type: string }[]) {
    setModel((prev) =>
      prev ? { ...prev, images: [...prev.images, ...newImages] } : prev
    )
  }

  async function handleDeleteImage(imageId: string) {
    if (!model) return
    if (!confirm('Supprimer cette image ?')) return
    try {
      await api.delete(`/models/${model.id}/images/${imageId}`)
      setModel((prev) =>
        prev ? { ...prev, images: prev.images.filter((i) => i.id !== imageId) } : prev
      )
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  async function handleSetMain(imageId: string) {
    if (!model) return
    try {
      await api.patch(`/models/${model.id}/images/${imageId}/set-main`)
      setModel((prev) =>
        prev
          ? {
              ...prev,
              images: prev.images.map((i) => ({
                ...i,
                type: i.id === imageId ? 'main' : 'gallery',
              })),
            }
          : prev
      )
    } catch {
      toast.error('Erreur')
    }
  }

  async function handlePublish() {
    if (!model) return
    await api.patch(`/models/${model.id}/publish`)
    setModel({ ...model, status: 'published' })
  }

  async function handleUnpublish() {
    if (!model) return
    await api.patch(`/models/${model.id}/unpublish`)
    setModel({ ...model, status: 'draft' })
  }

  async function handleDelete() {
    if (!model) return
    if (!confirm(`Supprimer définitivement "${model.name}" ?`)) return
    setDeleting(true)
    try {
      await api.delete(`/models/${model.id}`)
      navigate('/dashboard/models')
    } catch {
      toast.error('Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  if (loading) {
  return (
    <DashboardLayout>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    </DashboardLayout>
  )
}

  if (!model) {
    return (
      <DashboardLayout>
        <div className="card text-center py-16 max-w-md">
          <p className="font-display text-2xl text-noir mb-2">Création introuvable</p>
          <Link to="/dashboard/models" className="btn-primary inline-block mt-4">
            Retour aux créations
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Fil d'Ariane + actions */}
      <div className="mb-8">
        <Link
          to="/dashboard/models"
          className="text-[11px] uppercase tracking-[0.22em] text-pierre-500 hover:text-noir transition-colors inline-flex items-center gap-2 mb-4"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Toutes les créations
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {model.status === 'published' ? (
                <span className="badge badge-succes">En ligne</span>
              ) : (
                <span className="badge badge-neutre">Brouillon</span>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-noir">
              {model.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {model.status === 'published' ? (
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
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 rounded-[10px] bg-succes-soft border border-succes/20 text-succes text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-[10px] bg-alerte-soft border border-alerte/20 text-alerte text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Colonne gauche : formulaire */}
        <div className="lg:col-span-2 space-y-8">

          {/* ===== IMAGES ===== */}
          <div>
            <p className="font-overline text-pierre-500 mb-4">
              Photos de la création
            </p>

            {/* Galerie actuelle */}
            {model.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {model.images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-pierre-100"
                  >
                    <img
                      src={`/storage/${img.path}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />

                    {img.type === 'main' && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-noir text-blanc-casse rounded-full">
                        Principale
                      </span>
                    )}

                    {/* Actions au survol */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {img.type !== 'main' && (
                        <button
                          type="button"
                          onClick={() => handleSetMain(img.id)}
                          className="px-3 py-1.5 text-[10px] uppercase tracking-wider bg-white text-noir rounded-full font-medium hover:bg-beige transition"
                        >
                          Définir principale
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="w-8 h-8 rounded-full bg-alerte text-white flex items-center justify-center hover:opacity-90"
                        aria-label="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload multiple */}
            <MultiImageUploader
              modelId={model.id}
              onUploaded={handleImagesUploaded}
            />
          </div>

          {/* ===== INFORMATIONS ===== */}
          <div>
            <p className="font-overline text-pierre-500 mb-4">Informations</p>
            <form onSubmit={handleSubmit} className="card space-y-5">
              <div>
                <label className="input-label">Nom *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  required
                  maxLength={150}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Catégorie</label>
                <select
                  value={form.category_id}
                  onChange={(e) => update('category_id', e.target.value)}
                  className="input-field"
                >
                  <option value="">— Aucune —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  maxLength={5000}
                  className="input-field resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Prix</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    min="0"
                    step="100"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">Couleur</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => update('color', e.target.value)}
                    maxLength={50}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Référence</label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => update('reference', e.target.value)}
                  maxLength={50}
                  className="input-field"
                />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Colonne droite : actions dangereuses */}
<div className="lg:col-span-1">
  <div className="lg:sticky lg:top-24 space-y-6">

    {/* Publication */}
    <div className="card space-y-3">
      <p className="font-overline text-pierre-500">Publication</p>
      <p className="text-sm text-noir leading-relaxed">
        {model.status === 'published'
          ? 'Cette création est visible par vos clients.'
          : 'Cette création est en brouillon, invisible publiquement.'}
      </p>

      {model.status === 'published' ? (
        <button onClick={handleUnpublish} className="btn-secondary text-sm w-full">
          Dépublier
        </button>
      ) : (
        <button onClick={handlePublish} className="btn-primary text-sm w-full">
          Publier cette création
        </button>
      )}

      {/* Bouton partage (toujours visible si image existe) */}
      <button
        type="button"
        onClick={() => setShareOpen(true)}
        disabled={!model.images?.[0]}
        className="w-full text-sm font-medium text-noir border border-pierre-300 hover:border-noir rounded-[10px] py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        📸 Créer une image de partage
      </button>
    </div>

    {/* Danger zone */}
    <div className="card border-alerte/20">
      <p className="font-overline text-alerte mb-3">Zone sensible</p>
      <p className="text-sm text-pierre-600 mb-4 leading-relaxed">
        Supprimer cette création est irréversible.
      </p>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="w-full text-sm font-medium text-alerte border border-alerte/30 hover:bg-alerte-soft rounded-[10px] py-2.5 transition-colors disabled:opacity-50"
      >
        {deleting ? 'Suppression...' : 'Supprimer la création'}
      </button>
    </div>

  </div>
</div>

      </div>

      {/* Share modal (hors du grid, juste avant la fermeture du layout) */}
      {shareOpen && model.images?.[0] && (
        <ShareModal
          data={{
            imagePath: model.images[0].path,
            modelName: model.name,
            price: model.price,
            currency: model.currency,
            shopName: shopName || 'Ma vitrine',
            logoPath: null,
          }}
          onClose={() => setShareOpen(false)}
        />
      )}

    </DashboardLayout>
  )
}