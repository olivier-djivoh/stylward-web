import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import { useToast } from '../contexts/ToastContext'

interface Category {
  id: string
  name: string
  slug: string
}

export default function CreateModel() {
  const navigate = useNavigate()
  const toast = useToast()
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
      toast.success('Création enregistrée.')
      navigate('/dashboard/models')
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } else {
        toast.error('Erreur lors de la création')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout
      title="Nouvelle création"
      subtitle="Ajoutez une pièce à votre catalogue"
    >
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">

          {error && (
            <div className="p-4 rounded-[10px] bg-alerte-soft border border-alerte/20 text-alerte text-sm">
              {error}
            </div>
          )}

          {/* Section : Informations */}
          <div>
            <p className="font-overline text-pierre-500 mb-4">Informations</p>
            <div className="card space-y-5">
              <div>
                <label className="input-label">Nom de la création *</label>
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
                <label className="input-label">Catégorie</label>
                <select
                  value={form.category_id}
                  onChange={(e) => update('category_id', e.target.value)}
                  className="input-field"
                >
                  <option value="">— Choisir —</option>
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
                  placeholder="Décrivez votre création, les finitions, le tissu..."
                />
              </div>
            </div>
          </div>

          {/* Section : Détails */}
          <div>
            <p className="font-overline text-pierre-500 mb-4">Détails</p>
            <div className="card space-y-5">
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
                    placeholder="45000"
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
                    placeholder="Beige"
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
                  placeholder="VST-001"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la création'}
            </button>
            <Link to="/dashboard/models" className="btn-ghost">
              Annuler
            </Link>
          </div>

          <p className="text-xs text-pierre-400">
            La création sera enregistrée en <strong>brouillon</strong>. Vous pourrez
            l'ajouter au catalogue public et la publier ensuite.
          </p>
        </form>
      </div>
    </DashboardLayout>
  )
}