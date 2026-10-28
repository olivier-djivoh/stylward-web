
import { FormEvent, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { useToast } from "../contexts/ToastContext";
import FormSkeleton from "../components/skeletons/FormSkeleton";
import { CheckCircle } from 'lucide-react'

export default function Settings() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout, refreshUser } = useAuth();

  const [pwdForm, setPwdForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonDetail, setDeleteReasonDetail] = useState("");
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deletionRequested, setDeletionRequested] = useState(false);

  const [profileForm, setProfileForm] = useState({
  first_name: user?.first_name || '',
  last_name: user?.last_name || '',
  email: user?.email || '',
  phone: user?.phone || '',
})
const [profileSaving, setProfileSaving] = useState(false)
const [profileError, setProfileError] = useState('')

function updateProfile(field: string, value: string) {
  setProfileForm(prev => ({ ...prev, [field]: value }))
}

async function handleProfileChange(e: FormEvent) {
  e.preventDefault()
  setProfileError('')
  setProfileSaving(true)
  try {
    await api.put('/profile', profileForm)
    toast.success('Profil mis à jour.')
    // Met à jour le contexte Auth
    // On va recharger /me pour être sûr
    const { data: freshUser } = await api.get('/me')
    localStorage.setItem('user', JSON.stringify(freshUser))
    // Si tu as un setUser dans le contexte, appelle-le ici
    await refreshUser() // solution simple pour rafraîchir
  } catch (err: any) {
    if (err.response?.data?.errors) {
      const first = Object.values(err.response.data.errors)[0]
      setProfileError(Array.isArray(first) ? first[0] : String(first))
    } else {
      toast.error('Erreur lors de la mise à jour')
    }
  } finally {
    setProfileSaving(false)
  }
}

  function updatePwd(field: string, value: string) {
    setPwdForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");
    setPwdSaving(true);
    try {
      await api.put("/password", pwdForm);
      toast.success(
        "Mot de passe mis à jour. Vos autres appareils ont été déconnectés.",
      );
      setPwdForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors)[0];
        setPwdError(Array.isArray(first) ? first[0] : String(first));
      } else {
        toast.error("Erreur lors du changement de mot de passe");
      }
    } finally {
      setPwdSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError("");
    setDeleteSaving(true);
    try {
      await api.post("/account/request-deletion", {
        password: deletePassword,
        reason: deleteReason || null,
        reason_detail: deleteReasonDetail || null,
      });
      setDeletionRequested(true);
    } catch (err: any) {
      // Log complet pour debug
      console.error("Erreur suppression:", err.response?.data || err);

      // Message détaillé
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors)[0];
        setDeleteError(Array.isArray(first) ? first[0] : String(first));
      } else if (err.response?.data?.message) {
        setDeleteError(err.response.data.message);
      } else if (err.response?.status) {
        setDeleteError(`Erreur ${err.response.status}`);
      } else {
        toast.error("Erreur réseau — vérifiez votre connexion");
      }
    } finally {
      setDeleteSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="font-overline text-pierre-500 mb-2">Mon compte</p>
        <h1 className="font-display text-3xl sm:text-4xl text-noir">
          Paramètres
        </h1>
      </div>

      <div className="max-w-2xl space-y-8">
        <section>
  <p className="font-overline text-pierre-500 mb-4">Informations personnelles</p>
  <form onSubmit={handleProfileChange} className="card space-y-5">
    {profileError && (
      <div className="p-3 rounded-[10px] bg-alerte-soft border border-alerte/20 text-alerte text-sm">
        {profileError}
      </div>
    )}

    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label className="input-label">Prénom</label>
        <input
          type="text"
          value={profileForm.first_name}
          onChange={(e) => updateProfile('first_name', e.target.value)}
          required
          maxLength={100}
          className="input-field"
        />
      </div>
      <div>
        <label className="input-label">Nom</label>
        <input
          type="text"
          value={profileForm.last_name}
          onChange={(e) => updateProfile('last_name', e.target.value)}
          required
          maxLength={100}
          className="input-field"
        />
      </div>
    </div>

    <div>
      <label className="input-label">Adresse email</label>
      <input
        type="email"
        value={profileForm.email}
        onChange={(e) => updateProfile('email', e.target.value)}
        required
        className="input-field"
      />
    </div>

    <div>
      <label className="input-label">Téléphone</label>
      <input
        type="tel"
        value={profileForm.phone}
        onChange={(e) => updateProfile('phone', e.target.value)}
        maxLength={30}
        className="input-field"
        placeholder="+229 97 00 00 00"
      />
    </div>

    <div className="pt-2">
      <button
        type="submit"
        disabled={profileSaving}
        className="btn-primary"
      >
        {profileSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </button>
    </div>
  </form>
</section>

        <section>
          <p className="font-overline text-pierre-500 mb-4">Sécurité</p>
          <form onSubmit={handlePasswordChange} className="card space-y-5">
            <div>
              <h3 className="font-serif text-lg text-noir mb-1">
                Changer mon mot de passe
              </h3>
              <p className="text-xs text-pierre-500">
                Par sécurité, vos autres appareils seront déconnectés.
              </p>
            </div>

            {pwdError && (
              <div className="p-3 rounded-[10px] bg-alerte-soft border border-alerte/20 text-alerte text-sm">
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="p-3 rounded-[10px] bg-succes-soft border border-succes/20 text-succes text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {pwdSuccess}
              </div>
            )}

            <div>
              <label className="input-label">Mot de passe actuel</label>
              <input
                type="password"
                value={pwdForm.current_password}
                onChange={(e) => updatePwd("current_password", e.target.value)}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="input-label">Nouveau mot de passe</label>
              <input
                type="password"
                value={pwdForm.password}
                onChange={(e) => updatePwd("password", e.target.value)}
                required
                minLength={12}
                className="input-field"
                placeholder="••••••••"
              />
              <p className="text-xs text-pierre-400 mt-1.5">
                12 caractères min · majuscule · minuscule · chiffre · spécial.
              </p>
            </div>
            <div>
              <label className="input-label">Confirmer</label>
              <input
                type="password"
                value={pwdForm.password_confirmation}
                onChange={(e) =>
                  updatePwd("password_confirmation", e.target.value)
                }
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pwdSaving}
                className="btn-primary"
              >
                {pwdSaving
                  ? "Enregistrement..."
                  : "Mettre à jour le mot de passe"}
              </button>
            </div>
          </form>
        </section>

        <section>
          <p className="font-overline text-alerte mb-4">Zone sensible</p>
          <div className="card border-alerte/20">
            {deletionRequested ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-succes-soft flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-succes"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg text-noir mb-2">
                  Demande enregistrée
                </h3>
                <p className="text-sm text-pierre-600 leading-relaxed max-w-md mx-auto">
                  Un email de confirmation a été envoyé à{" "}
                  <strong>{user?.email}</strong>. Cliquez sur le lien qu'il
                  contient pour finaliser la suppression.
                </p>
                <p className="text-xs text-pierre-400 mt-4">
                  Vérifiez vos spams si vous ne voyez rien dans les 5 minutes.
                </p>
              </div>
            ) : !deleteOpen ? (
              <>
                <h3 className="font-serif text-lg text-noir mb-1">
                  Supprimer mon compte
                </h3>
                <p className="text-sm text-pierre-600 leading-relaxed mb-5">
                  Cette action est <strong>définitive après 30 jours</strong>.
                  Votre vitrine sera désactivée immédiatement, mais vous pourrez
                  annuler en vous reconnectant.
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="w-full sm:w-auto text-sm font-medium text-alerte border border-alerte/30 hover:bg-alerte-soft rounded-[10px] py-2.5 px-5 transition-colors"
                >
                  Supprimer mon compte
                </button>
              </>
            ) : (
              <div className="space-y-4 p-4 rounded-xl bg-alerte-soft/40 border border-alerte/20">
                <p className="text-xs text-alerte font-medium uppercase tracking-[0.15em]">
                  Confirmation requise
                </p>
                <p className="text-sm text-pierre-700 leading-relaxed">
                  Nous vous enverrons un email pour confirmer. Votre vitrine
                  sera désactivée dès la confirmation.
                </p>

                {deleteError && (
                  <div className="p-3 rounded-lg bg-white border border-alerte/20 text-alerte text-xs">
                    {deleteError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-pierre-700 mb-1.5">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="input-field"
                    placeholder="Votre mot de passe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-pierre-700 mb-1.5">
                    Pourquoi partez-vous ?{" "}
                    <span className="text-pierre-400">(optionnel)</span>
                  </label>
                  <select
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="input-field"
                  >
                    <option value="">— Choisir —</option>
                    <option value="no_longer_needed">
                      Je n'en ai plus besoin
                    </option>
                    <option value="too_expensive">Trop cher</option>
                    <option value="missing_features">
                      Fonctionnalités manquantes
                    </option>
                    <option value="switched_tool">
                      Je suis passé à un autre outil
                    </option>
                    <option value="bug">Problème technique</option>
                    <option value="other">Autre raison</option>
                  </select>
                </div>

                {deleteReason && (
                  <div>
                    <label className="block text-xs font-medium text-pierre-700 mb-1.5">
                      Détails{" "}
                      <span className="text-pierre-400">(optionnel)</span>
                    </label>
                    <textarea
                      value={deleteReasonDetail}
                      onChange={(e) => setDeleteReasonDetail(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="input-field resize-none"
                      placeholder="Quelque chose à ajouter ?"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleteSaving || !deletePassword}
                    className="flex-1 text-sm font-medium text-white bg-alerte hover:opacity-90 rounded-[10px] py-2.5 transition disabled:opacity-40"
                  >
                    {deleteSaving ? "Envoi..." : "Demander la suppression"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteOpen(false);
                      setDeletePassword("");
                      setDeleteReason("");
                      setDeleteReasonDetail("");
                      setDeleteError("");
                    }}
                    className="btn-ghost text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
