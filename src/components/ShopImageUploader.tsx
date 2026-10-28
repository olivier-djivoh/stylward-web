import { ChangeEvent, useRef, useState } from 'react'
import { api } from '../lib/api'
import { STORAGE_URL } from '../lib/api'

interface Props {
  type: 'logo' | 'cover'
  currentUrl: string | null
  onUploaded: (path: string) => void
  label: string
  hint?: string
}

export default function ShopImageUploader({
  type,
  currentUrl,
  onUploaded,
  label,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const { data } = await api.post(`/shop/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const path = type === 'logo' ? data.logo_path : data.cover_path
      onUploaded(path)
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError))
      } else {
        setError('Erreur lors de l\'upload')
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-neutral-700 mb-1">{label}</p>
      {hint && <p className="text-xs text-neutral-500 mb-2">{hint}</p>}

      <div className="flex items-center gap-3">
        {currentUrl ? (
          <div
            className={`${
              type === 'logo' ? 'w-16 h-16 rounded-xl' : 'w-32 h-16 rounded-lg'
            } bg-neutral-100 overflow-hidden shrink-0`}
          >
            <img
              src={`${STORAGE_URL}/${currentUrl}`}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`${
              type === 'logo' ? 'w-16 h-16 rounded-xl' : 'w-32 h-16 rounded-lg'
            } bg-neutral-100 flex items-center justify-center text-xs text-neutral-400 shrink-0`}
          >
            Aucune
          </div>
        )}

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-neutral-900 underline hover:no-underline disabled:opacity-50"
          >
            {uploading ? 'Upload...' : currentUrl ? 'Changer' : 'Ajouter'}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}