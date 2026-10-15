import Skeleton from '../Skeleton'

export default function PublicModelSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-[68px] border-b border-neutral-200/60 flex items-center px-5 sm:px-8">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <Skeleton className="aspect-[4/5] rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-16 rounded-full mt-8" />
          </div>
        </div>
      </div>
    </div>
  )
}