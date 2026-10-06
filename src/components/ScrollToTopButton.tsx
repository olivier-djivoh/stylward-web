import { useEffect, useState } from 'react'

interface Props {
  threshold?: number
}

export default function ScrollToTopButton({ threshold = 400 }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > threshold)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Revenir en haut"
      className={`fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-50
        w-11 h-11 sm:w-12 sm:h-12
        rounded-full
        bg-neutral-900 text-white
        shadow-lg shadow-black/10
        flex items-center justify-center
        transition-all duration-300 ease-out
        hover:bg-neutral-800 hover:shadow-xl hover:-translate-y-1
        active:scale-95
        ${visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}