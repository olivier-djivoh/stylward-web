import Skeleton from '../Skeleton'

interface Props {
  fields?: number
}

export default function FormSkeleton({ fields = 4 }: Props) {
  return (
    <div className="space-y-8">

      {/* En-tête */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-56" />
      </div>

      {/* Bloc info (nom + email en lecture seule) */}
      <div className="card space-y-4">
        <Skeleton className="h-3 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      {/* Formulaire principal */}
      <div className="card space-y-6">
        <Skeleton className="h-3 w-24" />

        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        ))}

        <Skeleton className="h-11 w-56 rounded-lg" />
      </div>

    </div>
  )
}