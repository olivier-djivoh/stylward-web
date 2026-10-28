import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import AuthLayout from '../components/AuthLayout'
import { CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/forgot-password', { email })
      setSent(true)
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Trop de tentatives. Patientez quelques minutes.')
      } else {
        setError(err.response?.data?.message || 'Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Mot de passe oublié."
      subtitle="Nous vous enverrons un lien pour le réinitialiser."
    >
      {sent ? (
        <div className="space-y-6">
          <div className="p-4 rounded-[10px] bg-succes-soft border border-succes/20 text-succes text-sm leading-relaxed flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Si un compte existe avec cette adresse, un email vient de vous être envoyé.
          </div>
          <p className="text-sm text-pierre-500 leading-relaxed">
            Vérifiez votre boîte de réception (et vos spams). Le lien est valable <strong>60 minutes</strong>.
          </p>
          <Link to="/login" className="btn-secondary w-full justify-center">
            Retour à la connexion
          </Link>
        </div>
      ) : (
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
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              className="input-field"
              placeholder="vous@exemple.com"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-blanc-casse/30 border-t-blanc-casse rounded-full animate-spin" />
                Envoi...
              </>
            ) : (
              'Envoyer le lien'
            )}
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
      )}
    </AuthLayout>
  )
}