'use client'

import { useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { TypeInfo } from '@/lib/pokemon'
import TypeAutocomplete from './TypeAutocomplete'

interface TypeFilterSSRProps {
  allTypes: TypeInfo[]
  selectedTypes: string[]
}

export default function TypeFilterSSR({ allTypes, selectedTypes }: TypeFilterSSRProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const handleChange = useCallback(
    (types: string[]) => {
      const params = new URLSearchParams()
      types.forEach((t) => params.append('types', t))
      startTransition(() => {
        router.push(`/pokemon-ssr${params.toString() ? `?${params.toString()}` : ''}`)
      })
    },
    [router]
  )

  return (
    <TypeAutocomplete
      allTypes={allTypes}
      selectedTypes={selectedTypes}
      onChange={handleChange}
    />
  )
}
