import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import Spinner from "../../components/Spinner";
import DashboardSkeleton from "../../components/skeletons/DashboardSkeleton";
interface Stats {
  stylists: number;
  shops: number;
  models: number;
  activeShops: number;
  suspendedShops: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    stylists: 0,
    shops: 0,
    models: 0,
    activeShops: 0,
    suspendedShops: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [stylists, shops] = await Promise.all([
          api.get("/admin/stylists"),
          api.get("/admin/shops"),
        ]);

        const shopsData = shops.data.data || [];
        const totalModels = shopsData.reduce(
          (sum: number, s: any) => sum + (s.models_count || 0),
          0,
        );

        setStats({
          stylists: stylists.data.total ?? stylists.data.data.length,
          shops: shops.data.total ?? shopsData.length,
          models: totalModels,
          activeShops: shopsData.filter((s: any) => s.status === "active")
            .length,
          suspendedShops: shopsData.filter((s: any) => s.status === "suspended")
            .length,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Vue d'ensemble"
      subtitle="Pilotage de la plateforme Stylward"
    >
      <div className="space-y-8">
        {/* ===== STATS PRINCIPALES ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <p className="font-overline text-pierre-500 mb-2">Artisans de la mode</p>
            <p className="text-4xl font-display text-noir">{stats.stylists}</p>
            <p className="text-xs text-pierre-400 mt-1">comptes créés</p>
          </div>

          <div className="card">
            <p className="font-overline text-pierre-500 mb-2">Vitrines</p>
            <p className="text-4xl font-display text-noir">{stats.shops}</p>
            <p className="text-xs text-pierre-400 mt-1">au total</p>
          </div>

          <div className="card">
            <p className="font-overline text-pierre-500 mb-2">Créations</p>
            <p className="text-4xl font-display text-noir">{stats.models}</p>
            <p className="text-xs text-pierre-400 mt-1">dans la plateforme</p>
          </div>

          <div className="card">
            <p className="font-overline text-pierre-500 mb-2">Santé</p>
            <p className="text-4xl font-display text-succes">
              {stats.activeShops}
            </p>
            <p className="text-xs text-pierre-400 mt-1">
              {stats.suspendedShops > 0
                ? `${stats.suspendedShops} suspendue${stats.suspendedShops > 1 ? "s" : ""}`
                : "vitrines actives"}
            </p>
          </div>
        </div>

        {/* ===== ACCÈS RAPIDES ===== */}
        <div>
          <p className="font-overline text-pierre-500 mb-4">Accès rapides</p>
          <div className="grid sm:grid-cols-4 gap-4">
            <Link to="/admin/stylists" className="card card-hover group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-beige-soft flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-brun"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-pierre-400 group-hover:text-noir transition">
                  →
                </span>
              </div>
              <h3 className="font-display text-lg text-noir mb-1">Artisans de la mode</h3>
              <p className="text-sm text-pierre-500">
                Gérer les comptes artisans de la mode
              </p>
            </Link>

            <Link to="/admin/shops" className="card card-hover group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-beige-soft flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-brun"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-pierre-400 group-hover:text-noir transition">
                  →
                </span>
              </div>
              <h3 className="font-display text-lg text-noir mb-1">Vitrines</h3>
              <p className="text-sm text-pierre-500">Modérer et superviser</p>
            </Link>

            <Link to="/admin/categories" className="card card-hover group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-beige-soft flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-brun"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="text-pierre-400 group-hover:text-noir transition">
                  →
                </span>
              </div>
              <h3 className="font-display text-lg text-noir mb-1">
                Catégories
              </h3>
              <p className="text-sm text-pierre-500">
                Organiser le catalogue global
              </p>
            </Link>

            <Link to="/admin/archives" className="card card-hover group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-beige-soft flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-brun"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <span className="text-pierre-400 group-hover:text-noir transition">
                  →
                </span>
              </div>
              <h3 className="font-display text-lg text-noir mb-1">Archives</h3>
              <p className="text-sm text-pierre-500">Comptes supprimés</p>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
