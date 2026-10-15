import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import DashboardLayout from "../components/DashboardLayout";
import Spinner from "../components/Spinner";
import ShopImageUploader from "../components/ShopImageUploader";
import { useToast } from "../contexts/ToastContext";
import DashboardSkeleton from "../components/skeletons/DashboardSkeleton";

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsapp: string | null;
  status: string;
  logo_path: string | null;
  cover_path: string | null;
}

interface Model {
  id: string;
  name: string;
  slug: string;
  price: string | null;
  currency: string;
  status: string;
  images: { id: string; path: string }[];
}

interface ShopStats {
  views: {
    this_week: number;
    last_week: number;
    total: number;
    evolution: number | null;
  };
  visitors: {
    this_week: number;
    last_week: number;
    total: number;
    evolution: number | null;
  };
  whatsapp_clicks: {
    this_week: number;
    last_week: number;
    evolution: number | null;
  };
  top_models: { id: string; name: string; views: number; visitors: number }[];
  daily_views: { date: string; label: string; count: number }[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [showDeletionBanner, setShowDeletionBanner] = useState(
    searchParams.get("pendingDeletion") === "1",
  );
  const [shop, setShop] = useState<Shop | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoredMessage, setRestoredMessage] = useState(false);
  const toast = useToast();

  async function loadData() {
    try {
      const shopRes = await api.get("/shop").catch(() => ({ data: null }));
      setShop(shopRes.data);

      if (shopRes.data) {
        const [modelsRes, statsRes] = await Promise.all([
          api.get("/models").catch(() => ({ data: { data: [] } })),
          api.get("/shop/stats").catch(() => ({ data: null })),
        ]);
        setModels(modelsRes.data.data || []);
        setStats(statsRes.data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleActivate() {
    try {
      const { data } = await api.patch("/shop/activate");
      setShop(data);
    } catch {
      toast.error("Erreur lors de l'activation");
    }
  }

  function handleShopImageUpdated(
    field: "logo_path" | "cover_path",
    path: string,
  ) {
    setShop((prev) => (prev ? { ...prev, [field]: path } : prev));
  }

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const publishedCount = models.filter((m) => m.status === "published").length;
  const draftCount = models.filter((m) => m.status !== "published").length;
  const recentModels = models.slice(0, 4);

  return (
    <DashboardLayout>
      {/* ═══ Message de restauration ═══ */}
      {restoredMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-succes-soft border border-succes/20">
          <p className="text-sm font-medium text-succes">
            ✅ Votre compte a été restauré. Votre vitrine est de nouveau en
            ligne.
          </p>
        </div>
      )}

      {/* ═══ Bannière suppression ═══ */}
      {showDeletionBanner && (
        <div className="mb-6 p-4 rounded-2xl bg-alerte-soft border border-alerte/20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-alerte mb-1">
                ⚠️ Votre compte est en cours de suppression
              </p>
              <p className="text-xs text-pierre-600 leading-relaxed">
                Votre vitrine est désactivée et vos données seront supprimées
                définitivement. Vous pouvez annuler à tout moment.
              </p>
            </div>
            <button
              onClick={async () => {
                if (!confirm("Restaurer votre compte ?")) return;
                try {
                  await api.post("/account/cancel-deletion");
                  setShowDeletionBanner(false);
                  setRestoredMessage(true);
                  navigate("/dashboard", { replace: true });

                  // Recharge les données de la vitrine
                  await loadData();

                  setTimeout(() => setRestoredMessage(false), 5000);
                } catch {
                  alert("Erreur");
                }
              }}
              className="btn-primary text-sm shrink-0"
            >
              Restaurer mon compte
            </button>
          </div>
        </div>
      )}

      {/* ═══ Salutation ═══ */}
      <div className="mb-10">
        <p className="font-overline text-pierre-500 mb-2">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="font-display text-4xl text-noir">
          Bonjour {user?.first_name} 👋
        </h1>
        <p className="text-pierre-500 mt-2">
          {shop
            ? "Voici un aperçu de votre activité."
            : "Commençons par créer votre vitrine."}
        </p>
      </div>

      {/* ═══ Cas 1 : pas de boutique ═══ */}
      {!shop && (
        <div className="card max-w-xl">
          <h2 className="font-display text-2xl text-noir mb-3">
            Créez votre vitrine
          </h2>
          <p className="text-pierre-500 text-sm mb-6 leading-relaxed">
            Votre vitrine est votre vitrine. Elle aura un lien unique à partager
            avec vos clients sur WhatsApp.
          </p>
          <Link to="/dashboard/shop/new" className="btn-primary">
            Créer ma vitrine
          </Link>
        </div>
      )}

      {/* ═══ Cas 2 : boutique existante ═══ */}
      {shop && (
        <div className="space-y-8">
          {/* Raccourcis */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Carte boutique */}
            <div className="card relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-overline text-pierre-500 mb-1">
                    Ma vitrine
                  </p>
                  <h3 className="font-display text-xl text-noir">
                    {shop.name}
                  </h3>
                </div>
                {shop.status === "active" ? (
                  <span className="badge badge-succes">En ligne</span>
                ) : (
                  <span className="badge badge-neutre">Brouillon</span>
                )}
              </div>

              <p className="text-xs text-pierre-400 font-mono mb-4 truncate">
                /shops/{shop.slug}
              </p>

              <div className="flex gap-2">
                {shop.status === "active" ? (
                  <>
                    <a
                      href={`/shops/${shop.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm flex-1"
                    >
                      Voir
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/shops/${shop.slug}`,
                        );
                        toast.success("Lien de la vitrine copié !");
                      }}
                      className="btn-primary text-sm flex-1"
                    >
                      Copier le lien
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleActivate}
                    className="btn-primary text-sm w-full"
                  >
                    Activer la vitrine
                  </button>
                )}
              </div>
            </div>

            {/* Stats rapides */}
            {stats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <p className="font-overline text-pierre-500 mb-2">Vues</p>
                  <p className="text-3xl font-display text-noir">
                    {stats.views.total}
                  </p>
                  <p className="text-xs text-pierre-400 mt-1">au total</p>
                </div>
                <div className="card">
                  <p className="font-overline text-pierre-500 mb-2">
                    Spectateurs
                  </p>
                  <p className="text-3xl font-display text-noir">
                    {stats.visitors.total}
                  </p>
                  <p className="text-xs text-pierre-400 mt-1">uniques</p>
                </div>
                <div className="card">
                  <p className="font-overline text-pierre-500 mb-2">
                    Créations
                  </p>
                  <p className="text-3xl font-display text-noir">
                    {models.length}
                  </p>
                  <p className="text-xs text-pierre-400 mt-1">
                    {publishedCount} publiée{publishedCount > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="card">
                  <p className="font-overline text-pierre-500 mb-2">Contacts</p>
                  <p className="text-3xl font-display text-noir">
                    {stats.whatsapp_clicks.this_week}
                  </p>
                  <p className="text-xs text-pierre-400 mt-1">cette semaine</p>
                </div>
              </div>
            )}
          </div>

          {/* Graphique 7 jours */}
          {stats && stats.daily_views.length > 0 && (
            <div className="card">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <p className="font-overline text-pierre-500 mb-1">Activité</p>
                  <h3 className="font-display text-xl text-noir">
                    7 derniers jours
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-display text-noir">
                    {stats.views.this_week}
                  </p>
                  <p className="text-xs text-pierre-400">vues cette semaine</p>
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 h-32">
                {stats.daily_views.map((day) => {
                  const max = Math.max(
                    ...stats.daily_views.map((d) => d.count),
                    1,
                  );
                  const height = (day.count / max) * 100;
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <span className="text-[10px] text-pierre-400 font-medium">
                        {day.count > 0 ? day.count : ""}
                      </span>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full bg-noir rounded-t-sm transition-all duration-500"
                          style={{ height: `${Math.max(height, 3)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-pierre-400 capitalize">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dernières créations */}
          <div>
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="font-overline text-pierre-500 mb-1">Catalogue</p>
                <h2 className="font-display text-2xl text-noir">
                  Dernières créations
                </h2>
              </div>
              <Link
                to="/dashboard/models"
                className="text-sm text-pierre-500 hover:text-noir transition"
              >
                Voir tout →
              </Link>
            </div>

            {recentModels.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-pierre-500 text-sm mb-4">
                  Vous n'avez pas encore ajouté de création.
                </p>
                <Link
                  to="/dashboard/models/new"
                  className="btn-primary inline-flex"
                >
                  Ajouter ma première création
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentModels.map((model) => (
                  <Link
                    key={model.id}
                    to={`/dashboard/models/${model.id}`}
                    className="group"
                  >
                    <div className="aspect-[3/4] bg-pierre-100 rounded-xl overflow-hidden relative">
                      {model.images?.[0] ? (
                        <img
                          src={`/storage/${model.images[0].path}`}
                          alt={model.name}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-pierre-300 text-xs">
                          Sans image
                        </div>
                      )}
                      {model.status === "published" && (
                        <span className="absolute top-2 left-2 badge badge-succes text-[10px] py-0.5">
                          En ligne
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-noir truncate">
                        {model.name}
                      </p>
                      {model.price && (
                        <p className="text-xs text-pierre-500 mt-0.5">
                          {Number(model.price).toLocaleString("fr-FR")}{" "}
                          {model.currency}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Personnalisation */}
          <div>
            <p className="font-overline text-pierre-500 mb-4">
              Personnalisation
            </p>
            <div className="card">
              <div className="grid sm:grid-cols-2 gap-8">
                <ShopImageUploader
                  type="logo"
                  currentUrl={shop.logo_path}
                  onUploaded={(path) =>
                    handleShopImageUpdated("logo_path", path)
                  }
                  label="Logo de la vitrine"
                  hint="Format carré recommandé, 400×400px."
                />
                <ShopImageUploader
                  type="cover"
                  currentUrl={shop.cover_path}
                  onUploaded={(path) =>
                    handleShopImageUpdated("cover_path", path)
                  }
                  label="Photo de couverture"
                  hint="Format paysage, 1200×600px."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
