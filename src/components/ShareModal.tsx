import { useEffect, useState } from 'react'
import { generateShareImage, ShareImageData } from '../lib/shareImage'
import Spinner from './Spinner'

interface Props {
  data: ShareImageData
  onClose: () => void
}

export default function ShareModal({ data, onClose }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let currentUrl: string | null = null

    async function generate() {
      try {
        const b = await generateShareImage(data)
        currentUrl = URL.createObjectURL(b)
        setBlob(b)
        setImageUrl(currentUrl)
      } catch (e) {
        console.error(e)
        setError('Erreur lors de la génération de l\'image')
      } finally {
        setLoading(false)
      }
    }
    generate()

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl)
    }
  }, [data])

  function download() {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `${data.modelName.toLowerCase().replace(/\s+/g, '-')}.png`
    a.click()
  }

  async function shareNative() {
    if (!blob) return
    const file = new File([blob], 'creation.png', { type: 'image/png' })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: data.modelName,
          text: `Découvrez "${data.modelName}" chez ${data.shopName}`,
        })
      } catch {
        // Annulé par l'utilisateur
      }
    } else {
      // Fallback : téléchargement
      download()
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-[pop-in_0.3s_cubic-bezier(0.22,1,0.36,1)]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-pierre-100 flex items-center justify-between">
          <div>
            <p className="font-overline text-pierre-500">Partage</p>
            <h3 className="font-display text-xl text-noir">Votre création</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-pierre-400 hover:text-noir transition"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Aperçu */}
        <div className="p-6 bg-pierre-50">
          <div className="aspect-square bg-pierre-100 rounded-2xl overflow-hidden mx-auto max-w-xs shadow-lg">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Spinner label="Génération..." />
              </div>
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center text-alerte text-sm px-6 text-center">
                {error}
              </div>
            ) : (
              <img
                src={imageUrl!}
                alt="Aperçu du partage"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <p className="text-xs text-pierre-500 text-center mt-4">
            Format <strong>1080×1080</strong> — Prêt pour Instagram &amp; TikTok
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-2">
          <button
            onClick={shareNative}
            disabled={!blob}
            className="btn-primary w-full justify-center disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Partager l'image
          </button>

          <button
            onClick={download}
            disabled={!blob}
            className="btn-secondary w-full justify-center disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger
          </button>
        </div>

      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}