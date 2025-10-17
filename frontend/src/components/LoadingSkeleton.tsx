import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="bg-white/70 backdrop-blur-sm border-purple-200"
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="ml-4 space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Boards Section Skeleton */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Boards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="bg-white/70 backdrop-blur-sm border-purple-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="flex justify-between">
                    <div className="flex space-x-4">
                      <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function BoardCardSkeleton() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}
