interface Props {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullScreen?: boolean
}

export default function Spinner({
  size = 'md',
  label,
  fullScreen = false,
}: Props) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses[size]} border-neutral-200 border-t-neutral-900 rounded-full animate-spin`}
      />
      {label && <p className="text-sm text-neutral-500">{label}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        {spinner}
      </div>
    )
  }

  return spinner
}