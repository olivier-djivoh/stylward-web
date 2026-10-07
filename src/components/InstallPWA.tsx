import { useEffect, useState } from 'react'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Vérifie si déjà installé ou déjà refusé
    const wasDismissed = localStorage.getItem('pwa_dismissed')
    if (wasDismissed) {
      setDismissed(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!wasDismissed) {
        setShow(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  function dismiss() {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('pwa_dismissed', 'true')
  }

  if (!show || dismissed || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-40 animate-[slide-up_0.4s_ease-out]">
      <div className="bg-noir text-blanc-casse rounded-2xl shadow-2xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blanc-casse flex items-center justify-center shrink-0">
          <span className="font-serif text-lg text-noir leading-none pt-0.5">S</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-0.5">Installer l'application</p>
          <p className="text-xs text-blanc-casse/70 leading-snug">
            Accédez plus rapidement à vos boutiques préférées.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={install}
              className="text-xs font-medium px-3 py-1.5 bg-blanc-casse text-noir rounded-full hover:bg-beige transition"
            >
              Installer
            </button>
            <button
              onClick={dismiss}
              className="text-xs text-blanc-casse/60 hover:text-blanc-casse px-2 py-1.5 transition"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="text-blanc-casse/50 hover:text-blanc-casse transition shrink-0"
          aria-label="Fermer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}