import Skeleton from '../Skeleton'

interface Props {
  count?: number
}

export default function ModelsGridSkeleton({ count = 8 }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          {/* Image */}
          <Skeleton className="aspect-[3/4] rounded-xl" />

          {/* Nom */}
          <Skeleton className="h-4 w-3/4" />

          {/* Prix */}
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}