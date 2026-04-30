'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { TypeInfo, Pokemon } from './types'
import { PER_PAGE, fetchTypes, fetchPokemonPage } from './apis/pokemon.service'
import TypeAutocomplete from '@/components/TypeAutocomplete'
import PokemonGrid from '@/components/PokemonGrid'
import PokemonGridSkeleton from '@/components/PokemonGridSkeleton'
import Pagination from '@/components/Pagination'
import Link from 'next/link'

export default function PokemonCSRPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const selectedTypes = searchParams.getAll('types')
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get('page') ?? '1') || 1
  )

  const [allTypes, setAllTypes] = useState<TypeInfo[]>([])
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTypes().then(setAllTypes).catch(console.error)
  }, [])

  useEffect(() => {
    let ignore = false

    async function load() {
      setLoading(true)

      try {
        const { pokemon: data, total: count } = await fetchPokemonPage(
          selectedTypes,
          currentPage
        )

        if (!ignore) {
          setPokemon(data)
          setTotal(count)
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()

    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()])

  const handleTypesChange = useCallback(
    (types: string[]) => {
      const params = new URLSearchParams()
      types.forEach((t) => params.append('types', t))
      startTransition(() => {
        router.push(
          `/pokemon${params.toString() ? `?${params.toString()}` : ''}`
        )
      })
    },
    [router]
  )

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-600 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 100 100"
              className="w-9 h-9 shrink-0"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="white"
                stroke="#1f2937"
                strokeWidth="4"
              />
              <path d="M2 50 h96" stroke="#1f2937" strokeWidth="4" />
              <circle
                cx="50"
                cy="50"
                r="14"
                fill="white"
                stroke="#1f2937"
                strokeWidth="4"
              />
              <path d="M2 50 Q50 2 98 50" fill="#e11d48" />
              <circle
                cx="50"
                cy="50"
                r="8"
                fill="white"
                stroke="#1f2937"
                strokeWidth="4"
              />
            </svg>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pokédex
            </h1>
          </div>
          <nav className="flex gap-4 text-sm font-semibold">
            <span className="text-white underline underline-offset-2">CSR</span>
            <Link
              href="/pokemon-ssr"
              className="text-red-200 hover:text-white transition-colors"
            >
              SSR
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <TypeAutocomplete
            allTypes={allTypes}
            selectedTypes={selectedTypes}
            onChange={handleTypesChange}
          />
        </div>

        <p className="text-sm text-gray-400 mb-4">
          {loading ? (
            <span className="inline-block w-24 h-4 bg-gray-200 rounded animate-pulse" />
          ) : (
            <>
              {total.toLocaleString()} Pokémon
              {selectedTypes.length > 0 && (
                <span className="ml-1">
                  matching{' '}
                  <strong className="text-gray-600">
                    {selectedTypes.join(' + ')}
                  </strong>
                </span>
              )}
            </>
          )}
        </p>

        {loading ? (
          <PokemonGridSkeleton />
        ) : (
          <PokemonGrid pokemon={pokemon} animated />
        )}

        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/pokemon"
          />
        )}
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
