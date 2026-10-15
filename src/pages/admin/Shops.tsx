import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import Spinner from "../../components/Spinner";
import { useToast } from "../../contexts/ToastContext";
import AdminListSkeleton from "../../components/skeletons/AdminListSkeleton";

interface Shop {
  id: string;
  name: string;
  slug: string;
  status: string;
  models_count: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export default function AdminShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const { data } = await api.get(`/admin/shops${params}`);
      setShops(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  async function toggleStatus(shop: Shop) {
    const action = shop.status === "active" ? "suspend" : "activate";
    const verb = action === "suspend" ? "suspendre" : "réactiver";
    if (!confirm(`Voulez-vous ${verb} "${shop.name}" ?`)) return;

    try {
      await api.patch(`/admin/shops/${shop.id}/${action}`);
      toast.success(
        `Boutique ${action === "suspend" ? "suspendue" : "réactivée"}.`,
      );
      await load();
    } catch {
      toast.error("Erreur lors de la modification");
    }
  }

  function StatusBadge({ status }: { status: string }) {
    if (status === "active")
      return (
        <span className="badge badge-succes text-[10px] py-0.5">En ligne</span>
      );
    if (status === "suspended")
      return (
        <span className="badge badge-alerte text-[10px] py-0.5">Suspendue</span>
      );
    return (
      <span className="badge badge-neutre text-[10px] py-0.5">Brouillon</span>
    );
  }

  return (
    <AdminLayout
      title="Vitrines"
      subtitle={`${shops.length} boutique${shops.length > 1 ? "s" : ""} sur la plateforme`}
    >
      <div className="space-y-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-pierre-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou slug..."
              className="input-field pl-11"
            />
          </div>
          <button type="submit" className="btn-primary text-sm">
            Rechercher
          </button>
        </form>

        {success && (
          <div className="p-4 rounded-[10px] bg-succes-soft border border-succes/20 text-succes text-sm">
            ✅ {success}
          </div>
        )}

        {loading ? (
          <AdminListSkeleton count={5} />
        ) : shops.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-pierre-500">Aucune boutique trouvée.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="divide-y divide-pierre-100">
              {shops.map((s) => (
                <div
                  key={s.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-noir flex items-center justify-center shrink-0">
                    <span className="font-display text-lg text-blanc-casse">
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-noir">{s.name}</p>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-sm text-pierre-500 font-mono truncate">
                      /shops/{s.slug}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-pierre-400">
                      <span>
                        {s.user
                          ? `${s.user.first_name} ${s.user.last_name}`
                          : "Sans propriétaire"}
                      </span>
                      <span>·</span>
                      <span>
                        {s.models_count} création{s.models_count > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/shops/${s.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-pierre-500 hover:text-noir underline underline-offset-4 transition"
                    >
                      Voir
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleStatus(s)}
                      className={`text-xs px-4 py-2 rounded-lg font-medium transition ${
                        s.status === "active"
                          ? "bg-alerte-soft text-alerte hover:opacity-80"
                          : "bg-succes-soft text-succes hover:opacity-80"
                      }`}
                    >
                      {s.status === "active" ? "Suspendre" : "Activer"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
