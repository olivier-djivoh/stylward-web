import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface Props {
  children: ReactNode
}

export default function PageTransition({ children }: Props) {
  const location = useLocation()

  return (
    <div
  key={location.pathname}
  className="animate-[page-enter_0.3s_ease-out]"
>
      {children}
    </div>
  )
}