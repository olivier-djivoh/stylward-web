import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'

interface Category {
  id: string
  name: string
  slug: string
}

export default function CreateModel() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    color: '',
    reference: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await api.get('/categories')
      setCategories(data.data)
    }
    load()
  }, [])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload: any = {
        name: form.name,
        description: form.description || null,
        color: form.color || null,
        reference: form.reference || null,
      }
      if (form.category_id) payload.category_id = form.category_id
      if (form.price) payload.price = Number(form.price)

      await api.post('/models', payload)
      navigate('/dashboard')
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
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-neutral-500 hover:text-neutral-900 transition"
          >
            ← Retour
          </Link>
          <h1 className="text-lg font-bold text-neutral-900">Nouveau modèle</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nom du modèle *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              maxLength={150}
              className="input-field"
              placeholder="Ex: Veste en lin beige"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Catégorie
            </label>
            <select
              value={form.category_id}
              onChange={(e) => update('category_id', e.target.value)}
              className="input-field"
            >
              <option value="">— Choisir une catégorie —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              maxLength={5000}
              className="input-field"
              placeholder="Décrivez le modèle, les finitions, le tissu..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Prix
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                min="0"
                step="100"
                className="input-field"
                placeholder="Ex: 45000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Couleur
              </label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => update('color', e.target.value)}
                maxLength={50}
                className="input-field"
                placeholder="Ex: Beige"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Référence
            </label>
            <input
              type="text"
              value={form.reference}
              onChange={(e) => update('reference', e.target.value)}
              maxLength={50}
              className="input-field"
              placeholder="Ex: VST-001"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Création...' : 'Créer le modèle'}
            </button>
            <Link
              to="/dashboard"
              className="btn-secondary"
            >
              Annuler
            </Link>
          </div>

          <p className="text-xs text-neutral-500 text-center pt-2">
            Le modèle sera créé en <strong>brouillon</strong>. Vous pourrez
            l'ajouter au catalogue et le publier ensuite.
          </p>
        </form>
      </main>
    </div>
  )
}