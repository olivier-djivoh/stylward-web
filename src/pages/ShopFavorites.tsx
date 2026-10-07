import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import Spinner from '../components/Spinner'
import {
  getFavoritesByShop,
  onFavoritesChanged,
} from '../lib/favorites'
import type { FavoriteItem } from '../lib/favorites'

interface Shop {
  name: string
  slug: string
  logo_path: string | null
}

export default function ShopFavorites() {
  const { slug } = useParams<{ slug: string }>()
  const [shop, setShop] = useState<Shop | null>(null)
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  async function load() {
    if (!slug) return
    try {
      const { data } = await api.get(`/public/shops/${slug}`)
      setShop(data)
      setFavorites(getFavoritesByShop(slug))
    } finally {
      setLoading(false)
    }
  }
  load()

  const unsubscribe = onFavoritesChanged(() => {
    if (slug) setFavorites(getFavoritesByShop(slug))
  })
  return () => {
    unsubscribe()
  }
}, [slug])

  if (loading) {
    return <Spinner fullScreen label="Chargement..." />
  }

  if (!shop) return null

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between">
          <Link
            to={`/shops/${shop.slug}`}
            className="flex items-center gap-3 min-w-0 group"
          >
            {shop.logo_path ? (
              <img
                src={`/storage/${shop.logo_path}`}
                alt={shop.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-neutral-200 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
                <span className="font-serif text-sm text-white leading-none pt-0.5">
                  {shop.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-serif text-base sm:text-lg text-neutral-900 tracking-tight truncate">
              {shop.name}
            </span>
          </Link>

          <Link
            to={`/shops/${shop.slug}`}
            className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 hover:text-neutral-900 transition-colors shrink-0 ml-4 font-medium"
          >
            ← Collection
          </Link>
        </div>
      </nav>

      {/* Contenu */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">

        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-8 h-px bg-pierre-300" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-pierre-400 font-medium">
              Mes favoris
            </p>
            <span className="w-8 h-px bg-pierre-300" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900">
            Vos coups de cœur
          </h1>
          <p className="text-neutral-500 text-sm mt-4">
            {favorites.length} création{favorites.length > 1 ? 's' : ''} sauvegardée
            {favorites.length > 1 ? 's' : ''}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-pierre-200 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-pierre-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-pierre-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-noir mb-2">
              Aucun favori pour l'instant
            </h3>
            <p className="text-pierre-500 text-sm mb-6 max-w-sm mx-auto">
              Cliquez sur le cœur d'une création pour la sauvegarder ici.
            </p>
            <Link to={`/shops/${shop.slug}`} className="btn-primary inline-block">
              Voir la collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12 sm:gap-x-8 sm:gap-y-16">
            {favorites.map((f) => (
              <Link
                key={f.modelId}
                to={`/shops/${shop.slug}/models/${f.modelId}`}
                className="group block"
              >
                <div className="aspect-[3/4] bg-pierre-100 rounded-xl overflow-hidden relative mb-4">
                  {f.image ? (
                    <img
                      src={`/storage/${f.image}`}
                      alt={f.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-pierre-300 text-xs">
                      Sans image
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-lg text-neutral-900 leading-snug mb-1">
                  {f.name}
                </h3>
                {f.price && (
                  <p className="text-neutral-500 text-sm">
                    {Number(f.price).toLocaleString('fr-FR')}{' '}
                    <span className="text-neutral-400">{f.currency}</span>
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

      </main>

    </div>
  )
}