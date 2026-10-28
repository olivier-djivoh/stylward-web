import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { track } from "../lib/tracker";
import Spinner from "../components/Spinner";
import ScrollToTopButton from "../components/ScrollToTopButton";
import FavoriteButton from "../components/FavoriteButton";
import PublicModelSkeleton from "../components/skeletons/PublicModelSkeleton";
import ShareModal from "../components/ShareModal";
import { STORAGE_URL } from '../lib/api'

interface Shop {
  id: string;
  name: string;
  slug: string;
  whatsapp: string | null;
  logo_path: string | null;
}

interface Model {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  currency: string;
  color: string | null;
  reference: string | null;
  published_at: string | null;
  category: { id: string; name: string; slug: string } | null;
  images: { id: string; path: string; type: string; alt_text: string | null }[];
}

export default function PublicModel() {
  const { slug, modelId } = useParams<{ slug: string; modelId: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [related, setRelated] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const trackedRef = useRef(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug || !modelId) return;
      try {
        const [shopRes, modelRes] = await Promise.all([
          api.get(`/public/shops/${slug}`),
          api.get(`/public/shops/${slug}/models/${modelId}`),
        ]);
        setShop(shopRes.data);
        const currentModel = modelRes.data.data;
        setModel(currentModel);

        if (!trackedRef.current) {
          trackedRef.current = true;
          track(slug, "view_model", currentModel.id);
        }

        // Charge les modèles associés (même catégorie)
        const allRes = await api.get(`/public/shops/${slug}/models`);
        const all = allRes.data.data || [];
        const relatedModels = all
          .filter(
            (m: Model) =>
              m.id !== currentModel.id &&
              (!currentModel.category ||
                m.category?.id === currentModel.category.id),
          )
          .slice(0, 3);
        setRelated(relatedModels);
      } catch (err) {
        console.error("Erreur chargement modèle :", err);
        setError("Modèle introuvable");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, modelId]);

  if (loading) {
    return <PublicModelSkeleton />;
  }

  if (error || !shop || !model) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 mb-4">
            Erreur 404
          </p>
          <h1 className="font-serif text-4xl text-neutral-900 mb-3">
            Pièce introuvable
          </h1>
          <p className="text-neutral-500 text-sm mb-8">
            Cette création n'existe pas ou n'est plus disponible.
          </p>
          {slug && (
            <Link
              to={`/shops/${slug}`}
              className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 hover:text-neutral-900 transition-colors border-b border-neutral-300 pb-1"
            >
              ← Retour à la vitrine
            </Link>
          )}
        </div>
      </div>
    );
  }

  const whatsappNumber = shop.whatsapp?.replace(/[^\d]/g, "") || "";
  const waMessage = encodeURIComponent(
    `Bonjour ${shop.name}, je suis intéressé(e) par la création "${model.name}"${model.reference ? ` (réf. ${model.reference})` : ""}.`,
  );
  const hasImages = model.images && model.images.length > 0;

  return (
    <div className="min-h-screen bg-white selection:bg-neutral-900 selection:text-white">
      {/* ═══════════════════════════════════════════
          NAV STICKY
          ═══════════════════════════════════════════ */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between">
          <Link
            to={`/shops/${shop.slug}`}
            className="flex items-center gap-3 min-w-0 group"
          >
            {shop.logo_path ? (
              <img
                src={`${STORAGE_URL}/${shop.logo_path}`}
                alt={shop.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-neutral-200 shrink-0 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                <span className="font-serif text-sm text-white leading-none pt-0.5">
                  {shop.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-serif text-base sm:text-lg text-neutral-900 tracking-tight truncate">
              {shop.name}
            </span>
          </Link>

          <Link
            to={`/shops/${shop.slug}`}
            className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 hover:text-neutral-900 transition-colors shrink-0 ml-4 font-medium"
          >
            ← Collection
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          FICHE PRODUIT
          ═══════════════════════════════════════════ */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ═══ GALERIE ═══ */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Image principale */}
            <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden rounded-2xl">
              {hasImages ? (
                <img
                  key={model.images[activeImage].id}
                  src={`${STORAGE_URL}/${model.images[activeImage].path}`}
                  alt={model.images[activeImage].alt_text || model.name}
                  className="w-full h-full object-cover animate-[fade-in_0.5s_ease-out]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[10px] uppercase tracking-[0.25em]">
                  Sans image
                </div>
              )}

              {/* Badge catégorie en haut */}
              {model.category && (
                <span className="absolute top-4 left-4 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold bg-white/95 backdrop-blur text-neutral-900 rounded-full shadow-sm">
                  {model.category.name}
                </span>
              )}
            </div>

            {/* Miniatures */}
            {hasImages && model.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
                {model.images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                      i === activeImage
                        ? "ring-2 ring-neutral-900 ring-offset-2"
                        : "ring-1 ring-neutral-200 hover:ring-neutral-400 opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Voir l'image ${i + 1}`}
                  >
                    <img
                      src={`${STORAGE_URL}/${img.path}`}
                      alt={img.alt_text || model.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ═══ INFOS ═══ */}
          <div className="space-y-8">
            {/* Titre */}
            <div className="space-y-4">
              {model.category && (
                <div className="flex items-center gap-3">
                  <span className="w-8 h-px bg-neutral-300" />
                  <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 font-medium">
                    {model.category.name}
                  </p>
                </div>
              )}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-neutral-900 leading-[1.05] tracking-tight">
                {model.name}
              </h1>
            </div>

            {/* Prix */}
            {model.price && (
              <div className="pb-6 border-b border-neutral-200">
                <p className="text-4xl sm:text-5xl font-serif text-neutral-900 tracking-tight">
                  {Number(model.price).toLocaleString("fr-FR")}
                  <span className="text-lg text-neutral-400 ml-2 tracking-wide font-sans">
                    {model.currency}
                  </span>
                </p>
              </div>
            )}

            {/* Description */}
            {model.description && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 mb-3 font-medium">
                  Description
                </p>
                <p className="text-neutral-700 leading-relaxed text-[15px] sm:text-base whitespace-pre-line">
                  {model.description}
                </p>
              </div>
            )}

            {/* Attributs */}
            {(model.color || model.reference) && (
              <div className="grid grid-cols-2 gap-6 py-6 border-y border-neutral-200">
                {model.color && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-1.5 font-medium">
                      Couleur
                    </p>
                    <p className="text-sm text-neutral-900 font-medium">
                      {model.color}
                    </p>
                  </div>
                )}
                {model.reference && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-1.5 font-medium">
                      Référence
                    </p>
                    <p className="text-sm text-neutral-900 font-mono">
                      {model.reference}
                    </p>
                  </div>
                )}
              </div>
            )}

            <FavoriteButton
              shopSlug={shop.slug}
              modelId={model.id}
              name={model.name}
              image={model.images?.[0]?.path ?? null}
              price={model.price}
              currency={model.currency}
              variant="page"
            />

            {/* Bouton Partager */}
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 border border-neutral-300 text-neutral-900 text-sm font-medium rounded-full hover:border-neutral-900 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Partager cette création
            </button>
            {/* CTA WhatsApp */}
            {whatsappNumber ? (
              <div className="space-y-4 pt-2">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${waMessage}`}
                  onClick={() => {
                    if (slug && model) track(slug, "whatsapp_click", model.id);
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-noir text-blanc-casse font-medium rounded-full hover:bg-brun transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Commander sur WhatsApp
                </a>
                <p className="text-[11px] text-neutral-400 text-center uppercase tracking-[0.15em]">
                  Réponse directe de l'artisan de la mode
                </p>
              </div>
            ) : (
              <div className="text-sm text-neutral-500 text-center py-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                Contact WhatsApp non disponible
              </div>
            )}

            {/* Retour boutique */}
            <div className="pt-4 text-center lg:text-left">
              <Link
                to={`/shops/${shop.slug}`}
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Découvrir toute la collection
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════
          VOUS AIMEREZ AUSSI
          ═══════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="border-t border-neutral-200 bg-neutral-50/50">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-5">
                <span className="w-8 h-px bg-neutral-300" />
                <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-medium">
                  Vous aimerez aussi
                </p>
                <span className="w-8 h-px bg-neutral-300" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900">
                Dans la même collection
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/shops/${shop.slug}/models/${r.id}`}
                  className="group block"
                >
                  <div className="aspect-[3/4] bg-neutral-100 overflow-hidden rounded-xl mb-3">
                    {r.images?.[0] ? (
                      <img
                        src={`${STORAGE_URL}/${r.images[0].path}`}
                        alt={r.name}
                        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[10px] uppercase tracking-[0.25em]">
                        Sans image
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif text-base text-neutral-900 leading-snug mb-1 group-hover:text-neutral-600 transition-colors">
                    {r.name}
                  </h3>
                  {r.price && (
                    <p className="text-neutral-500 text-sm">
                      {Number(r.price).toLocaleString("fr-FR")}{" "}
                      <span className="text-neutral-400 text-xs">
                        {r.currency}
                      </span>
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="bg-white border-t border-neutral-100 py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-400">
            Propulsé par{" "}
            <span className="text-neutral-900 font-medium">Stylward</span>
          </p>
        </div>
      </footer>
      <ScrollToTopButton />
      {/* Keyframes */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {shareOpen && model.images?.[0] && (
        <ShareModal
          data={{
            imagePath: model.images[0].path,
            modelName: model.name,
            price: model.price,
            currency: model.currency,
            shopName: shop.name,
            logoPath: shop.logo_path,
          }}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
