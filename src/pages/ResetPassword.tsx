import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import AuthLayout from '../components/AuthLayout'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [form, setForm] = useState({
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token || !email) {
      setError('Lien invalide ou incomplet.')
    }
  }, [token, email])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/reset-password', {
        token,
        email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Mot de passe mis à jour."
        subtitle="Vous pouvez maintenant vous connecter."
      >
        <div className="space-y-6">
          <div className="p-4 rounded-[10px] bg-succes-soft border border-succes/20 text-succes text-sm leading-relaxed">
            ✅ Votre mot de passe a été réinitialisé avec succès. Redirection...
          </div>
          <Link to="/login" className="btn-primary w-full justify-center">
            Se connecter maintenant
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Nouveau mot de passe."
      subtitle="Choisissez un mot de passe sécurisé."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-[10px] bg-alerte-soft border border-alerte/20 text-alerte text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="input-label">Adresse email</label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="input-field bg-pierre-50 text-pierre-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="password" className="input-label">Nouveau mot de passe</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={12}
            autoFocus
            autoComplete="new-password"
            className="input-field"
            placeholder="••••••••"
          />
          <p className="text-xs text-pierre-400 mt-1.5">
            12 caractères min · majuscule · minuscule · chiffre · caractère spécial.
          </p>
        </div>

        <div>
          <label htmlFor="password_confirmation" className="input-label">
            Confirmer le mot de passe
          </label>
          <input
            id="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            required
            autoComplete="new-password"
            className="input-field"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token || !email}
          className="btn-primary w-full"
        >
          {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
        </button>

        <p className="text-center text-sm text-pierre-500 pt-2">
          <Link
            to="/login"
            className="text-noir font-medium hover:underline underline-offset-4"
          >
            ← Retour à la connexion
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}