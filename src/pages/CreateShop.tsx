import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function CreateShop() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    whatsapp: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/shop", {
        name: form.name,
        description: form.description || null,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
      });
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        setError(
          Array.isArray(firstError) ? firstError[0] : String(firstError),
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Une erreur est survenue");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-neutral-900">
            Créer ma vitrine
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Lancez votre vitrine en 1 minute
          </h2>
          <p className="text-neutral-600 text-sm">
            Votre vitrine aura un lien unique à partager avec vos clients sur
            WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nom de la vitrine *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              maxLength={150}
              className="input-field"
              placeholder="Ex: Atelier Grace"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Ce nom sera visible par vos clients.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              maxLength={2000}
              className="input-field"
              placeholder="Présentez votre savoir-faire, vos spécialités..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="input-field"
                placeholder="+229 97 00 00 00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                className="input-field"
                placeholder="+229 97 00 00 00"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Pour recevoir les commandes.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Création..." : "Créer ma vitrine"}
            </button>
          </div>

          <p className="text-xs text-neutral-500 text-center">
            Votre vitrine sera créée en brouillon. Vous pourrez l'activer quand
            vous serez prêt.
          </p>
        </form>
      </main>
    </div>
  );
}
