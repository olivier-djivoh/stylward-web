import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import Spinner from '../components/Spinner'

export default function ConfirmDeletion() {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function confirm() {
      if (!token) return
      try {
        const { data } = await api.post(`/account/confirm-deletion/${token}`)
        setMessage(data.message || 'Votre compte sera supprimé dans 30 jours.')
        setStatus('success')
      } catch (err: any) {
        setMessage(err.response?.data?.message || 'Lien invalide ou expiré.')
        setStatus('error')
      }
    }
    confirm()
  }, [token])

  if (status === 'loading') {
    return <Spinner fullScreen label="Vérification..." />
  }

  return (
    <div className="min-h-screen bg-blanc-casse flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        {status === 'success' ? (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-succes-soft border border-succes/20 mb-6">
              <svg className="w-10 h-10 text-succes" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-overline text-succes mb-3">Confirmé</p>
            <h1 className="font-serif text-3xl text-noir mb-4">Suppression programmée</h1>
            <p className="text-pierre-600 leading-relaxed mb-8">{message}</p>
            <Link to="/login" className="btn-primary inline-block">Retour à la connexion</Link>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-alerte-soft border border-alerte/20 mb-6">
              <svg className="w-10 h-10 text-alerte" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="font-overline text-alerte mb-3">Erreur</p>
            <h1 className="font-serif text-3xl text-noir mb-4">Lien invalide</h1>
            <p className="text-pierre-600 leading-relaxed mb-8">{message}</p>
            <Link to="/" className="btn-secondary inline-block">Retour à l'accueil</Link>
          </>
        )}
      </div>
    </div>
  )
}