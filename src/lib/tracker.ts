import { api } from './api'

type TrackEvent = 'view_shop' | 'view_model' | 'whatsapp_click'

/**
 * Envoie un événement de tracking.
 * Échoue silencieusement (ne casse jamais l'UX).
 */
export function track(
  shopSlug: string,
  event: TrackEvent,
  modelId?: string
) {
  // Fire-and-forget : on n'attend pas la réponse
  api
    .post(`/public/shops/${shopSlug}/track`, {
      event,
      model_id: modelId ?? null,
    })
    .catch(() => {
      // On ignore les erreurs : le tracking ne doit jamais bloquer
    })
}