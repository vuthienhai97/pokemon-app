import type { TypeInfo, Pokemon } from '../types'

export const PER_PAGE = 24

const BASE = 'https://pokeapi.co/api/v2'

// ─── Private raw shapes ───────────────────────────────────────────────────────

interface RawListItem {
  name: string
  url: string
}

interface RawListResponse {
  count: number
  results: RawListItem[]
}

interface RawTypeDetail {
  pokemon: Array<{ pokemon: RawListItem; slot: number }>
}

interface RawTypesResponse {
  results: TypeInfo[]
}

// ─── Public service functions (called client-side, no cache options) ──────────

export async function fetchTypes(): Promise<TypeInfo[]> {
  const res = await fetch(`${BASE}/type?limit=100`)
  if (!res.ok) throw new Error('Failed to fetch types')
  const data = (await res.json()) as RawTypesResponse
  return data.results.filter((t) => t.name !== 'unknown' && t.name !== 'shadow')
}

export async function fetchPokemonPage(
  selectedTypes: string[],
  page: number
): Promise<{ pokemon: Pokemon[]; total: number }> {
  if (selectedTypes.length === 0) return fetchPage(page)
  return fetchByTypes(selectedTypes, page)
}

// ─── Private fetchers ─────────────────────────────────────────────────────────

async function fetchPage(page: number): Promise<{ pokemon: Pokemon[]; total: number }> {
  const offset = (page - 1) * PER_PAGE
  const res = await fetch(`${BASE}/pokemon?limit=${PER_PAGE}&offset=${offset}`)
  if (!res.ok) throw new Error('Failed to fetch pokemon list')
  const data = (await res.json()) as RawListResponse
  const pokemon = await Promise.all(data.results.map((p) => fetchDetail(p.name)))
  return { pokemon, total: data.count }
}

async function fetchByTypes(
  types: string[],
  page: number
): Promise<{ pokemon: Pokemon[]; total: number }> {
  const responses = await Promise.all(
    types.map((t) =>
      fetch(`${BASE}/type/${t}`).then((r) => r.json() as Promise<RawTypeDetail>)
    )
  )
  const sets = responses.map((r) => new Set(r.pokemon.map((p) => p.pokemon.name)))
  const names = [...sets[0]].filter((name) => sets.every((s) => s.has(name)))
  const total = names.length
  const offset = (page - 1) * PER_PAGE
  const pokemon = await Promise.all(
    names.slice(offset, offset + PER_PAGE).map(fetchDetail)
  )
  return { pokemon, total }
}

async function fetchDetail(nameOrId: string | number): Promise<Pokemon> {
  const res = await fetch(`${BASE}/pokemon/${nameOrId}`)
  if (!res.ok) throw new Error(`Failed to fetch pokemon: ${nameOrId}`)
  return res.json() as Promise<Pokemon>
}
