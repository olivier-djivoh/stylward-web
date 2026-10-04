import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'

interface Shop {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  whatsapp: string | null
  logo_path: string | null
  cover_path: string | null
}

interface Model {
  id: string
  name: string
  description: string | null
  price: string | null
  currency: string
  color: string | null
  status: string
  images: { id: string; path: string; type: string }[]
}

export default function PublicShop() {
  const { slug } = useParams<{ slug: string }>()
  const [shop, setShop] = useState<Shop | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!slug) return
      try {
        // Force le rechargement en ajoutant un paramètre unique
        const cacheBuster = `?t=${Date.now()}`
        const [shopRes, modelsRes] = await Promise.all([
          api.get(`/public/shops/${slug}`),
          api.get(`/public/shops/${slug}/models`),
        ])
        setShop(shopRes.data)
        setModels(modelsRes.data.data || [])
      } catch {
        setError('Boutique introuvable')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Chargement...</div>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Boutique introuvable
          </h1>
          <p className="text-neutral-500">
            Cette boutique n'existe pas ou n'est plus active.
          </p>
        </div>
      </div>
    )
  }

  function whatsappLink(model: Model) {
    if (!shop?.whatsapp) return '#'
    const message = `Bonjour ${shop.name}, je suis intéressé(e) par le modèle "${model.name}".`
    const phone = shop.whatsapp.replace(/[^\d]/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header boutique */}
      <header className="relative">
        {/* Couverture */}
        <div className="h-40 sm:h-56 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700">
          {shop.cover_path && (
            <img
              src={`/storage/${shop.cover_path}`}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Logo + nom */}
        <div className="max-w-4xl mx-auto px-4 -mt-12 relative">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
              {shop.logo_path ? (
                <img
                  src={`/storage/${shop.logo_path}`}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-neutral-900">
                  {shop.name.charAt(0)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
              {shop.name}
            </h1>
            {shop.description && (
              <p className="text-neutral-600 mt-2 text-sm sm:text-base leading-relaxed">
                {shop.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Catalogue */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-lg font-bold text-neutral-900">
            Nos modèles
          </h2>
          <span className="text-sm text-neutral-500">
            {models.length} création{models.length > 1 ? 's' : ''}
          </span>
        </div>

        {models.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            Aucun modèle disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {models.map((model) => (
              <div
                key={model.id}
                className="group bg-white rounded-xl overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                  {model.images?.[0] ? (
                    <img
                      src={`/storage/${model.images[0].path}`}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                      Sans image
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="font-medium text-neutral-900 text-sm sm:text-base truncate">
                    {model.name}
                  </h3>
                  {model.price && (
                    <p className="text-neutral-900 font-semibold text-sm mt-1">
                      {Number(model.price).toLocaleString('fr-FR')} {model.currency}
                    </p>
                  )}
                  {model.color && (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {model.color}
                    </p>
                  )}

                  {shop.whatsapp && (
                    <a
                      href={whatsappLink(model)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-1 w-full py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Commander
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8 px-4 text-center">
        <p className="text-xs text-neutral-500">
          Propulsé par <span className="font-semibold text-neutral-700">SaaS Stylistes</span>
        </p>
      </footer>
    </div>
  )
}