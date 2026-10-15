export interface FavoriteItem {
  shopSlug: string
  modelId: string
  name: string
  image: string | null
  price: string | null
  currency: string
  savedAt: string
}

const STORAGE_KEY = 'stylward_favorites'

export function getFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getFavoritesByShop(shopSlug: string): FavoriteItem[] {
  return getFavorites().filter((f) => f.shopSlug === shopSlug)
}

export function isFavorite(modelId: string): boolean {
  return getFavorites().some((f) => f.modelId === modelId)
}

export function addFavorite(item: Omit<FavoriteItem, 'savedAt'>): void {
  const favorites = getFavorites()
  if (favorites.some((f) => f.modelId === item.modelId)) return
  favorites.unshift({ ...item, savedAt: new Date().toISOString() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  emitFavoritesChanged()
}

export function removeFavorite(modelId: string): void {
  const favorites = getFavorites().filter((f) => f.modelId !== modelId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  emitFavoritesChanged()
}

export function toggleFavorite(item: Omit<FavoriteItem, 'savedAt'>): boolean {
  if (isFavorite(item.modelId)) {
    removeFavorite(item.modelId)
    return false
  }
  addFavorite(item)
  return true
}

export function getFavoritesCount(): number {
  return getFavorites().length
}

// Système d'événements pour synchroniser les composants
const listeners = new Set<() => void>()

export function emitFavoritesChanged() {
  listeners.forEach((fn) => fn())
}

export function onFavoritesChanged(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}