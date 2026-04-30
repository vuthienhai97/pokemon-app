import { PokemonEntry } from '@/lib/pokemon'
import PokemonListCard from './PokemonListCard'

interface PokemonListGridProps {
  entries: PokemonEntry[]
}

export default function PokemonListGrid({ entries }: PokemonListGridProps) {
  if (entries.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full border-4 border-gray-200 overflow-hidden mb-5 relative">
          <div className="w-full h-1/2 bg-gray-200" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-4 border-gray-200 bg-white" />
          </div>
        </div>
        <p className="text-lg font-semibold text-gray-500">No Pokémon Found</p>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          No Pokémon match all the selected types. Try a different combination.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {entries.map((p) => (
        <PokemonListCard key={p.id} pokemon={p} />
      ))}
    </div>
  )
}
