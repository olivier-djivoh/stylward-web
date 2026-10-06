import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import Spinner from '../components/Spinner'
import ShopImageUploader from '../components/ShopImageUploader'
import { shareContent, canNativeShare } from '../lib/share'


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
  const [previewKey, setPreviewKey] = useState(0)
  const [showPreview, setShowPreview] = useState(true)

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

  function refreshPreview() {
    setPreviewKey((k) => k + 1)
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
      refreshPreview()
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
      refreshPreview()
    } catch {
      alert('Erreur lors de l\'activation')
    }
  }

  function handleImageUpdated(field: 'logo_path' | 'cover_path', path: string) {
    setShop((prev) => (prev ? { ...prev, [field]: path } : prev))
    refreshPreview()
  }

  function copyLink() {
    if (!shop) return
    navigator.clipboard.writeText(`${window.location.origin}/shops/${shop.slug}`)
    setSuccess('Lien copié dans le presse-papiers !')
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleShare() {
  if (!shop) return
  const url = `${window.location.origin}/shops/${shop.slug}`
  await shareContent({
    title: shop.name,
    text: `Découvrez les créations de ${shop.name} :`,
    url,
  })
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
    <DashboardLayout>
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-overline text-pierre-500 mb-2">Ma boutique</p>
            <h1 className="font-display text-3xl sm:text-4xl text-noir">
              {shop.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="hidden lg:inline-flex text-xs uppercase tracking-[0.15em] text-pierre-500 hover:text-noir transition-colors font-medium"
            >
              {showPreview ? 'Masquer l\'aperçu' : 'Voir l\'aperçu'}
            </button>
            <a
              href={`/shops/${shop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm"
            >
              Voir en ligne →
            </a>
          </div>
        </div>
      </div>

      {/* Messages globaux */}
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

      {/* Layout : contrôles + aperçu */}
      <div className={`grid gap-8 ${showPreview ? 'lg:grid-cols-5' : 'lg:grid-cols-1'}`}>

        {/* ═══ COLONNE GAUCHE : CONTRÔLES ═══ */}
        <div className={`space-y-8 ${showPreview ? 'lg:col-span-3' : ''}`}>

          {/* ===== PARTAGE ===== */}
          <section>
            <p className="font-overline text-pierre-500 mb-4">Partage</p>
            <div className="card">
              <div className="flex items-center gap-3 mb-5">
                {shop.status === 'active' ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-succes opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-succes" />
                    </span>
                    <span className="text-sm font-medium text-noir">
                      Boutique en ligne
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-pierre-400" />
                    <span className="text-sm font-medium text-pierre-600">
                      Brouillon — invisible publiquement
                    </span>
                  </>
                )}
              </div>

              {shop.status === 'active' ? (
                <>
                  <div className="bg-ivoire border border-beige-soft rounded-xl p-4 mb-4">
                    <p className="text-xs text-pierre-500 mb-1.5">Lien public</p>
                    <p className="font-mono text-sm text-noir break-all">
                      {publicUrl}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={copyLink}
                      className="btn-secondary text-sm py-2.5 justify-center"
                    >
                      Copier
                    </button>
                    <button
                      onClick={handleShare}
                      className="btn-primary text-sm py-2.5 justify-center"
                    >
                      {canNativeShare() ? 'Partager' : 'WhatsApp'}
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
                </>
              ) : (
                <button onClick={handleActivate} className="btn-primary w-full">
                  Activer la boutique
                </button>
              )}
            </div>
          </section>

          {/* ===== IDENTITÉ VISUELLE ===== */}
          <section>
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
          </section>

          {/* ===== INFORMATIONS ===== */}
          <section>
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
                    Utilisé pour les commandes.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </section>

        </div>

        {/* ═══ COLONNE DROITE : APERÇU EN DIRECT ═══ */}
        {showPreview && (
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-3">
                <p className="font-overline text-pierre-500">Aperçu en direct</p>
                <button
                  onClick={refreshPreview}
                  className="text-[10px] uppercase tracking-[0.15em] text-pierre-400 hover:text-noir transition-colors font-medium"
                  title="Rafraîchir l'aperçu"
                >
                  ↻ Rafraîchir
                </button>
              </div>

              <div className="bg-noir rounded-2xl p-2 shadow-xl">
                {/* Fausse barre navigateur */}
                <div className="flex items-center gap-1.5 px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-pierre-600" />
                  <div className="w-2 h-2 rounded-full bg-pierre-600" />
                  <div className="w-2 h-2 rounded-full bg-pierre-600" />
                  <div className="flex-1 ml-2 px-2 py-0.5 bg-pierre-800 rounded text-[9px] text-pierre-400 font-mono truncate">
                    /shops/{shop.slug}
                  </div>
                </div>

                {/* Iframe aperçu */}
                <div className="bg-white rounded-xl overflow-hidden" style={{ aspectRatio: '9 / 16' }}>
                  <iframe
                    key={previewKey}
                    src={`/shops/${shop.slug}`}
                    title="Aperçu boutique"
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>

              <p className="text-[10px] text-pierre-400 text-center mt-3 leading-relaxed">
                L'aperçu se recharge après chaque modification.
              </p>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}