import Image from 'next/image'
import { Pokemon } from '@/lib/pokemon'
import { getTypeClass } from '@/lib/typeColors'

export default function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default
  const paddedId = String(pokemon.id).padStart(3, '0')

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer">
      <div className="relative bg-gray-50 flex items-center justify-center h-40 sm:h-48">
        <span className="absolute top-2 right-3 text-xs font-semibold text-gray-400">
          #{paddedId}
        </span>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={pokemon.name}
            width={110}
            height={110}
            className="object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
          />
        ) : (
          <div className="w-[110px] h-[110px] rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-4xl text-gray-400">?</span>
          </div>
        )}
      </div>

      <div className="px-4 pt-3 pb-4">
        <h3 className="capitalize font-bold text-gray-800 text-base mb-2 truncate">
          {pokemon.name}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {pokemon.types.map(({ type }) => (
            <span
              key={type.name}
              className={`${getTypeClass(type.name)} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize`}
            >
              {type.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
