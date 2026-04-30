import { Suspense } from 'react'
import PokemonController from './components/PokemonController'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PokemonController />
    </Suspense>
  )
}
