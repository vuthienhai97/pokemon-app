export type { TypeInfo, Pokemon, PokemonTypeBadge } from '@/lib/types'

export type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
