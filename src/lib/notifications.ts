// Système simple d'événements pour synchroniser le badge
const listeners = new Set<() => void>()

export function emitNotificationsChanged() {
  listeners.forEach((fn) => fn())
}

export function onNotificationsChanged(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}