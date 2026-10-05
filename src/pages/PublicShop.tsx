import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import Spinner from '../components/Spinner'
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
  category: { id: string; name: string; slug: string } | null
  images: { id: string; path: string; type: string }[]
}

export default function PublicShop() {
  const { slug } = useParams<{ slug: string }>()
  const [shop, setShop] = useState<Shop | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!slug) return
      try {
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

  const categories = Array.from(
    new Map(
      models
        .filter((m) => m.category)
        .map((m) => [m.category!.id, m.category!])
    ).values()
  )

  const filteredModels = activeCategory
    ? models.filter((m) => m.category?.id === activeCategory)
    : models

  if (loading) {
  return <Spinner fullScreen label="Chargement de la boutique..." />
}

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
        <div className="text-center max-w-md">
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

  const initial = shop.name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* HERO */}
      <header className="relative">
        {/* Bandeau haut */}
        <div className="h-48 sm:h-64 relative overflow-hidden">
          {shop.cover_path ? (
            <img
              src={`/storage/${shop.cover_path}`}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
          )}
          {/* Overlay sombre pour la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Info boutique en chevauchement */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 relative">
          <div className="flex items-end gap-4 sm:gap-5">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white ring-4 ring-white shadow-xl overflow-hidden flex items-center justify-center shrink-0">
              {shop.logo_path ? (
                <img
                  src={`/storage/${shop.logo_path}`}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-5xl font-bold text-neutral-900">
                  {initial}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 sm:mt-6 space-y-2">
            <h1 className="text-2xl sm:text-4xl font-bold text-neutral-900 tracking-tight leading-tight">
              {shop.name}
            </h1>
            {shop.description && (
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                {shop.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* CATALOGUE */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Section header */}
        <div className="flex items-baseline justify-between mb-5 sm:mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-500">
            Catalogue
          </h2>
          <span className="text-xs text-neutral-400">
            {filteredModels.length} pièce{filteredModels.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Filtres */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeCategory === null
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-neutral-400'
              }`}
            >
              Tout
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-neutral-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Grille */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-white ring-1 ring-neutral-100">
            <p className="text-neutral-500 text-sm">
              {activeCategory
                ? 'Aucune pièce dans cette catégorie.'
                : 'Aucune pièce disponible pour le moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredModels.map((model) => (
              <Link
                key={model.id}
                to={`/shops/${shop.slug}/models/${model.id}`}
                className="group block"
              >
                {/* Image */}
                <div className="aspect-[3/4] bg-neutral-100 rounded-2xl overflow-hidden relative">
                  {model.images?.[0] ? (
                    <img
                      src={`/storage/${model.images[0].path}`}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">
                      Sans image
                    </div>
                  )}

                  {/* Badge catégorie */}
                  {model.category && (
                    <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-neutral-700 font-medium">
                      {model.category.name}
                    </span>
                  )}
                </div>

                {/* Texte */}
                <div className="mt-2.5 px-0.5">
                  <h3 className="font-medium text-neutral-900 text-sm leading-snug line-clamp-2">
                    {model.name}
                  </h3>
                  {model.price && (
                    <p className="text-neutral-900 font-semibold text-sm mt-1">
                      {Number(model.price).toLocaleString('fr-FR')}{' '}
                      <span className="text-neutral-500 font-normal">
                        {model.currency}
                      </span>
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-100 py-10 px-4 text-center bg-white">
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