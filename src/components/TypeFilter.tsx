'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { TypeInfo } from '@/lib/pokemon'
import { getTypeClass } from '@/lib/typeColors'

interface TypeFilterProps {
  types: TypeInfo[]
  selectedTypes: string[]
}

export default function TypeFilter({ types, selectedTypes }: TypeFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const toggleType = useCallback(
    (typeName: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const current = params.getAll('types')

      params.delete('types')
      if (current.includes(typeName)) {
        current.filter((t) => t !== typeName).forEach((t) => params.append('types', t))
      } else {
        [...current, typeName].forEach((t) => params.append('types', t))
      }
      params.delete('page')

      startTransition(() => {
        router.push(`?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('types')
    params.delete('page')
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }, [router, searchParams])

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Filter by Type
        </h2>
        {selectedTypes.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
          >
            Clear all ({selectedTypes.length})
          </button>
        )}
      </div>

      <div className={`flex flex-wrap gap-2 transition-opacity ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {types.map((type) => {
          const isSelected = selectedTypes.includes(type.name)
          const colorClass = getTypeClass(type.name)
          return (
            <button
              key={type.name}
              onClick={() => toggleType(type.name)}
              aria-pressed={isSelected}
              className={`
                px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all duration-150
                ${colorClass} text-white
                ${isSelected
                  ? 'ring-2 ring-offset-1 ring-gray-700 scale-105 opacity-100'
                  : 'opacity-60 hover:opacity-90 hover:scale-105'
                }
              `}
            >
              {type.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
