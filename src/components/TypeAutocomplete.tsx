'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { TypeInfo } from '@/lib/pokemon'
import { getTypeClass } from '@/lib/typeColors'

interface TypeAutocompleteProps {
  allTypes: TypeInfo[]
  selectedTypes: string[]
  onChange: (types: string[]) => void
}

export default function TypeAutocomplete({
  allTypes,
  selectedTypes,
  onChange,
}: TypeAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = allTypes.filter(
    (t) =>
      t.name.includes(query.toLowerCase()) &&
      !selectedTypes.includes(t.name)
  )

  const select = useCallback(
    (typeName: string) => {
      onChange([...selectedTypes, typeName])
      setQuery('')
      setIsOpen(false)
      inputRef.current?.focus()
    },
    [selectedTypes, onChange]
  )

  const remove = useCallback(
    (typeName: string) => {
      onChange(selectedTypes.filter((t) => t !== typeName))
    },
    [selectedTypes, onChange]
  )

  const clearAll = useCallback(() => onChange([]), [onChange])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-gray-600">Types:</span>
        {selectedTypes.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-600 transition-colors ml-auto"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected tags */}
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTypes.map((type) => (
            <span
              key={type}
              className={`${getTypeClass(type)} text-white text-xs font-semibold px-3 py-1 rounded-full capitalize flex items-center gap-1.5`}
            >
              {type}
              <button
                onClick={() => remove(type)}
                className="leading-none opacity-80 hover:opacity-100 text-sm font-bold"
                aria-label={`Remove ${type}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={
            selectedTypes.length > 0
              ? 'Add more types...'
              : 'Search types (e.g. fire, water)...'
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto w-full max-w-sm">
          {suggestions.map((type) => (
            <li key={type.name}>
              <button
                onMouseDown={(e) => {
                  e.preventDefault()
                  select(type.name)
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-left text-sm capitalize transition-colors"
              >
                <span
                  className={`${getTypeClass(type.name)} w-3 h-3 rounded-full shrink-0`}
                />
                {type.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query && suggestions.length === 0 && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow px-4 py-3 text-sm text-gray-400 w-full max-w-sm">
          No types match &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
