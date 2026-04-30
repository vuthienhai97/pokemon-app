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
