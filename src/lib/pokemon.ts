const BASE_URL = 'https://pokeapi.co/api/v2'
export const PER_PAGE = 20

export interface PokemonTypeBadge {
  slot: number
  type: { name: string; url: string }
}

export interface Pokemon {
  id: number
  name: string
  sprites: {
    other: {
      'official-artwork': {
        front_default: string | null
      }
    }
  }
  types: PokemonTypeBadge[]
}

export interface TypeInfo {
  name: string
  url: string
}

interface PokeListResponse {
  count: number
  results: Array<{ name: string; url: string }>
}

interface TypeDetailResponse {
  pokemon: Array<{ pokemon: { name: string; url: string }; slot: number }>
}

interface AllTypesResponse {
  results: TypeInfo[]
}

export async function getAllTypes(): Promise<TypeInfo[]> {
  const res = await fetch(`${BASE_URL}/type?limit=100`, {
    next: { revalidate: 86400 },
  })
  if (!res.ok) throw new Error('Failed to fetch types')
  const data = (await res.json()) as AllTypesResponse
  return data.results.filter(
    (t) => t.name !== 'unknown' && t.name !== 'shadow'
  )
}

export async function getPokemonPage(
  selectedTypes: string[],
  page: number
): Promise<{ pokemon: Pokemon[]; total: number }> {
  if (selectedTypes.length === 0) {
    return fetchPaginatedPokemon(page)
  }
  return fetchPokemonByTypes(selectedTypes, page)
}

async function fetchPaginatedPokemon(
  page: number
): Promise<{ pokemon: Pokemon[]; total: number }> {
  const offset = (page - 1) * PER_PAGE
  const res = await fetch(
    `${BASE_URL}/pokemon?limit=${PER_PAGE}&offset=${offset}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error('Failed to fetch pokemon list')
  const data = (await res.json()) as PokeListResponse

  const pokemon = await Promise.all(
    data.results.map((p) => fetchPokemonDetail(p.name))
  )
  return { pokemon, total: data.count }
}

async function fetchPokemonByTypes(
  types: string[],
  page: number
): Promise<{ pokemon: Pokemon[]; total: number }> {
  const typeResponses = await Promise.all(
    types.map((type) =>
      fetch(`${BASE_URL}/type/${type}`, { next: { revalidate: 3600 } }).then(
        (r) => r.json() as Promise<TypeDetailResponse>
      )
    )
  )

  const sets = typeResponses.map(
    (r) => new Set(r.pokemon.map((p) => p.pokemon.name))
  )
  const names = [...sets[0]].filter((name) => sets.every((s) => s.has(name)))

  const total = names.length
  const offset = (page - 1) * PER_PAGE
  const paginated = names.slice(offset, offset + PER_PAGE)

  const pokemon = await Promise.all(paginated.map(fetchPokemonDetail))
  return { pokemon, total }
}

async function fetchPokemonDetail(nameOrId: string | number): Promise<Pokemon> {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`Failed to fetch pokemon: ${nameOrId}`)
  return res.json() as Promise<Pokemon>
}
