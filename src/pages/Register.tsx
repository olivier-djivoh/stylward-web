import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthLayout from '../components/AuthLayout'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
navigate('/onboarding')
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError))
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
      title="Créez votre univers."
      subtitle="Lancez votre boutique en quelques secondes. C'est gratuit."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-[10px] bg-alerte-soft border border-alerte/20 text-alerte text-sm animate-fade-up">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="first_name" className="input-label">Prénom</label>
            <input
              id="first_name"
              type="text"
              value={form.first_name}
              onChange={(e) => update('first_name', e.target.value)}
              required
              className="input-field"
              placeholder="Olivier"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="input-label">Nom</label>
            <input
              id="last_name"
              type="text"
              value={form.last_name}
              onChange={(e) => update('last_name', e.target.value)}
              required
              className="input-field"
              placeholder="Kouassi"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="input-label">Adresse email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            className="input-field"
            placeholder="vous@exemple.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="input-label">
            Téléphone <span className="text-pierre-400 font-normal">(optionnel)</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="input-field"
            placeholder="+229 97 00 00 00"
          />
        </div>

        <div>
          <label htmlFor="password" className="input-label">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            minLength={12}
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
            onChange={(e) => update('password_confirmation', e.target.value)}
            required
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
              Création...
            </>
          ) : (
            'Créer mon compte'
          )}
        </button>

        <p className="text-center text-sm text-pierre-500 pt-2">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-noir font-medium hover:underline underline-offset-4">
            Se connecter
          </Link>
        </p>
      </form>

      <p className="text-xs text-pierre-400 text-center mt-8">
        En créant un compte, vous acceptez nos{' '}
        <a href="#" className="underline underline-offset-2 hover:text-noir">
          conditions d'utilisation
        </a>.
      </p>
    </AuthLayout>
  )
}