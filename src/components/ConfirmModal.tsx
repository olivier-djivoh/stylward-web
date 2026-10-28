import { AlertTriangle, HelpCircle } from 'lucide-react'

interface Props {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Fond sombre */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
        onClick={onCancel}
      />

      {/* Boîte de dialogue */}
      <div className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-[pop-in_0.3s_cubic-bezier(0.22,1,0.36,1)]">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              variant === 'danger' ? 'bg-alerte-soft text-alerte' : 'bg-ivoire text-brun'
            }`}>
              {variant === 'danger' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <HelpCircle className="w-6 h-6" />
              )}
            </div>
            <h3 className="font-display text-xl text-noir leading-tight">
              {title}
            </h3>
          </div>

          <p className="text-sm text-pierre-600 leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn-ghost text-sm"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`${
                variant === 'danger' ? 'btn-primary bg-alerte hover:bg-alerte/90 border-alerte' : 'btn-primary'
              } text-sm`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}