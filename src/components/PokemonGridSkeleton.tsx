function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden animate-pulse">
      <div className="bg-gray-100 h-40 sm:h-48 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-gray-200" />
      </div>
      <div className="px-4 pt-3 pb-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded-full w-14" />
          <div className="h-5 bg-gray-200 rounded-full w-14" />
        </div>
      </div>
    </div>
  )
}

export default function PokemonGridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
