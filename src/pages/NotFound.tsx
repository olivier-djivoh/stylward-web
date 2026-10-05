import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-neutral-200 leading-none mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Page introuvable
        </h1>
        <p className="text-neutral-600 mb-8">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary text-sm py-2.5 px-6">
            Retour au tableau de bord
          </Link>
          <Link to="/" className="btn-secondary text-sm py-2.5 px-6">
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}