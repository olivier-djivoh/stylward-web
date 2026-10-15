import Skeleton from '../Skeleton'

export default function PublicShopSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <div className="h-[68px] border-b border-neutral-200/60 flex items-center px-5 sm:px-8">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Hero */}
      <Skeleton className="h-[75vh] min-h-[520px] rounded-none" />

      {/* Catalogue */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 space-y-12">
        <div className="text-center space-y-4">
          <Skeleton className="h-3 w-24 mx-auto" />
          <Skeleton className="h-10 w-64 mx-auto" />
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-14 sm:gap-x-8 sm:gap-y-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] rounded-xl" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}