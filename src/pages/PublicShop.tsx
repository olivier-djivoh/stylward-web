import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { track } from '../lib/tracker'
import Spinner from '../components/Spinner'
import ScrollToTopButton from '../components/ScrollToTopButton'

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
  published_at: string | null
  category: { id: string; name: string; slug: string } | null
  images: { id: string; path: string; type: string }[]
}

export default function PublicShop() {
  const { slug } = useParams<{ slug: string }>()
  const [shop, setShop] = useState<Shop | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const trackedRef = useRef(false)

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

        if (!trackedRef.current) {
          trackedRef.current = true
          track(slug, 'view_shop')
        }
      } catch (err) {
        console.error('Erreur chargement boutique :', err)
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

  const filteredModels = models
  .filter((m) => !activeCategory || m.category?.id === activeCategory)
  .filter((m) => {
    if (!search.trim()) return true
    const q = search.toLowerCase().trim()
    return (
      m.name.toLowerCase().includes(q) ||
      (m.description?.toLowerCase().includes(q) ?? false) ||
      (m.color?.toLowerCase().includes(q) ?? false) ||
      (m.reference?.toLowerCase().includes(q) ?? false)
    )
  })
  .sort((a, b) => {
    if (sortBy === 'price_asc') {
      return Number(a.price ?? 0) - Number(b.price ?? 0)
    }
    if (sortBy === 'price_desc') {
      return Number(b.price ?? 0) - Number(a.price ?? 0)
    }
    // 'recent' : par date de publication
    const dateA = a.published_at ? new Date(a.published_at).getTime() : 0
    const dateB = b.published_at ? new Date(b.published_at).getTime() : 0
    return dateB - dateA
  })

  if (loading) {
    return <Spinner fullScreen label="Chargement..." />
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 mb-4">
            Erreur 404
          </p>
          <h1 className="font-serif text-4xl text-neutral-900 mb-3">
            Boutique introuvable
          </h1>
          <p className="text-neutral-500 text-sm">
            Cette boutique n'existe pas ou n'est plus active.
          </p>
        </div>
      </div>
    )
  }

  const whatsappNumber = shop.whatsapp?.replace(/[^\d]/g, '') || ''
  const waMessage = encodeURIComponent(
    `Bonjour ${shop.name}, je vous contacte depuis votre boutique en ligne.`
  )

  // Détecte si un modèle est "nouveau" (publié dans les 14 derniers jours)
  function isNew(model: Model): boolean {
    if (!model.published_at) return false
    const published = new Date(model.published_at).getTime()
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000
    return published > fourteenDaysAgo
  }

  return (
    <div className="min-h-screen bg-white selection:bg-neutral-900 selection:text-white">

      {/* ═══════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════ */}
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
                className="w-9 h-9 rounded-full object-cover ring-1 ring-neutral-200 shrink-0 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                <span className="font-serif text-sm text-white leading-none pt-0.5">
                  {shop.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-serif text-base sm:text-lg text-neutral-900 tracking-tight truncate">
              {shop.name}
            </span>
          </Link>

          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 hover:text-neutral-900 transition-colors shrink-0 ml-4 font-medium"
            >
              Contacter
            </a>
          )}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative bg-neutral-900 overflow-hidden">
        <div className="relative h-[75vh] min-h-[520px] max-h-[820px] overflow-hidden">
          {shop.cover_path ? (
            <img
              src={`/storage/${shop.cover_path}`}
              alt={shop.name}
              className="w-full h-full object-cover scale-105 animate-[slow-zoom_20s_ease-in-out_infinite_alternate]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
          )}

          {/* Overlay renforcé + dégradé progressif */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Contenu hero */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
            {/* Overline avec trait décoratif */}
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-white/40" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/80 font-medium">
                Maison de couture
              </p>
            </div>

            {/* Nom */}
            <h1 className="font-serif text-[2.5rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem] text-white leading-[0.98] tracking-tight max-w-4xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
              {shop.name}
            </h1>

            {/* Description */}
            {shop.description && (
              <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-xl mt-7 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                {shop.description}
              </p>
            )}

            {/* CTA hero : faire défiler */}
            {filteredModels.length > 0 && (
              <a
                href="#catalogue"
                className="inline-flex items-center gap-3 mt-10 text-white/90 text-xs uppercase tracking-[0.25em] font-medium border-b border-white/30 pb-1 hover:border-white hover:text-white transition-all"
              >
                Découvrir la collection
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CATALOGUE
          ═══════════════════════════════════════════ */}
      <section id="catalogue" className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">

        {/* En-tête section */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Ornement */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-8 h-px bg-neutral-300" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-medium">
              Collection
            </p>
            <span className="w-8 h-px bg-neutral-300" />
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl text-neutral-900 leading-tight">
            Nos créations
          </h2>

          <p className="text-neutral-500 text-sm mt-5 tracking-wide">
            {filteredModels.length} pièce{filteredModels.length > 1 ? 's' : ''}
            {activeCategory && (
              <span className="text-neutral-900">
                {' · '}
                {categories.find((c) => c.id === activeCategory)?.name}
              </span>
            )}
          </p>
        </div>

        {/* Filtres pilules */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2.5 mb-14 sm:mb-20">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2.5 rounded-full text-[12px] uppercase tracking-[0.12em] whitespace-nowrap transition-all duration-300 font-medium ${
                activeCategory === null
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
              }`}
            >
              Tout
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-[12px] uppercase tracking-[0.12em] whitespace-nowrap transition-all duration-300 font-medium ${
                  activeCategory === cat.id
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

                {/* Barre de recherche + tri */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-12 max-w-2xl mx-auto">

          {/* Recherche */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-pierre-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une création..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-pierre-200 rounded-full text-sm text-noir placeholder:text-pierre-400 focus:outline-none focus:border-noir focus:ring-2 focus:ring-noir/5 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-pierre-200 hover:bg-pierre-300 flex items-center justify-center transition"
                aria-label="Effacer"
              >
                <svg className="w-3 h-3 text-pierre-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Tri */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none w-full sm:w-auto pl-4 pr-10 py-3 bg-white border border-pierre-200 rounded-full text-sm text-noir focus:outline-none focus:border-noir focus:ring-2 focus:ring-noir/5 transition-all cursor-pointer"
            >
              <option value="recent">Plus récentes</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
            <svg
              className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-pierre-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Grille */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-neutral-200 rounded-3xl">
            <h3 className="font-serif text-2xl text-neutral-900 mb-3">
              {activeCategory ? 'Aucune pièce' : 'Collection à venir'}
            </h3>
            <p className="text-neutral-500 text-sm max-w-sm mx-auto">
              {search
                ? `Aucun résultat pour « ${search} ».`
                : activeCategory
                ? 'Cette catégorie est vide pour le moment.'
                : 'Le styliste prépare ses premières créations.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-14 sm:gap-x-8 sm:gap-y-20">
            {filteredModels.map((model, index) => (
              <Link
                key={model.id}
                to={`/shops/${shop.slug}/models/${model.id}`}
                className="group block animate-[fade-up_0.6s_ease-out_both]"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden rounded-xl mb-5">
                  {model.images?.[0] ? (
                    <img
                      src={`/storage/${model.images[0].path}`}
                      alt={model.name}
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[10px] uppercase tracking-[0.25em]">
                      Sans image
                    </div>
                  )}

                  {/* Badge "Nouveau" */}
                  {isNew(model) && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] font-semibold bg-white text-neutral-900 rounded-full shadow-sm">
                      Nouveau
                    </span>
                  )}

                  {/* Overlay discret au survol (desktop) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:flex items-end justify-center pb-5">
                    <span className="text-white text-[10px] uppercase tracking-[0.25em] font-medium">
                      Voir la pièce
                    </span>
                  </div>
                </div>

                {/* Infos */}
                <div className="space-y-1.5 px-0.5">
                  {model.category && (
                    <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 font-medium">
                      {model.category.name}
                    </p>
                  )}
                  <h3 className="font-serif text-lg sm:text-xl text-neutral-900 leading-tight tracking-tight group-hover:text-neutral-600 transition-colors">
                    {model.name}
                  </h3>
                  {model.price && (
                    <p className="text-neutral-500 text-sm pt-0.5">
                      {Number(model.price).toLocaleString('fr-FR')}{' '}
                      <span className="text-neutral-400 text-xs tracking-wider">
                        {model.currency}
                      </span>
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════
          CTA WHATSAPP
          ═══════════════════════════════════════════ */}
      {whatsappNumber && (
        <section className="bg-ivoire border-y border-beige-soft">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">

            {/* Ornement */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-8 h-px bg-brun/30" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-brun/70 font-medium">
                Une question ?
              </p>
              <span className="w-8 h-px bg-brun/30" />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-noir leading-tight mb-4 max-w-xl mx-auto">
              Discutons de votre projet
            </h2>
            <p className="text-brun/70 text-sm max-w-md mx-auto mb-10 leading-relaxed">
              Le styliste vous répondra directement sur WhatsApp pour toute
              commande ou demande personnalisée.
            </p>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-9 py-4 bg-noir text-blanc-casse text-sm tracking-wide font-medium rounded-full hover:bg-brun transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Commander sur WhatsApp
            </a>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="bg-white border-t border-neutral-100 py-10">
  <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
    <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-400">
      Propulsé par{' '}
      <span className="text-neutral-900 font-medium">SaaS Stylistes</span>
    </p>
  </div>
</footer>

 <ScrollToTopButton />

      {/* Animation keyframes injectées */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slow-zoom {
          from { transform: scale(1.05); }
          to { transform: scale(1.15); }
        }
      `}</style>

    </div>
  )
}