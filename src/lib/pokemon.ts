export const PER_PAGE = 24

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TypeInfo {
  name: string
  url: string
}

export interface PokemonTypeBadge {
  slot: number
  type: { name: string; url: string }
}

export interface Pokemon {
  id: number
  name: string
  sprites: {
    other: {
      'official-artwork': { front_default: string | null }
      showdown: { front_default: string | null }
    }
    versions: {
      'generation-v': {
        'black-white': {
          animated: { front_default: string | null }
        }
      }
    }
  }
  types: PokemonTypeBadge[]
}

// ─── Internal raw shapes ──────────────────────────────────────────────────────

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

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all available Pokémon types.
 * `cacheOpts` is applied as-is to fetch(); pass `{}` on the client side to skip
 * the Next.js-specific `next.revalidate` option.
 */
export async function fetchTypes(
  cacheOpts: RequestInit = { next: { revalidate: 86400 } }
): Promise<TypeInfo[]> {
  const res = await fetch('https://pokeapi.co/api/v2/type?limit=100', cacheOpts)
  if (!res.ok) throw new Error('Failed to fetch types')
  const data = (await res.json()) as RawTypesResponse
  return data.results.filter((t) => t.name !== 'unknown' && t.name !== 'shadow')
}

/**
 * Fetch a paginated list of full Pokémon (with sprites + types).
 * When `selectedTypes` is non-empty, returns the intersection across all types.
 */
export async function fetchPokemonPage(
  selectedTypes: string[],
  page: number,
  cacheOpts: RequestInit = { next: { revalidate: 3600 } }
): Promise<{ pokemon: Pokemon[]; total: number }> {
  if (selectedTypes.length === 0) {
    return fetchPage(page, cacheOpts)
  }
  return fetchByTypes(selectedTypes, page, cacheOpts)
}

// ─── Private fetchers ─────────────────────────────────────────────────────────

async function fetchPage(
  page: number,
  cacheOpts: RequestInit
): Promise<{ pokemon: Pokemon[]; total: number }> {
  const offset = (page - 1) * PER_PAGE
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${PER_PAGE}&offset=${offset}`,
    cacheOpts
  )
  if (!res.ok) throw new Error('Failed to fetch pokemon list')
  const data = (await res.json()) as RawListResponse

  const pokemon = await Promise.all(
    data.results.map((p) => fetchDetail(p.name, cacheOpts))
  )
  return { pokemon, total: data.count }
}

async function fetchByTypes(
  types: string[],
  page: number,
  cacheOpts: RequestInit
): Promise<{ pokemon: Pokemon[]; total: number }> {
  const responses = await Promise.all(
    types.map((t) =>
      fetch(`https://pokeapi.co/api/v2/type/${t}`, cacheOpts).then(
        (r) => r.json() as Promise<RawTypeDetail>
      )
    )
  )

  const sets = responses.map((r) => new Set(r.pokemon.map((p) => p.pokemon.name)))
  const names = [...sets[0]].filter((name) => sets.every((s) => s.has(name)))

  const total = names.length
  const offset = (page - 1) * PER_PAGE
  const pageNames = names.slice(offset, offset + PER_PAGE)

  const pokemon = await Promise.all(pageNames.map((n) => fetchDetail(n, cacheOpts)))
  return { pokemon, total }
}

async function fetchDetail(nameOrId: string | number, cacheOpts: RequestInit): Promise<Pokemon> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${nameOrId}`,
    cacheOpts
  )
  if (!res.ok) throw new Error(`Failed to fetch pokemon: ${nameOrId}`)
  return res.json() as Promise<Pokemon>
}
