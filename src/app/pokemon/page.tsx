'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TypeInfo, PokemonEntry, PER_PAGE, fetchTypes, fetchPokemonList } from '@/lib/pokemon'
import TypeAutocomplete from '@/components/TypeAutocomplete'
import PokemonListGrid from '@/components/PokemonListGrid'
import PokemonListSkeleton from '@/components/PokemonListSkeleton'
import Pagination from '@/components/Pagination'
import Link from 'next/link'

export default function PokemonCSRPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  // Derive state from URL
  const rawTypes = searchParams.getAll('types')
  const currentPage = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)

  const [allTypes, setAllTypes] = useState<TypeInfo[]>([])
  const [entries, setEntries] = useState<PokemonEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch types once on mount (client-side)
  useEffect(() => {
    fetchTypes({}).then(setAllTypes).catch(console.error)
  }, [])

  // Fetch pokemon whenever types or page change (client-side)
  useEffect(() => {
    setLoading(true)
    fetchPokemonList(rawTypes, currentPage, {})
      .then(({ entries: data, total: count }) => {
        setEntries(data)
        setTotal(count)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()])

  const handleTypesChange = useCallback(
    (types: string[]) => {
      const params = new URLSearchParams()
      types.forEach((t) => params.append('types', t))
      startTransition(() => {
        router.push(`/pokemon?${params.toString()}`)
      })
    },
    [router]
  )

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Welcome to Pokemon world</h1>
          <nav className="flex gap-4 text-sm">
            <span className="font-semibold text-gray-800 underline underline-offset-2">
              CSR
            </span>
            <Link
              href="/pokemon-ssr"
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              SSR
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Count */}
        <p className="text-sm text-gray-600 mb-4">
          Total count:{' '}
          <span className="font-semibold">{loading ? '...' : total.toLocaleString()}</span>
          {rawTypes.length > 0 && (
            <span className="ml-2 text-gray-400">
              (filtered by {rawTypes.join(' + ')})
            </span>
          )}
        </p>

        {/* Type filter */}
        <div className="relative mb-6">
          <TypeAutocomplete
            allTypes={allTypes}
            selectedTypes={rawTypes}
            onChange={handleTypesChange}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <PokemonListSkeleton />
        ) : (
          <PokemonListGrid entries={entries} />
        )}

        {/* Pagination */}
        {!loading && (
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/pokemon" />
        )}
      </main>
    </div>
  )
}
