export default function ProjectModalSkeleton() {
  return (
    <div className="p-6" aria-hidden="true">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-gray-200 animate-pulse rounded-lg" />
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-[1/1] bg-gray-200 animate-pulse rounded-lg" />
            <div className="aspect-[1/1] bg-gray-200 animate-pulse rounded-lg" />
            <div className="aspect-[1/1] bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3 mt-6" />
        </div>
      </div>
    </div>
  )
}

