import { ChangeEvent, useRef, useState } from 'react'
import { api } from '../lib/api'

interface Props {
  modelId: string
  onUploaded: (image: { id: string; path: string; type: string }) => void
}

export default function ImageUploader({ modelId, onUploaded }: Props) {
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
    formData.append('type', 'main')

    try {
      const { data } = await api.post(`/models/${modelId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onUploaded(data)
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
        className="text-xs text-neutral-600 hover:text-neutral-900 underline disabled:opacity-50"
      >
        {uploading ? 'Upload...' : 'Ajouter une image'}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}