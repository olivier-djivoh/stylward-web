import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import Spinner from '../components/Spinner'
import { useToast } from '../contexts/ToastContext'
import CollectionsGridSkeleton from '../components/skeletons/CollectionsGridSkeleton'
interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  cover_path: string | null
  status: string
  models_count: number
  published_at: string | null
}

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const { data } = await api.get('/collections')
      setCollections(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.post('/collections', form)
      toast.success('Collection créée.')
      setForm({ name: '', description: '' })
      setShowForm(false)
      await load()
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } else {
        toast.error('Erreur lors de la création')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout
      title="Mes collections"
      subtitle={`${collections.length} collection${collections.length > 1 ? 's' : ''}`}
      actions={
        !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-sm"
          >
            + Nouvelle collection
          </button>
        )
      }
    >
      {loading ? (
        <CollectionsGridSkeleton count={6} />
      ) : (
        <div className="space-y-8">

          {/* Formulaire de création */}
          {showForm && (
            <div className="card animate-[fade-up_0.3s_ease-out]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-xl text-noir">
                  Nouvelle collection
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setError('')
                  }}
                  className="text-pierre-400 hover:text-noir"
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-[10px] bg-alerte-soft border border-alerte/20 text-alerte text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="input-label">Nom de la collection *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    maxLength={150}
                    className="input-field"
                    placeholder="Ex: Collection Été 2026"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="input-label">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    maxLength={2000}
                    className="input-field resize-none"
                    placeholder="Quelques mots sur cette collection..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? 'Création...' : 'Créer la collection'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setError('')
                    }}
                    className="btn-ghost"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste */}
          {collections.length === 0 ? (
            <div className="card text-center py-16">
              <p className="font-serif text-2xl text-noir mb-3">
                Aucune collection
              </p>
              <p className="text-pierre-500 text-sm mb-6 max-w-sm mx-auto">
                Regroupez vos créations par thème, saison ou occasion.
              </p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  Créer ma première collection
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {collections.map((c) => (
                <Link
                  key={c.id}
                  to={`/dashboard/collections/${c.id}`}
                  className="group block"
                >
                  <div className="aspect-[4/3] bg-pierre-100 rounded-xl overflow-hidden relative mb-4">
                    {c.cover_path ? (
                      <img
                        src={`/storage/${c.cover_path}`}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-pierre-300 bg-gradient-to-br from-pierre-100 to-pierre-200">
                        <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] uppercase tracking-widest">
                          Ajouter une couverture
                        </span>
                      </div>
                    )}

                    {c.status === 'published' ? (
                      <span className="absolute top-2 left-2 badge badge-succes text-[10px] py-0.5">
                        En ligne
                      </span>
                    ) : (
                      <span className="absolute top-2 left-2 badge badge-neutre text-[10px] py-0.5">
                        Brouillon
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-lg text-noir leading-tight mb-1 group-hover:text-brun transition">
                    {c.name}
                  </h3>
                  <p className="text-xs text-pierre-500">
                    {c.models_count} création{c.models_count > 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  )
}