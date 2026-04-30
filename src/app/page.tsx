import { Suspense } from 'react'
import { getAllTypes, getPokemonPage, PER_PAGE } from '@/lib/pokemon'
import TypeFilter from '@/components/TypeFilter'
import PokemonGrid from '@/components/PokemonGrid'
import PokemonGridSkeleton from '@/components/PokemonGridSkeleton'
import Pagination from '@/components/Pagination'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

async function PokemonSection({
  types,
  page,
}: {
  types: string[]
  page: number
}) {
  const { pokemon, total } = await getPokemonPage(types, page)
  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <>
      <p className="text-sm text-gray-400 mb-4">
        {total.toLocaleString()} Pokémon
        {types.length > 0 && (
          <span className="ml-1">
            matching <strong className="text-gray-600">{types.join(' + ')}</strong>
          </span>
        )}
      </p>
      <PokemonGrid pokemon={pokemon} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </>
  )
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const rawTypes = params.types
  const types = rawTypes
    ? Array.isArray(rawTypes)
      ? rawTypes
      : [rawTypes]
    : []
  const page = typeof params.page === 'string' ? Math.max(1, parseInt(params.page) || 1) : 1

  const allTypes = await getAllTypes()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-600 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <svg
            viewBox="0 0 100 100"
            className="w-9 h-9 shrink-0"
            aria-hidden="true"
          >
            <circle cx="50" cy="50" r="48" fill="white" stroke="#1f2937" strokeWidth="4" />
            <path d="M2 50 h96" stroke="#1f2937" strokeWidth="4" />
            <circle cx="50" cy="50" r="14" fill="white" stroke="#1f2937" strokeWidth="4" />
            <path d="M2 50 Q50 2 98 50" fill="#e11d48" />
            <circle cx="50" cy="50" r="8" fill="white" stroke="#1f2937" strokeWidth="4" />
          </svg>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pokédex
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={null}>
          <TypeFilter types={allTypes} selectedTypes={types} />
        </Suspense>

        <Suspense
          key={`${types.sort().join(',')}-${page}`}
          fallback={<PokemonGridSkeleton />}
        >
          <PokemonSection types={types} page={page} />
        </Suspense>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        Data from{' '}
        <a
          href="https://pokeapi.co"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          PokéAPI
        </a>
      </footer>
    </div>
  )
}
