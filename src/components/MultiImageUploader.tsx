import { ChangeEvent, DragEvent, useRef, useState } from 'react'
import { api } from '../lib/api'

interface Props {
  modelId: string
  onUploaded: (images: { id: string; path: string; type: string }[]) => void
}

interface PendingFile {
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'done' | 'error'
}

export default function MultiImageUploader({ modelId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [pending, setPending] = useState<PendingFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function addFiles(files: FileList | File[]) {
    setError('')
    const newPending: PendingFile[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setError('Seules les images sont acceptées.')
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Chaque image doit faire moins de 5 Mo.')
        continue
      }
      newPending.push({
        file,
        preview: URL.createObjectURL(file),
        status: 'pending',
      })
    }
    setPending((prev) => [...prev, ...newPending])
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }

  function removeAt(index: number) {
    setPending((prev) => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[index].preview)
      copy.splice(index, 1)
      return copy
    })
  }

  async function uploadAll() {
    if (pending.length === 0) return
    setUploading(true)
    setError('')

    const uploaded: { id: string; path: string; type: string }[] = []

    await Promise.all(
      pending.map(async (p, i) => {
        setPending((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, status: 'uploading' } : it))
        )
        try {
          const formData = new FormData()
          formData.append('image', p.file)
          formData.append('type', 'gallery')
          const { data } = await api.post(`/models/${modelId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          uploaded.push(data)
          setPending((prev) =>
            prev.map((it, idx) => (idx === i ? { ...it, status: 'done' } : it))
          )
        } catch {
          setPending((prev) =>
            prev.map((it, idx) => (idx === i ? { ...it, status: 'error' } : it))
          )
        }
      })
    )

    setUploading(false)
    if (uploaded.length > 0) onUploaded(uploaded)

    setTimeout(() => {
      setPending((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.preview))
        return []
      })
    }, 1500)
  }

  return (
    <div className="space-y-4">

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
          dragging
            ? 'border-noir bg-ivoire scale-[1.01]'
            : 'border-pierre-300 hover:border-noir hover:bg-ivoire/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleChange}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-full bg-ivoire flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-brun" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path d="M12 4v16m8-8H4" />
          </svg>
        </div>

        <p className="font-serif text-xl text-noir mb-1.5">
          Ajoutez vos photos
        </p>
        <p className="text-sm text-pierre-500">
          Glissez-déposez ou{' '}
          <span className="text-noir underline underline-offset-2">parcourez</span>
        </p>
        <p className="text-xs text-pierre-400 mt-3">
          JPG, PNG, WebP · 5 Mo max par image · plusieurs fichiers acceptés
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-alerte-soft border border-alerte/20 text-alerte text-xs">
          {error}
        </div>
      )}

      {/* Previews */}
      {pending.length > 0 && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {pending.map((p, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden bg-pierre-100"
              >
                <img src={p.preview} alt="" className="w-full h-full object-cover" />

                {p.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                {p.status === 'done' && (
                  <div className="absolute inset-0 bg-succes/30 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-succes flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                {p.status === 'error' && (
                  <div className="absolute inset-0 bg-alerte/30 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-alerte flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                )}

                {p.status === 'pending' && !uploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeAt(i)
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all"
                    aria-label="Retirer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {!uploading && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={uploadAll}
                className="btn-primary text-sm"
              >
                Téléverser {pending.length} image{pending.length > 1 ? 's' : ''}
              </button>
              <button
                type="button"
                onClick={() => {
                  pending.forEach((p) => URL.revokeObjectURL(p.preview))
                  setPending([])
                }}
                className="btn-ghost text-sm"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}