import Image from 'next/image'
import { PokemonEntry } from '@/lib/pokemon'

interface PokemonListCardProps {
  pokemon: PokemonEntry
}

export default function PokemonListCard({ pokemon }: PokemonListCardProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 border border-gray-200 rounded-lg bg-white hover:border-gray-400 hover:shadow-sm transition-all">
      <span className="capitalize font-semibold text-gray-800 text-sm text-center leading-tight">
        {pokemon.name}
      </span>
      <Image
        src={pokemon.spriteUrl}
        alt={pokemon.name}
        width={96}
        height={96}
        className="object-contain"
        unoptimized
      />
      <span className="text-xs text-gray-500">Number: {pokemon.id}</span>
    </div>
  )
}
