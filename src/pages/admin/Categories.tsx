import { FormEvent, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import { useToast } from '../../contexts/ToastContext'
import AdminListSkeleton from '../../components/skeletons/AdminListSkeleton'
import { CheckCircle } from 'lucide-react'
import { useConfirm } from '../../contexts/ConfirmContext'

interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const toast = useToast()
  const confirm = useConfirm()
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

  useEffect(() => { load() }, [])

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
      if (isEditing) {
        await api.put(`/admin/categories/${editingId}`, payload)
        toast.success(`Catégorie « ${currentName} » modifiée.`)
      } else {
        await api.post('/admin/categories', payload)
        toast.success(`Catégorie « ${currentName} » créée.`)
      }
      resetForm()
      await load()
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } else {
        toast.error('Erreur lors de l\'enregistrement')
      }
    } finally {
      setSaving(false)
    }
  }

    async function handleDelete(id: string, name: string) {
    const isConfirmed = await confirm({
      title: 'Supprimer la catégorie ?',
      message: `Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ? Elle ne doit être utilisée par aucune création.`,
      confirmText: 'Supprimer',
      variant: 'danger'
    })
    if (!isConfirmed) return

    try {
      await api.delete(`/admin/categories/${id}`)
      toast.success(`Catégorie « ${name} » supprimée.`)
      setError('')
      await load()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  return (
    <AdminLayout
      title="Catégories"
      subtitle="Organisez le catalogue global de la plateforme"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

        {/* Formulaire */}
        <div className="min-w-0 lg:col-span-1">
          <div className="card lg:sticky lg:top-6">
            <h2 className="font-display text-xl text-noir mb-5">
              {editingId ? 'Modifier' : 'Ajouter'} une catégorie
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-alerte-soft border border-alerte/20 text-alerte text-xs">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-lg bg-succes-soft border border-succes/20 text-succes text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}

              <div>
                <label className="input-label">Nom *</label>
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
                <label className="input-label">Ordre d'affichage</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  min="0"
                  max="9999"
                  className="input-field"
                  placeholder="10"
                />
                <p className="text-xs text-pierre-400 mt-1.5">
                  Plus petit = affiché en premier.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
                  {saving ? '...' : editingId ? 'Modifier' : 'Ajouter'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="btn-secondary text-sm">
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Liste */}
        <div className="min-w-0 lg:col-span-2">
          {loading ? (
            <AdminListSkeleton count={8} />
          ) : categories.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-pierre-500">Aucune catégorie.</p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="divide-y divide-pierre-100">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs text-pierre-400 font-mono w-8 text-right shrink-0">
                        {cat.sort_order}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-noir truncate">{cat.name}</p>
                        <p className="text-xs text-pierre-400 font-mono truncate">
                          {cat.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(cat)}
                        className="text-xs text-pierre-500 hover:text-noir px-3 py-1.5 rounded-lg hover:bg-pierre-50 transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="text-xs text-pierre-400 hover:text-alerte px-3 py-1.5 rounded-lg hover:bg-alerte-soft transition"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}