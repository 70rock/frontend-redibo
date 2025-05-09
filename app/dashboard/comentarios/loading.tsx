import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-8 w-64 mb-6" />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-[240px]" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 flex-grow" />
        <Skeleton className="h-10 w-[120px]" />
      </div>

      <div className="space-y-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 flex gap-4">
            <Skeleton className="h-20 w-[120px] rounded-md" />
            <div className="flex-grow">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  )
}
