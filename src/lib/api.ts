
import axios from 'axios'

// Récupère l'URL de l'API (ex: https://stylward-api.onrender.com/api/v1)
const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

// Crée l'URL de base pour les images en enlevant le '/api/v1'
export const STORAGE_URL = API_URL.replace('/api/v1', '') + '/storage'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Ajoute automatiquement le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Force la revalidation sur les routes publiques
  if (config.url?.startsWith('/public/')) {
    config.headers['Cache-Control'] = 'no-cache'
  }
  
  return config
})

// Gère les réponses : si 401, on déconnecte
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname

      // On ne redirige PAS sur ces pages :
      // - login / register : déjà en train de se connecter
      // - account/deletion/confirm/... : page publique de confirmation
      const isAuthPage =
          currentPath === '/login' ||
          currentPath === '/register' ||
          currentPath === '/forgot-password' ||
          currentPath === '/reset-password'
      const isConfirmPage = currentPath.startsWith('/account/deletion/confirm/')

      if (!isAuthPage && !isConfirmPage) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)