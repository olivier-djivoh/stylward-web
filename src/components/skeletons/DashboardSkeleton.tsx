import Skeleton from '../Skeleton'

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">

      {/* Salutation */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Cartes stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>

      {/* Graphique */}
      <Skeleton className="h-64 rounded-2xl" />

      {/* Titre section + grille */}
      <div className="space-y-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-56" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}