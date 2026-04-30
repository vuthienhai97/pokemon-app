import { Suspense } from 'react'
import Link from 'next/link'
import { fetchTypes, fetchPokemonList, PER_PAGE } from '@/lib/pokemon'
import PokemonListGrid from '@/components/PokemonListGrid'
import PokemonListSkeleton from '@/components/PokemonListSkeleton'
import Pagination from '@/components/Pagination'
import TypeFilterSSR from '@/components/TypeFilterSSR'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

async function PokemonSection({
  types,
  page,
}: {
  types: string[]
  page: number
}) {
  const { entries, total } = await fetchPokemonList(types, page)
  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        Total count:{' '}
        <span className="font-semibold">{total.toLocaleString()}</span>
        {types.length > 0 && (
          <span className="ml-2 text-gray-400">
            (filtered by {types.join(' + ')})
          </span>
        )}
      </p>
      <PokemonListGrid entries={entries} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/pokemon-ssr" />
    </>
  )
}

export default async function PokemonSSRPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const rawTypes = params.types
  const types = rawTypes
    ? Array.isArray(rawTypes)
      ? rawTypes
      : [rawTypes]
    : []
  const page =
    typeof params.page === 'string' ? Math.max(1, parseInt(params.page) || 1) : 1

  // Fetch types server-side (cached 24h)
  const allTypes = await fetchTypes()

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Welcome to Pokemon world</h1>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/pokemon"
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              CSR
            </Link>
            <span className="font-semibold text-gray-800 underline underline-offset-2">
              SSR
            </span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Type autocomplete (Client Component) — wrapped in Suspense per Next.js docs */}
        <div className="relative mb-6">
          <Suspense fallback={<div className="h-10 bg-gray-100 rounded-lg animate-pulse" />}>
            <TypeFilterSSR allTypes={allTypes} selectedTypes={types} />
          </Suspense>
        </div>

        {/* Pokemon grid + pagination — Server Component, streams in */}
        <Suspense
          key={`${types.sort().join(',')}-${page}`}
          fallback={<PokemonListSkeleton />}
        >
          <PokemonSection types={types} page={page} />
        </Suspense>
      </main>
    </div>
  )
}
