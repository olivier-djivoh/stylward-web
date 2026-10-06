import { Link } from 'react-router-dom'
import ScrollToTopButton from '../components/ScrollToTopButton'


export default function Landing() {
  return (
    <div className="min-h-screen bg-blanc-casse text-noir selection:bg-noir selection:text-blanc-casse">

      {/* ═══════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════ */}
      <nav className="sticky top-0 z-40 bg-blanc-casse/85 backdrop-blur-xl border-b border-pierre-200/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-noir flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <span className="font-serif text-base text-blanc-casse leading-none pt-0.5">S</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-lg text-noir">SaaS Stylistes</span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-pierre-400 mt-0.5">
                Vitrine digitale
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              to="/login"
              className="text-[11px] uppercase tracking-[0.22em] text-pierre-500 hover:text-noir transition-colors font-medium"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="text-[11px] uppercase tracking-[0.22em] text-noir font-medium border-b-2 border-noir pb-0.5 hover:border-transparent transition-all"
            >
              Créer ma boutique
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Fond dégradé subtil */}
        <div className="absolute inset-0 bg-gradient-to-b from-ivoire via-blanc-casse to-blanc-casse" />

        {/* Motif décoratif */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                #171717 2px,
                #171717 3px
              )`,
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">

          {/* ─── Bloc texte ─── */}
          <div className="max-w-3xl mx-auto text-center space-y-8">

            {/* Badge nouveauté */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-pierre-200 rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-succes opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-succes" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-pierre-600 font-medium">
                Gratuit pour les premiers stylistes
              </span>
            </div>

            {/* Titre */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4.5rem] leading-[1.02] tracking-tight text-noir">
              Arrêtez d'envoyer vos photos{' '}
              <br className="hidden sm:block" />
              une par une sur{' '}
              <em className="italic text-brun relative">
                WhatsApp
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8 Q 50 2, 100 6 T 198 5"
                    stroke="#B08D57"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </em>.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-pierre-600 leading-relaxed max-w-2xl mx-auto">
              Créez votre <span className="text-noir font-medium">boutique en ligne</span> en
              2 minutes. Ajoutez vos créations, obtenez un{' '}
              <span className="text-noir font-medium">lien unique</span> et
              partagez-le à vos clients.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-noir text-blanc-casse text-sm font-medium rounded-full hover:bg-brun transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                Créer ma boutique gratuitement
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 text-sm font-medium text-noir border border-pierre-300 rounded-full hover:border-noir transition-all bg-white/50 backdrop-blur"
              >
                J'ai déjà un compte
              </Link>
            </div>

            {/* Micro-rassurance */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-pierre-500 pt-2">
              {['Gratuit', 'Sans carte bancaire', 'Prêt en 2 minutes'].map((label) => (
                <span key={label} className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-succes" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ─── Mockup ─── */}
          <div className="mt-16 sm:mt-24 pb-16 sm:pb-20">
            <HeroMockup />
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PROBLÈME / SOLUTION
          ═══════════════════════════════════════════ */}
      <section className="bg-white border-y border-pierre-200 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">

          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="w-8 h-px bg-pierre-300" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-pierre-400 font-medium">
                Le constat
              </p>
              <span className="w-8 h-px bg-pierre-300" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-noir leading-tight">
              Vous perdez du temps,<br />
              vous perdez des clients.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">

            {/* AVANT */}
            <div className="rounded-3xl border border-alerte/15 bg-gradient-to-br from-alerte-soft/40 to-white p-8">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-9 h-9 rounded-full bg-alerte/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-alerte" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-alerte font-bold">
                  Aujourd'hui
                </p>
              </div>
              <ul className="space-y-4 text-sm text-pierre-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-alerte mt-0.5 shrink-0 font-bold">✗</span>
                  <span>Vos photos sont dispersées sur WhatsApp, Instagram, dans votre galerie</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-alerte mt-0.5 shrink-0 font-bold">✗</span>
                  <span>Vous renvoyez les mêmes images 10 fois par semaine</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-alerte mt-0.5 shrink-0 font-bold">✗</span>
                  <span>Vos clients ne savent pas ce que vous proposez</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-alerte mt-0.5 shrink-0 font-bold">✗</span>
                  <span>Vous n'avez pas de "vraie" boutique à montrer</span>
                </li>
              </ul>
            </div>

            {/* APRÈS */}
            <div className="rounded-3xl border border-succes/20 bg-gradient-to-br from-succes-soft/40 to-white p-8 relative overflow-hidden">
              {/* Badge "Recommandé" */}
              <div className="absolute top-4 right-4 px-2.5 py-1 bg-succes text-white text-[9px] uppercase tracking-[0.2em] font-bold rounded-full">
                Recommandé
              </div>

              <div className="flex items-center gap-3 mb-7">
                <div className="w-9 h-9 rounded-full bg-succes/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-succes" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-succes font-bold">
                  Avec SaaS Stylistes
                </p>
              </div>
              <ul className="space-y-4 text-sm text-pierre-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-succes mt-0.5 shrink-0 font-bold">✓</span>
                  <span>Une vitrine élégante avec toutes vos créations</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-succes mt-0.5 shrink-0 font-bold">✓</span>
                  <span>Un seul lien à partager — une seule fois</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-succes mt-0.5 shrink-0 font-bold">✓</span>
                  <span>Vos clients voient exactement ce que vous faites</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-succes mt-0.5 shrink-0 font-bold">✓</span>
                  <span>Vous recevez les commandes directement sur WhatsApp</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMMENT ÇA MARCHE
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">

          <div className="text-center mb-20 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="w-8 h-px bg-pierre-300" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-pierre-400 font-medium">
                Comment ça marche
              </p>
              <span className="w-8 h-px bg-pierre-300" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-noir leading-tight">
              Votre boutique en ligne<br />en 3 étapes simples.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 sm:gap-16 max-w-5xl mx-auto">
            <StepCard
              number="01"
              title="Créez votre compte"
              description="Inscription gratuite en 30 secondes. Aucune carte bancaire requise."
            />
            <StepCard
              number="02"
              title="Ajoutez vos créations"
              description="Photos, noms, prix. Votre catalogue prend vie en quelques minutes."
            />
            <StepCard
              number="03"
              title="Partagez votre lien"
              description="Un lien unique à envoyer à vos clients sur WhatsApp. Prêt à vendre."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          POUR QUI ?
          ═══════════════════════════════════════════ */}
      <section className="bg-ivoire border-y border-beige-soft py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">

          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="w-8 h-px bg-brun/30" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-brun/70 font-medium">
                Pour qui ?
              </p>
              <span className="w-8 h-px bg-brun/30" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-noir leading-tight">
              Conçu pour les créateurs de mode.
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <AudienceCard
              label="Stylistes"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <AudienceCard
              label="Tailleurs"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                </svg>
              }
            />
            <AudienceCard
              label="Créateurs"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            />
            <AudienceCard
              label="Ateliers"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA FINAL (fond noir)
          ═══════════════════════════════════════════ */}
      <section className="bg-noir py-20 sm:py-28 relative overflow-hidden">
        {/* Motif discret */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                #F7F4EE 2px,
                #F7F4EE 3px
              )`,
            }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">

          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-beige/40" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-beige font-medium">
              Prêt à commencer ?
            </p>
            <span className="w-8 h-px bg-beige/40" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl text-blanc-casse leading-tight mb-6">
            Votre vitrine digitale<br />
            vous attend.
          </h2>

          <p className="text-blanc-casse/60 text-base max-w-lg mx-auto mb-10 leading-relaxed">
            Rejoignez les stylistes qui présentent déjà leurs créations avec
            élégance et simplicité.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blanc-casse text-noir text-sm font-medium rounded-full hover:bg-beige transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
          >
            Créer ma boutique gratuitement
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-blanc-casse/50 mt-8">
            {['Gratuit', 'Sans carte bancaire', 'Prêt en 2 minutes'].map((label) => (
              <span key={label} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-beige" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-pierre-200 bg-white py-12">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-noir flex items-center justify-center">
                <span className="font-serif text-sm text-blanc-casse leading-none pt-0.5">S</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-base text-noir">SaaS Stylistes</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-pierre-400 mt-0.5">
                  Vitrine digitale
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] text-pierre-400">
              <Link to="/login" className="hover:text-noir transition-colors">Connexion</Link>
              <Link to="/register" className="hover:text-noir transition-colors">Inscription</Link>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-pierre-100 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-pierre-400">
              © 2026 SaaS Stylistes — <span className="italic font-serif text-pierre-500">L'art de créer</span>
            </p>
          </div>
        </div>
            </footer>

      <ScrollToTopButton />

    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SOUS-COMPOSANTS
   ═══════════════════════════════════════════════════════ */

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="relative text-center md:text-left">
      {/* Numéro en filigrane */}
      <p className="font-serif text-[5.5rem] sm:text-[7rem] leading-none text-pierre-200/60 mb-2 select-none">
        {number}
      </p>
      <h3 className="font-serif text-xl sm:text-2xl text-noir mb-3">{title}</h3>
      <p className="text-pierre-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function AudienceCard({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="group bg-white rounded-2xl border border-beige-soft p-6 text-center hover:shadow-lg hover:-translate-y-1 hover:border-brun/30 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-ivoire flex items-center justify-center text-brun mx-auto mb-4 group-hover:bg-brun group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <p className="font-serif text-lg text-noir">{label}</p>
    </div>
  )
}

function HeroMockup() {
  const coverPhoto = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80&auto=format&fit=crop'

  const products = [
    {
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&auto=format&fit=crop',
      title: 'Robe de soirée',
      price: '85 000',
    },
    {
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&auto=format&fit=crop',
      title: 'Ensemble cérémonie',
      price: '120 000',
    },
    {
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80&auto=format&fit=crop',
      title: 'Costume sur mesure',
      price: '145 000',
    },
  ]

  const mobileProducts = [
    products[0],
    products[1],
    products[2],
    {
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80&auto=format&fit=crop',
      title: 'Tailleur élégant',
      price: '95 000',
    },
  ]

  return (
    <div className="relative max-w-5xl mx-auto">

      {/* Halo derrière */}
      <div className="absolute -inset-x-12 -top-12 -bottom-12 bg-gradient-to-br from-brun/15 via-beige/25 to-transparent rounded-[3rem] blur-3xl opacity-70" />

      {/* ═══ CARTE DESKTOP ═══ */}
      <div className="relative bg-white rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] overflow-hidden border border-pierre-200/60">

        <div className="flex items-center gap-1.5 px-4 py-3 bg-pierre-50 border-b border-pierre-100">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          <div className="flex-1 ml-4 flex justify-center">
            <div className="px-4 py-1 bg-white rounded-md text-[10px] text-pierre-500 font-mono border border-pierre-100">
              saas-stylistes.com/shops/atelier-olivier
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="flex items-center justify-between px-6 sm:px-8 py-3.5 border-b border-pierre-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-noir flex items-center justify-center">
                <span className="font-serif text-xs text-blanc-casse leading-none pt-0.5">A</span>
              </div>
              <span className="font-serif text-sm text-noir">Atelier Olivier</span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-pierre-400 font-medium">
              Contacter
            </span>
          </div>

          <div className="relative h-[240px] sm:h-[320px] overflow-hidden">
            <img
              src={coverPhoto}
              alt="Atelier Olivier"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6 sm:p-8">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/70 mb-2">
                  Maison de couture
                </p>
                <h3 className="font-serif text-3xl sm:text-4xl text-white leading-tight drop-shadow-2xl">
                  Atelier Olivier
                </h3>
                <p className="text-white/80 text-xs sm:text-sm mt-2 max-w-xs leading-relaxed">
                  Couture sur mesure pour hommes et femmes.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-blanc-casse">
            <div className="text-center mb-6">
              <p className="text-[9px] uppercase tracking-[0.3em] text-pierre-400 mb-1.5">
                Collection
              </p>
              <p className="font-serif text-xl text-noir">Nos créations</p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {products.map((product, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-pierre-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-serif text-[11px] sm:text-xs text-noir leading-tight truncate">
                      {product.title}
                    </p>
                    <p className="text-[10px] text-pierre-500">
                      {product.price}{' '}
                      <span className="text-pierre-400">XOF</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TÉLÉPHONE FLOTTANT ═══ */}
      <div className="hidden md:block absolute -right-6 lg:-right-12 -bottom-16 w-44 lg:w-56">
        <div className="bg-noir rounded-[2rem] p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]">
          <div className="bg-white rounded-[1.6rem] overflow-hidden">
            <div className="h-5 bg-white flex justify-center items-center">
              <div className="w-12 h-2 bg-noir rounded-full" />
            </div>

            <div className="bg-noir text-white px-4 pt-3 pb-5">
              <div className="w-8 h-8 rounded-lg bg-blanc-casse flex items-center justify-center mb-3">
                <span className="font-serif text-sm text-noir">A</span>
              </div>
              <p className="text-[7px] uppercase tracking-[0.25em] text-beige mb-1">
                Maison de couture
              </p>
              <h4 className="font-serif text-base leading-tight">Atelier Olivier</h4>
            </div>

            <div className="bg-blanc-casse p-3">
              <div className="grid grid-cols-2 gap-2">
                {mobileProducts.map((product, i) => (
                  <div key={i} className="space-y-1">
                    <div className="aspect-[3/4] rounded overflow-hidden bg-pierre-100">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[7px] text-noir font-medium leading-tight truncate">
                      {product.title}
                    </p>
                    <p className="text-[7px] text-pierre-500">
                      {product.price} <span className="text-pierre-400">XOF</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BADGE WHATSAPP ANIMÉ ═══ */}
      <div className="hidden md:flex absolute -left-6 lg:-left-12 -bottom-16 bg-white rounded-2xl px-4 py-3 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] border border-pierre-100 items-center gap-3 animate-[float_3s_ease-in-out_infinite]">
        <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-pierre-400 font-medium">
            Nouvelle commande
          </p>
          <p className="text-sm font-medium text-noir">à l'instant</p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

    </div>
  )
}