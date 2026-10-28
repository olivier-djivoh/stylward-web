import { createContext, useContext, useState, useRef, ReactNode } from 'react'
import ConfirmModal from '../components/ConfirmModal'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }

  const handleConfirm = () => {
    resolver.current?.(true)
    setIsOpen(false)
  }

  const handleCancel = () => {
    resolver.current?.(false)
    setIsOpen(false)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <ConfirmModal
          {...options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm doit être utilisé dans un ConfirmProvider')
  return ctx.confirm
}