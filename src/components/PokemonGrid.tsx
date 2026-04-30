import { Pokemon } from '@/lib/pokemon'
import PokemonCard from './PokemonCard'

export default function PokemonGrid({ pokemon }: { pokemon: Pokemon[] }) {
  if (pokemon.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-24 h-24 rounded-full border-4 border-gray-300 overflow-hidden mb-6 relative">
          <div className="w-full h-1/2 bg-gray-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-gray-300 bg-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-600 mb-2">No Pokémon Found</h3>
        <p className="text-gray-400 max-w-xs text-sm">
          No Pokémon match the selected type combination. Try different filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {pokemon.map((p) => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </div>
  )
}
