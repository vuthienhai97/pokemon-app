export const PER_PAGE = 24

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TypeInfo {
  name: string
  url: string
}

/** Lightweight card data — no need to fetch individual pokemon detail endpoints */
export interface PokemonEntry {
  name: string
  id: number
  spriteUrl: string
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function idFromUrl(url: string): number {
  return parseInt(url.split('/').filter(Boolean).at(-1) ?? '0')
}

function spriteFromId(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

interface RawListItem {
  name: string
  url: string
}

interface RawTypeDetail {
  pokemon: Array<{ pokemon: RawListItem; slot: number }>
}

interface RawListResponse {
  count: number
  results: RawListItem[]
}

interface RawTypesResponse {
  results: TypeInfo[]
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all available Pokémon types.
 * Pass `cacheOpts` to apply Next.js server-side caching when called from a
 * Server Component; the option is silently ignored in browser context.
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
 * Fetch a paginated list of Pokémon, optionally filtered by one or more types
 * (intersection — a Pokémon must belong to ALL selected types).
 * Works in both Server Components (pass cacheOpts) and Client Components.
 */
export async function fetchPokemonList(
  selectedTypes: string[],
  page: number,
  cacheOpts: RequestInit = { next: { revalidate: 3600 } }
): Promise<{ entries: PokemonEntry[]; total: number }> {
  if (selectedTypes.length === 0) {
    return fetchPage(page, cacheOpts)
  }
  return fetchByTypes(selectedTypes, page, cacheOpts)
}

// ─── Private fetchers ─────────────────────────────────────────────────────────

async function fetchPage(
  page: number,
  cacheOpts: RequestInit
): Promise<{ entries: PokemonEntry[]; total: number }> {
  const offset = (page - 1) * PER_PAGE
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${PER_PAGE}&offset=${offset}`,
    cacheOpts
  )
  if (!res.ok) throw new Error('Failed to fetch pokemon list')
  const data = (await res.json()) as RawListResponse

  const entries: PokemonEntry[] = data.results.map((p) => {
    const id = idFromUrl(p.url)
    return { name: p.name, id, spriteUrl: spriteFromId(id) }
  })
  return { entries, total: data.count }
}

async function fetchByTypes(
  types: string[],
  page: number,
  cacheOpts: RequestInit
): Promise<{ entries: PokemonEntry[]; total: number }> {
  const responses = await Promise.all(
    types.map((t) =>
      fetch(`https://pokeapi.co/api/v2/type/${t}`, cacheOpts).then(
        (r) => r.json() as Promise<RawTypeDetail>
      )
    )
  )

  const sets = responses.map((r) => new Set(r.pokemon.map((p) => p.pokemon.name)))
  const allNames = [...sets[0]].filter((name) => sets.every((s) => s.has(name)))

  const total = allNames.length
  const offset = (page - 1) * PER_PAGE
  const page_names = allNames.slice(offset, offset + PER_PAGE)

  // Build a url lookup from the first type response (all types share same pokemon urls)
  const urlMap = new Map(responses[0].pokemon.map((p) => [p.pokemon.name, p.pokemon.url]))

  const entries: PokemonEntry[] = page_names.map((name) => {
    const id = idFromUrl(urlMap.get(name) ?? '')
    return { name, id, spriteUrl: spriteFromId(id) }
  })

  return { entries, total }
}
