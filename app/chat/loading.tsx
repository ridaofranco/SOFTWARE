import { Skeleton } from "@/components/ui/skeleton"

export default function ChatLoading() {
  return (
    <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-8rem)]">
      <div className="flex h-full gap-6">
        {/* Sidebar */}
        <div className="w-80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>

          <Skeleton className="h-10 w-full mb-4" />

          <div className="flex-1 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-6" />
                </div>
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="border-b p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${i % 2 === 0 ? "bg-orange-100" : "bg-gray-100"}`}>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-4 bg-white">
            <div className="flex space-x-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
