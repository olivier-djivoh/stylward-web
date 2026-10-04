import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', sort_order: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const { data } = await api.get('/admin/categories')
      setCategories(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function resetForm() {
    setForm({ name: '', sort_order: '' })
    setEditingId(null)
    setError('')
  }

  function startEdit(cat: Category) {
    setForm({ name: cat.name, sort_order: String(cat.sort_order) })
    setEditingId(cat.id)
    setError('')
  }

 async function handleSubmit(e: FormEvent) {
  e.preventDefault()
  setError('')
  setSuccess('')
  setSaving(true)

  const currentName = form.name
  const isEditing = !!editingId

  const payload = {
    name: form.name,
    sort_order: form.sort_order ? Number(form.sort_order) : 0,
    status: 'active',
  }

  try {
    if (editingId) {
      await api.put(`/admin/categories/${editingId}`, payload)
      setSuccess(`Catégorie « ${currentName} » modifiée.`)
    } else {
      await api.post('/admin/categories', payload)
      setSuccess(`Catégorie « ${currentName} » créée avec succès.`)
    }
    resetForm()
    await load()
    setTimeout(() => setSuccess(''), 3000)
  } catch (err: any) {
    if (err.response?.data?.errors) {
      const firstError = Object.values(err.response.data.errors)[0]
      setError(Array.isArray(firstError) ? firstError[0] : String(firstError))
    } else if (err.response?.data?.message) {
      setError(err.response.data.message)
    } else {
      setError('Une erreur est survenue')
    }
  } finally {
    setSaving(false)
  }
}

  async function handleDelete(id: string) {
  if (!confirm('Supprimer cette catégorie ?')) return
  const cat = categories.find((c) => c.id === id)
  const name = cat?.name ?? 'Catégorie'

  try {
    await api.delete(`/admin/categories/${id}`)
    setSuccess(`Catégorie « ${name} » supprimée.`)
    setError('')
    await load()
    setTimeout(() => setSuccess(''), 3000)
  } catch (err: any) {
    setError(err.response?.data?.message || 'Erreur lors de la suppression')
  }
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
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-neutral-500 hover:text-neutral-900 transition"
          >
            ← Retour
          </Link>
          <h1 className="text-lg font-bold text-neutral-900">
            Gestion des catégories
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Formulaire */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">
              {editingId ? 'Modifier' : 'Ajouter'} une catégorie
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={100}
                  className="input-field"
                  placeholder="Ex: Manteaux"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  min="0"
                  max="9999"
                  className="input-field"
                  placeholder="10"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Plus petit = affiché en premier.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 text-sm"
                >
                  {saving ? '...' : editingId ? 'Modifier' : 'Ajouter'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary text-sm"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Liste */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900">
                Catégories
              </h2>
              <span className="text-sm text-neutral-500">
                {categories.length} au total
              </span>
            </div>

            {categories.length === 0 ? (
              <p className="text-neutral-500 py-8 text-center">
                Aucune catégorie.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-neutral-400 font-mono w-8 text-right">
                        {cat.sort_order}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 truncate">
                          {cat.name}
                        </p>
                        <p className="text-xs text-neutral-500 font-mono">
                          {cat.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="text-xs text-neutral-600 hover:text-neutral-900 underline"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        className="text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}