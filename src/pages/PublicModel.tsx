import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'

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
      } catch {
        setError('Modèle introuvable')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, modelId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Chargement...</div>
      </div>
    )
  }

  if (error || !shop || !model) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Modèle introuvable
          </h1>
          <Link
            to={slug ? `/shops/${slug}` : '/'}
            className="text-neutral-600 underline"
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

  const hasImages = model.images && model.images.length > 0

  return (
    <div className="min-h-screen bg-white">
      {/* Header minimal */}
      <header className="border-b border-neutral-100 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to={`/shops/${shop.slug}`}
            className="text-sm text-neutral-600 hover:text-neutral-900 transition flex items-center gap-1"
          >
            <span className="text-lg leading-none">←</span>
            <span>{shop.name}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Galerie d'images */}
          <div>
            <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden">
              {hasImages ? (
                <img
                  src={`/storage/${model.images[activeImage].path}`}
                  alt={model.images[activeImage].alt_text || model.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  Sans image
                </div>
              )}
            </div>

            {/* Miniatures si plusieurs images */}
            {hasImages && model.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {model.images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      i === activeImage
                        ? 'border-neutral-900'
                        : 'border-transparent hover:border-neutral-300'
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

          {/* Informations */}
          <div className="space-y-6">

            <div>
              {model.category && (
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">
                  {model.category.name}
                </p>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
                {model.name}
              </h1>
            </div>

            {model.price && (
              <p className="text-3xl font-semibold text-neutral-900">
                {Number(model.price).toLocaleString('fr-FR')}{' '}
                <span className="text-lg text-neutral-500">{model.currency}</span>
              </p>
            )}

            {model.description && (
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                  {model.description}
                </p>
              </div>
            )}

            {/* Attributs */}
            <dl className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-100">
              {model.color && (
                <div>
                  <dt className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                    Couleur
                  </dt>
                  <dd className="text-sm font-medium text-neutral-900">{model.color}</dd>
                </div>
              )}
              {model.reference && (
                <div>
                  <dt className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                    Référence
                  </dt>
                  <dd className="text-sm font-medium text-neutral-900 font-mono">
                    {model.reference}
                  </dd>
                </div>
              )}
            </dl>

            {/* CTA WhatsApp */}
            {shop.whatsapp ? (
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Commander sur WhatsApp
              </a>
            ) : (
              <div className="text-sm text-neutral-500 text-center py-4 bg-neutral-50 rounded-lg">
                Contact WhatsApp non disponible
              </div>
            )}

            <p className="text-xs text-neutral-500 text-center">
              En cliquant, WhatsApp s'ouvrira avec un message prérempli.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-100 py-8 px-4 text-center">
        <p className="text-xs text-neutral-500">
          Propulsé par <span className="font-semibold text-neutral-700">SaaS Stylistes</span>
        </p>
      </footer>
    </div>
  )
}