import Skeleton from '../Skeleton'

interface Props {
  count?: number
}

export default function NotificationsSkeleton({ count = 6 }: Props) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="divide-y divide-pierre-100">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4">
            {/* Icône */}
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />

            {/* Contenu */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}