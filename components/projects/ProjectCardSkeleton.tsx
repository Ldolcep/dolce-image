export default function ProjectCardSkeleton() {
  return (
    <div className="break-inside-avoid-column mb-6 rounded-lg overflow-hidden shadow-md bg-white" aria-hidden="true">
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/2" />
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24" />
        </div>
      </div>
    </div>
  )
}

