import Skeleton from '../Skeleton'

interface Props {
  count?: number
}

export default function AdminListSkeleton({ count = 6 }: Props) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="divide-y divide-pierre-100">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-5 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}