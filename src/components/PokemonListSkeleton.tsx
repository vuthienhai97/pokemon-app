function CardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg animate-pulse bg-white">
      <div className="h-3.5 w-20 bg-gray-200 rounded" />
      <div className="w-24 h-24 bg-gray-200 rounded" />
      <div className="h-3 w-16 bg-gray-200 rounded" />
    </div>
  )
}

export default function PokemonListSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
