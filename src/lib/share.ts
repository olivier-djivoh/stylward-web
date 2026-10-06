interface ShareOptions {
  title?: string
  text?: string
  url: string
}

/**
 * Ouvre le partage natif du système si disponible,
 * sinon fallback sur WhatsApp Web.
 */
export async function shareContent({ title, text, url }: ShareOptions): Promise<void> {
  // Détection : l'API Web Share est-elle disponible ?
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: title || undefined,
        text: text || undefined,
        url,
      })
      return
    } catch (err: any) {
      // L'utilisateur a annulé → on ne fait rien
      if (err?.name === 'AbortError') return
      // Autre erreur → fallback
    }
  }

  // Fallback : WhatsApp Web
  const message = [text, url].filter(Boolean).join('\n')
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
}

/**
 * Vérifie si le partage natif est disponible (utile pour afficher
 * un libellé différent selon la plateforme).
 */
export function canNativeShare(): boolean {
  return typeof navigator.share === 'function'
}