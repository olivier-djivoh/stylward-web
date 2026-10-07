import { useEffect, useState } from 'react'
import { isFavorite, toggleFavorite, onFavoritesChanged } from '../lib/favorites'

interface Props {
  shopSlug: string
  modelId: string
  name: string
  image: string | null
  price: string | null
  currency: string
  variant?: 'card' | 'page'
}

export default function FavoriteButton({
  shopSlug,
  modelId,
  name,
  image,
  price,
  currency,
  variant = 'card',
}: Props) {
  const [active, setActive] = useState(isFavorite(modelId))

  // Sync avec les autres instances
  useEffect(() => {
  const unsubscribe = onFavoritesChanged(() => {
    setActive(isFavorite(modelId))
  })
  return () => {
    unsubscribe()
  }
}, [modelId])

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()  // Empêche la navigation si dans un Link
    e.stopPropagation()
    const newState = toggleFavorite({
      shopSlug,
      modelId,
      name,
      image,
      price,
      currency,
    })
    setActive(newState)
  }

  if (variant === 'page') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all border ${
          active
            ? 'bg-noir text-blanc-casse border-noir'
            : 'bg-transparent text-noir border-pierre-300 hover:border-noir'
        }`}
      >
        <HeartIcon filled={active} />
        {active ? 'Dans mes favoris' : 'Ajouter aux favoris'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 ${
        active
          ? 'bg-noir text-blanc-casse shadow-lg'
          : 'bg-white/95 backdrop-blur text-noir hover:bg-white shadow-sm'
      }`}
    >
      <HeartIcon filled={active} />
    </button>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}