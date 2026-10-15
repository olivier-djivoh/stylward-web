import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import Spinner from "../components/Spinner";

interface Model {
  id: string;
  name: string;
  slug: string;
  price: string | null;
  currency: string;
  color: string | null;
  category: { id: string; name: string; slug: string } | null;
  images: { id: string; path: string; type: string }[];
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_path: string | null;
  models: Model[];
}

interface Shop {
  name: string;
  slug: string;
  logo_path: string | null;
}

export default function PublicCollection() {
  const { slug, collectionSlug } = useParams<{
    slug: string;
    collectionSlug: string;
  }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!slug || !collectionSlug) return;
      try {
        const [shopRes, colRes] = await Promise.all([
          api.get(`/public/shops/${slug}`),
          api.get(`/public/shops/${slug}/collections/${collectionSlug}`),
        ]);
        setShop(shopRes.data);
        setCollection(colRes.data);
      } catch {
        setError("Collection introuvable");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, collectionSlug]);

  if (loading) return <Spinner fullScreen label="Chargement..." />;

  if (error || !shop || !collection) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-4xl text-noir mb-3">
            Collection introuvable
          </h1>
          <Link to={`/shops/${slug}`} className="btn-primary inline-block mt-6">
            Retour à la vitrine
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between">
          <Link
            to={`/shops/${shop.slug}`}
            className="flex items-center gap-3 min-w-0"
          >
            {shop.logo_path ? (
              <img
                src={`/storage/${shop.logo_path}`}
                alt={shop.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-neutral-200 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
                <span className="font-serif text-sm text-white leading-none pt-0.5">
                  {shop.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-serif text-base text-neutral-900 truncate">
              {shop.name}
            </span>
          </Link>

          <Link
            to={`/shops/${shop.slug}`}
            className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 hover:text-neutral-900 transition shrink-0 ml-4 font-medium"
          >
            ← Boutique
          </Link>
        </div>
      </nav>

      {/* Hero collection */}
      <section className="relative bg-neutral-900 overflow-hidden">
        <div className="relative h-[50vh] min-h-[380px] max-h-[560px] overflow-hidden">
          {collection.cover_path ? (
            <img
              src={`/storage/${collection.cover_path}`}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 pb-14">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-px bg-white/40" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/80 font-medium">
                Collection
              </p>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl text-white leading-tight mb-4 drop-shadow-2xl max-w-3xl">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-white/90 text-base leading-relaxed max-w-xl drop-shadow-lg">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Grille */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-medium mb-3">
            {collection.models.length} pièce
            {collection.models.length > 1 ? "s" : ""}
          </p>
        </div>

        {collection.models.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-pierre-200 rounded-3xl">
            <p className="text-pierre-500">
              Cette collection est vide pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-14 sm:gap-x-8 sm:gap-y-20">
            {collection.models.map((model, index) => (
              <Link
                key={model.id}
                to={`/shops/${shop.slug}/models/${model.id}`}
                className="group block animate-[fade-up_0.6s_ease-out_both]"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="aspect-[3/4] bg-neutral-100 overflow-hidden rounded-xl mb-5">
                  {model.images?.[0] ? (
                    <img
                      src={`/storage/${model.images[0].path}`}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[10px] uppercase tracking-widest">
                      Sans image
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 px-0.5">
                  {model.category && (
                    <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 font-medium">
                      {model.category.name}
                    </p>
                  )}
                  <h3 className="font-serif text-lg text-neutral-900 leading-tight">
                    {model.name}
                  </h3>
                  {model.price && (
                    <p className="text-neutral-500 text-sm">
                      {Number(model.price).toLocaleString("fr-FR")}{" "}
                      <span className="text-neutral-400 text-xs">
                        {model.currency}
                      </span>
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
