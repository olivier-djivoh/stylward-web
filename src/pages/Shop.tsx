import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import Spinner from '../components/Spinner'
import ShopImageUploader from '../components/ShopImageUploader'

interface Shop {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  whatsapp: string | null
  status: string
  logo_path: string | null
  cover_path: string | null
}

export default function ShopPage() {
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/shop').catch(() => ({ data: null }))
        setShop(data)
        if (data) {
          setForm({
            name: data.name || '',
            description: data.description || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
          })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!shop) return
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const { data } = await api.put(`/shop/${shop.id}`, form)
      setShop(data)
      setSuccess('Boutique mise à jour.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } else {
        setError('Erreur lors de la sauvegarde')
      }
    } finally {
      setSaving(false)
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

  function handleImageUpdated(field: 'logo_path' | 'cover_path', path: string) {
    setShop((prev) => (prev ? { ...prev, [field]: path } : prev))
  }

  function copyLink() {
    if (!shop) return
    navigator.clipboard.writeText(`${window.location.origin}/shops/${shop.slug}`)
    setSuccess('Lien copié dans le presse-papiers !')
    setTimeout(() => setSuccess(''), 3000)
  }

  function whatsappShare() {
    if (!shop) return
    const url = `${window.location.origin}/shops/${shop.slug}`
    const message = `Bonjour, découvrez mes nouvelles créations 👇\n${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex justify-center">
          <Spinner label="Chargement..." />
        </div>
      </DashboardLayout>
    )
  }

  if (!shop) {
    return (
      <DashboardLayout>
        <div className="card max-w-xl">
          <h2 className="font-display text-2xl text-noir mb-3">
            Vous n'avez pas encore de boutique
          </h2>
          <p className="text-pierre-500 text-sm mb-6">
            Créez votre boutique pour commencer à ajouter vos créations.
          </p>
          <Link to="/dashboard/shop/new" className="btn-primary">
            Créer ma boutique
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const publicUrl = `${window.location.origin}/shops/${shop.slug}`

  return (
    <DashboardLayout
      title="Ma boutique"
      subtitle="Gérez votre identité et partagez votre lien unique"
    >
      <div className="space-y-8">

        {/* ====== PARTAGE ====== */}
        <div className="card relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="font-overline text-pierre-500 mb-1">État</p>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl text-noir">
                  {shop.status === 'active' ? 'En ligne' : 'Brouillon'}
                </h2>
                {shop.status === 'active' && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-succes opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-succes" />
                  </span>
                )}
              </div>
            </div>
            {shop.status !== 'active' && (
              <button onClick={handleActivate} className="btn-primary text-sm">
                Activer la boutique
              </button>
            )}
          </div>

          {shop.status === 'active' && (
            <>
              {/* Lien public */}
              <div className="bg-ivoire border border-beige-soft rounded-xl p-4 mb-4">
                <p className="text-xs text-pierre-500 mb-1.5">Votre lien public</p>
                <p className="font-mono text-sm text-noir break-all">
                  {publicUrl}
                </p>
              </div>

              {/* Boutons de partage */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={copyLink}
                  className="btn-secondary text-sm py-2.5 justify-center"
                >
                  Copier
                </button>
                <button
                  onClick={whatsappShare}
                  className="btn-primary text-sm py-2.5 justify-center"
                >
                  WhatsApp
                </button>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm py-2.5 justify-center"
                >
                  Facebook
                </a>
                <a
                  href={`https://www.instagram.com/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm py-2.5 justify-center"
                >
                  Instagram
                </a>
              </div>

              <div className="mt-4 text-center">
                <a
                  href={`/shops/${shop.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-pierre-500 hover:text-noir underline underline-offset-4 transition"
                >
                  Ouvrir ma boutique publique →
                </a>
              </div>
            </>
          )}
        </div>

        {/* ====== MESSAGES ====== */}
        {success && (
          <div className="p-4 rounded-[10px] bg-succes-soft border border-succes/20 text-succes text-sm">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="p-4 rounded-[10px] bg-alerte-soft border border-alerte/20 text-alerte text-sm">
            {error}
          </div>
        )}

        {/* ====== PERSONNALISATION VISUELLE ====== */}
        <div>
          <p className="font-overline text-pierre-500 mb-4">Identité visuelle</p>
          <div className="card">
            <div className="grid sm:grid-cols-2 gap-8">
              <ShopImageUploader
                type="logo"
                currentUrl={shop.logo_path}
                onUploaded={(path) => handleImageUpdated('logo_path', path)}
                label="Logo"
                hint="Format carré, 400×400px minimum."
              />
              <ShopImageUploader
                type="cover"
                currentUrl={shop.cover_path}
                onUploaded={(path) => handleImageUpdated('cover_path', path)}
                label="Photo de couverture"
                hint="Format paysage, 1200×600px minimum."
              />
            </div>
          </div>
        </div>

        {/* ====== INFORMATIONS ====== */}
        <div>
          <p className="font-overline text-pierre-500 mb-4">Informations</p>
          <form onSubmit={handleSubmit} className="card space-y-5">
            <div>
              <label className="input-label">Nom de la boutique</label>
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
              <label className="input-label">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                maxLength={2000}
                className="input-field resize-none"
                placeholder="Présentez votre univers, votre savoir-faire..."
              />
              <p className="text-xs text-pierre-400 mt-1.5">
                {form.description.length} / 2000 caractères
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Téléphone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="input-field"
                  placeholder="+229 97 00 00 00"
                />
              </div>
              <div>
                <label className="input-label">Numéro WhatsApp</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => update('whatsapp', e.target.value)}
                  className="input-field"
                  placeholder="+229 97 00 00 00"
                />
                <p className="text-xs text-pierre-400 mt-1.5">
                  Utilisé pour les commandes clients.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </DashboardLayout>
  )
}