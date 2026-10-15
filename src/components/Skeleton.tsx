import { CSSProperties } from 'react'

interface Props {
  className?: string
  style?: CSSProperties
}

/**
 * Bloc gris animé utilisé pour construire des skeleton loaders.
 */
export default function Skeleton({ className = '', style }: Props) {
  return (
    <div
      className={`bg-pierre-100 rounded-md animate-[skeleton-pulse_1.5s_ease-in-out_infinite] ${className}`}
      style={style}
    />
  )
}