import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Rediriger selon le rôle
      const result: any = await login(email, password);

      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        const isAdmin = u.role === "admin";

        const base = isAdmin ? "/admin" : "/dashboard";
        const url = result?.pendingDeletion
          ? `${base}?pendingDeletion=1`
          : base;

        navigate(url);
        return;
      }

      // Fallback (ne devrait pas arriver)
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.data?.errors?.email) {
        setError(err.response.data.errors.email[0]);
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
    <AuthLayout
      title="Bon retour."
      subtitle="Connectez-vous pour accéder à votre vitrine."
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
            <label
              htmlFor="password"
              className="text-sm font-medium text-pierre-700"
            >
              Mot de passe
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-pierre-500 hover:text-noir transition"
            >
              Oublié ?
            </Link>
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

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-blanc-casse/30 border-t-blanc-casse rounded-full animate-spin" />
              Connexion...
            </>
          ) : (
            "Se connecter"
          )}
        </button>

        <p className="text-center text-sm text-pierre-500 pt-2">
          Pas encore de compte ?{" "}
          <Link
            to="/register"
            className="text-noir font-medium hover:underline underline-offset-4"
          >
            Créer votre vitrine
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
