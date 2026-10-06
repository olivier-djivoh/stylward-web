
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import Spinner from '../components/Spinner'
import { track } from '../lib/tracker'
import { useEffect, useRef, useState } from 'react'


interface Shop {
  id: string
  name: string
  slug: string
  whatsapp: string | null
}

interface Model {
  id: string
  name: string
  description: string | null
  price: string | null
  currency: string
  color: string | null
  reference: string | null
  category: { id: string; name: string; slug: string } | null
  images: { id: string; path: string; type: string; alt_text: string | null }[]
}

export default function PublicModel() {
  const { slug, modelId } = useParams<{ slug: string; modelId: string }>()
  const [shop, setShop] = useState<Shop | null>(null)
  const [model, setModel] = useState<Model | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const trackedRef = useRef(false)

  useEffect(() => {
  async function load() {
    if (!slug || !modelId) return
    try {
      const [shopRes, modelRes] = await Promise.all([
        api.get(`/public/shops/${slug}`),
        api.get(`/public/shops/${slug}/models/${modelId}`),
      ])
      setShop(shopRes.data)
      setModel(modelRes.data.data)

      // Tracking : 1 seule fois par montage (StrictMode-safe)
      if (!trackedRef.current) {
        trackedRef.current = true
        track(slug, 'view_model', modelRes.data.data.id)
      }
    } catch (err) {
      console.error('Erreur chargement modèle :', err)
      setError('Modèle introuvable')
    } finally {
      setLoading(false)
    }
  }
  load()
}, [slug, modelId])

  if (loading) {
    return <Spinner fullScreen label="Chargement du modèle..." />
  }

  if (error || !shop || !model) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Modèle introuvable
          </h1>
          <p className="text-neutral-600 mb-6">
            Ce modèle n'existe pas ou n'est plus disponible.
          </p>
          <Link
            to={slug ? `/shops/${slug}` : '/'}
            className="btn-primary inline-block"
          >
            ← Retour à la boutique
          </Link>
        </div>
      </div>
    )
  }

  function whatsappLink() {
    if (!shop?.whatsapp || !model) return '#'
    const message = `Bonjour ${shop.name}, je suis intéressé(e) par le modèle "${model.name}"${model.reference ? ` (réf. ${model.reference})` : ''}.`
    const phone = shop.whatsapp.replace(/[^\d]/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  function handleWhatsAppClick() {
  if (slug && model) {
    track(slug, 'whatsapp_click', model.id)
  }
}

  const hasImages = model.images && model.images.length > 0

  return (
    <div className="min-h-screen bg-white">

      {/* Header sticky */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to={`/shops/${shop.slug}`}
            className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900 transition group"
          >
            <span className="text-lg leading-none group-hover:-translate-x-0.5 transition-transform">
              ←
            </span>
            <span className="font-medium">{shop.name}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* GALERIE */}
          <div className="lg:col-span-7">
            <div className="aspect-square bg-neutral-100 rounded-3xl overflow-hidden">
              {hasImages ? (
                <img
                  src={`/storage/${model.images[activeImage].path}`}
                  alt={model.images[activeImage].alt_text || model.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300 text-sm">
                  Aucune image
                </div>
              )}
            </div>

            {hasImages && model.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-3 sm:mt-4">
                {model.images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden transition-all ${
                      i === activeImage
                        ? 'ring-2 ring-neutral-900 ring-offset-2'
                        : 'ring-1 ring-neutral-200 hover:ring-neutral-400'
                    }`}
                  >
                    <img
                      src={`/storage/${img.path}`}
                      alt={img.alt_text || model.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFOS */}
          <div className="lg:col-span-5 space-y-8">

            <div className="space-y-3">
              {model.category && (
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-500">
                  {model.category.name}
                </p>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight tracking-tight">
                {model.name}
              </h1>
            </div>

            {model.price && (
              <div className="pb-6 border-b border-neutral-100">
                <p className="text-4xl font-semibold text-neutral-900">
                  {Number(model.price).toLocaleString('fr-FR')}
                  <span className="text-xl text-neutral-500 ml-2">
                    {model.currency}
                  </span>
                </p>
              </div>
            )}

            {model.description && (
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-500 mb-3">
                  Description
                </h3>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                  {model.description}
                </p>
              </div>
            )}

            {/* Attributs */}
            {(model.color || model.reference) && (
              <div className="grid grid-cols-2 gap-6 py-6 border-y border-neutral-100">
                {model.color && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1.5">
                      Couleur
                    </p>
                    <p className="text-sm font-medium text-neutral-900">
                      {model.color}
                    </p>
                  </div>
                )}
                {model.reference && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1.5">
                      Référence
                    </p>
                    <p className="text-sm font-medium text-neutral-900 font-mono">
                      {model.reference}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CTA WhatsApp */}
            {shop.whatsapp ? (
              <div className="space-y-3">
                <a
                  href={whatsappLink()}
                  onClick={handleWhatsAppClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Commander sur WhatsApp
                </a>
                <p className="text-xs text-neutral-500 text-center">
                  WhatsApp s'ouvrira avec un message prérempli.
                </p>
              </div>
            ) : (
              <div className="text-sm text-neutral-500 text-center py-6 bg-neutral-50 rounded-2xl">
                Contact WhatsApp non disponible
              </div>
            )}

          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-100 py-10 px-4 text-center">
        <p className="text-xs text-neutral-400">
          Propulsé par{' '}
          <span className="font-semibold text-neutral-700">
            SaaS Stylistes
          </span>
        </p>
      </footer>
    </div>
  )
}