import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthLayout from '../components/AuthLayout'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)

      // Rediriger selon le rôle
      // (on lit le rôle après login — il est dans le state)
      setTimeout(() => {
        const stored = localStorage.getItem('user')
        if (stored) {
          const u = JSON.parse(stored)
          navigate(u.role === 'admin' ? '/admin' : '/dashboard')
        } else {
          navigate('/dashboard')
        }
      }, 0)
    } catch (err: any) {
      if (err.response?.data?.errors?.email) {
        setError(err.response.data.errors.email[0])
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Bon retour."
      subtitle="Connectez-vous pour accéder à votre boutique."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-[10px] bg-alerte-soft border border-alerte/20 text-alerte text-sm animate-fade-up">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="input-label">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="input-field"
            placeholder="vous@exemple.com"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="password" className="text-sm font-medium text-pierre-700">
              Mot de passe
            </label>
            <a href="#" className="text-xs text-pierre-500 hover:text-noir transition">
              Oublié ?
            </a>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="input-field"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-blanc-casse/30 border-t-blanc-casse rounded-full animate-spin" />
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </button>

        <p className="text-center text-sm text-pierre-500 pt-2">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-noir font-medium hover:underline underline-offset-4">
            Créer votre boutique
          </Link>
        </p>
      </form>

      {/* Comptes de démo */}
      <div className="mt-10 p-4 rounded-[10px] bg-ivoire border border-beige-soft">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-brun mb-2">
          Comptes de démonstration
        </p>
        <div className="space-y-1 text-xs text-brun/80 font-mono">
          <p>olivier@demo.com · MotDePasse123!</p>
          <p>fatou@demo.com · MotDePasse123!</p>
          <p>kofi@demo.com · MotDePasse123!</p>
        </div>
      </div>
    </AuthLayout>
  )
}