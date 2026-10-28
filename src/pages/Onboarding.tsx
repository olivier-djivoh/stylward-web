import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "../components/Spinner";
import { Hand } from 'lucide-react'

type Step = 1 | 2 | 3;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    whatsapp: "",
  });

  // Si l'utilisateur a déjà une boutique → dashboard direct
  useEffect(() => {
    async function check() {
      try {
        const { data } = await api.get("/shop").catch(() => ({ data: null }));
        if (data) {
          navigate("/dashboard");
          return;
        }
      } finally {
        setChecking(false);
      }
    }
    check();
  }, [navigate]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateShop(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/shop", {
        name: form.name,
        description: form.description || null,
        whatsapp: form.whatsapp || null,
      });
      setStep(3);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const first = Object.values(err.response.data.errors)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError("Erreur lors de la création");
      }
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return <Spinner fullScreen label="Préparation..." />;
  }

  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* ═══ Barre de progression (haut) ═══ */}
      <div className="sticky top-0 z-30 bg-blanc-casse/90 backdrop-blur border-b border-pierre-200">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md overflow-hidden shrink-0">
                <img
                  src="/stylward-logo.svg"
                  alt="Stylward"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-pierre-500 font-medium">
                Configuration
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-pierre-400 font-mono">
              Étape {step} / 3
            </span>
          </div>

          {/* Barre */}
          <div className="h-1 bg-pierre-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-noir transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ═══ Contenu ═══ */}
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
        {/* ────── ÉTAPE 1 : Bienvenue ────── */}
        {step === 1 && (
          <div className="text-center space-y-8 animate-[fade-up_0.5s_ease-out]">
            {/* Icône */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg border border-pierre-100">
              <Hand className="w-10 h-10 text-dore animate-wave" strokeWidth={2} />
            </div>

            {/* Titre */}
            <div className="space-y-3">
              <h1 className="font-serif text-4xl sm:text-5xl text-noir leading-tight">
                Bienvenue {user?.first_name}.
              </h1>
              <p className="text-pierre-600 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
                Vous êtes à{" "}
                <span className="text-noir font-medium">2 minutes</span> de
                lancer votre vitrine en ligne.
              </p>
            </div>

            {/* Ce qu'on va faire */}
            <div className="bg-white rounded-2xl border border-pierre-200 p-6 text-left max-w-md mx-auto">
              <p className="text-[10px] uppercase tracking-[0.25em] text-pierre-400 font-medium mb-4">
                Au programme
              </p>
              <ul className="space-y-4">
                <BulletItem
                  number="1"
                  title="Créez votre vitrine"
                  description="Nom, description et WhatsApp"
                />
                <BulletItem
                  number="2"
                  title="Ajoutez votre première création"
                  description="Photo, prix, catégorie"
                />
                <BulletItem
                  number="3"
                  title="Partagez votre lien"
                  description="À vos clients sur WhatsApp"
                />
              </ul>
            </div>

            {/* CTA */}
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-noir text-blanc-casse text-sm font-medium rounded-full hover:bg-brun transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              Commencer
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <p className="text-xs text-pierre-400">
              Annulable à tout moment. Vous pouvez aussi le faire plus tard
              depuis votre tableau de bord.
            </p>
          </div>
        )}

        {/* ────── ÉTAPE 2 : Créer la vitrine ────── */}
        {step === 2 && (
          <div className="space-y-10 animate-[fade-up_0.5s_ease-out]">
            <div className="text-center space-y-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-pierre-400 font-medium">
                Étape 1 · Votre vitrine
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-noir leading-tight">
                Comment s'appelle votre maison ?
              </h1>
              <p className="text-pierre-500 text-sm max-w-md mx-auto">
                Ce nom sera visible par vos clients sur votre vitrine publique.
              </p>
            </div>

            <form
              onSubmit={handleCreateShop}
              className="space-y-6 max-w-md mx-auto"
            >
              {error && (
                <div className="p-4 rounded-[10px] bg-alerte-soft border border-alerte/20 text-alerte text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="input-label">Nom de la vitrine *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  maxLength={150}
                  autoFocus
                  className="input-field"
                  placeholder="Ex: Atelier Olivier"
                />
              </div>

              <div>
                <label className="input-label">Description courte</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="input-field resize-none"
                  placeholder="Couture sur mesure pour hommes et femmes..."
                />
                <p className="text-xs text-pierre-400 mt-1.5">
                  Une phrase pour présenter votre savoir-faire.
                </p>
              </div>

              <div>
                <label className="input-label">Numéro WhatsApp</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  className="input-field"
                  placeholder="+229 97 00 00 00"
                />
                <p className="text-xs text-pierre-400 mt-1.5">
                  Vos clients vous enverront leurs commandes ici.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-noir text-blanc-casse text-sm font-medium rounded-full hover:bg-brun transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-blanc-casse/30 border-t-blanc-casse rounded-full animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      Continuer
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-4 text-sm font-medium text-pierre-500 hover:text-noir transition-colors"
                >
                  Retour
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ────── ÉTAPE 3 : Succès ────── */}
        {step === 3 && (
          <div className="text-center space-y-8 animate-[fade-up_0.5s_ease-out]">
            {/* Check */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-succes-soft border border-succes/20">
              <svg
                className="w-10 h-10 text-succes"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-succes font-semibold">
                Bravo
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl text-noir leading-tight">
                Votre vitrine existe.
              </h1>
              <p className="text-pierre-600 text-base leading-relaxed max-w-md mx-auto">
                Il ne reste plus qu'à la remplir avec vos créations pour qu'elle
                soit prête à être partagée.
              </p>
            </div>

            {/* Carte boutique */}
            <div className="bg-white rounded-2xl border border-pierre-200 p-6 text-left max-w-md mx-auto">
              <p className="text-[10px] uppercase tracking-[0.25em] text-pierre-400 font-medium mb-3">
                Votre vitrine
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-noir flex items-center justify-center shrink-0">
                  <span className="font-serif text-lg text-blanc-casse leading-none pt-0.5">
                    {form.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-serif text-lg text-noir truncate">
                  {form.name}
                </p>
              </div>
              <span className="badge badge-neutre">Statut · Brouillon</span>
              <p className="text-xs text-pierre-400 mt-3 leading-relaxed">
                Votre vitrine est en brouillon. Vous pourrez la publier quand
                vos premières créations seront prêtes.
              </p>
            </div>

            {/* 2 options */}
            <div className="flex flex-col gap-3 max-w-md mx-auto pt-2">
              <Link
                to="/dashboard/models/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-noir text-blanc-casse text-sm font-medium rounded-full hover:bg-brun transition-all"
              >
                Ajouter ma première création
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-pierre-500 hover:text-noir transition-colors"
              >
                Passer pour l'instant → Voir mon tableau de bord
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function BulletItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-4">
      <div className="w-7 h-7 rounded-full bg-ivoire flex items-center justify-center shrink-0 border border-beige-soft">
        <span className="font-serif text-xs text-brun font-medium">
          {number}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-noir">{title}</p>
        <p className="text-xs text-pierre-500 mt-0.5">{description}</p>
      </div>
    </li>
  );
}
