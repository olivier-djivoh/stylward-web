import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche : branding */}
      <aside className="hidden lg:flex lg:w-[45%] relative bg-noir text-blanc-casse overflow-hidden">
        {/* Texture de fond subtile */}
        <div
          className="absolute inset-0 opacity-[0.04]"
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

        {/* Contenu */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img
                src="/stylward-logo.svg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-blanc-casse/70">
              Stylward
            </span>
          </div>

          {/* Message central */}
          <div className="max-w-md">
            <p className="font-overline text-beige mb-6">L'art de créer</p>
            <h2 className="font-display text-4xl xl:text-5xl leading-[1.1] text-blanc-casse mb-6">
              Chaque artisan de la mode mérite sa propre vitrine.
            </h2>
            <p className="text-blanc-casse/60 leading-relaxed">
              Créez votre vitrine numérique, présentez vos créations et partagez
              votre univers avec vos clients grâce à un seul lien.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-blanc-casse/40">
            <span>© 2026 Stylward</span>
            <span>Made with care</span>
          </div>
        </div>
      </aside>

      {/* Panneau droit : formulaire */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 bg-blanc-casse">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
              <img
                src="/stylward-logo.svg"
                alt="Stylward"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-pierre-500">
              Stylward
            </span>
          </div>

          {/* En-tête du formulaire */}
          <div className="mb-10">
            <h1 className="font-display text-3xl text-noir mb-2">{title}</h1>
            <p className="text-pierre-500 text-[15px]">{subtitle}</p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
