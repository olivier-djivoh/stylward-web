import Skeleton from '../Skeleton'

interface Props {
  count?: number
}

export default function CollectionsGridSkeleton({ count = 6 }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}