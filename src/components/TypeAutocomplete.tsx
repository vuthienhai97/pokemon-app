'use client'

import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { TypeInfo } from '@/lib/types'
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
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const labelId = useId()

  const options = allTypes.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  )

  const toggle = useCallback(
    (typeName: string) => {
      if (selectedTypes.includes(typeName)) {
        onChange(selectedTypes.filter((t) => t !== typeName))
      } else {
        onChange([...selectedTypes, typeName])
      }
      setQuery('')
      inputRef.current?.focus()
    },
    [selectedTypes, onChange]
  )

  const removeChip = useCallback(
    (typeName: string, e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(selectedTypes.filter((t) => t !== typeName))
    },
    [selectedTypes, onChange]
  )

  const clearAll = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onChange([])
      setQuery('')
      inputRef.current?.focus()
    },
    [onChange]
  )

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsFocused(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const hasValue = selectedTypes.length > 0 || query.length > 0

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── MUI-style outlined input container ── */}
      <div
        className={`
          relative flex flex-wrap items-center gap-1.5
          min-h-14 px-3 pt-2.5 pb-2 pr-20
          bg-white rounded cursor-text transition-all
          ${isFocused
            ? 'ring-2 ring-red-500'
            : 'ring-1 ring-gray-400 hover:ring-gray-900'
          }
        `}
        onClick={() => {
          inputRef.current?.focus()
          setIsOpen(true)
        }}
      >
        {/* Floating label */}
        <label
          id={labelId}
          className={`
            absolute left-3 pointer-events-none select-none transition-all duration-150
            ${hasValue || isFocused
              ? '-top-2.5 text-xs px-1 bg-white leading-none'
              : 'top-1/2 -translate-y-1/2 text-base'
            }
            ${isFocused ? 'text-red-500' : 'text-gray-500'}
          `}
        >
          Pokémon Type
        </label>

        {/* Selected chips — inside the field */}
        {selectedTypes.map((type) => (
          <span
            key={type}
            className={`
              ${getTypeClass(type)} text-white text-xs font-semibold
              inline-flex items-center gap-1 pl-2.5 pr-1 h-7 rounded
              shrink-0 capitalize
            `}
          >
            {type}
            <button
              onMouseDown={(e) => removeChip(type, e)}
              className="inline-flex items-center justify-center w-4 h-4 ml-0.5 rounded-sm hover:bg-white/25 transition-colors"
              aria-label={`Remove ${type}`}
            >
              <svg viewBox="0 0 14 14" className="w-2.5 h-2.5 fill-current">
                <path d="M14 1.41L12.59 0 7 5.59 1.41 0 0 1.41 5.59 7 0 12.59 1.41 14 7 8.41 12.59 14 14 12.59 8.41 7z" />
              </svg>
            </button>
          </span>
        ))}

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          aria-labelledby={labelId}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            setIsFocused(true)
            setIsOpen(true)
          }}
          className="flex-1 min-w-20 outline-none bg-transparent text-sm text-gray-900 py-0.5"
        />

        {/* Clear + arrow buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          {selectedTypes.length > 0 && (
            <>
              <button
                onMouseDown={clearAll}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Clear all"
                title="Clear"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
              <span className="w-px h-5 bg-gray-300 mx-0.5" />
            </>
          )}
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              if (isOpen) {
                setIsOpen(false)
                inputRef.current?.blur()
                setIsFocused(false)
              } else {
                setIsOpen(true)
                inputRef.current?.focus()
              }
            }}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Toggle dropdown"
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-5 h-5 fill-current transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Dropdown ── */}
      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-50 w-full mt-0.5 bg-white rounded py-1 overflow-y-auto max-h-64"
          style={{
            boxShadow:
              '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
          }}
        >
          {options.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400 text-center">
              No results for &ldquo;{query}&rdquo;
            </li>
          ) : (
            options.map((type) => {
              const isSelected = selectedTypes.includes(type.name)
              return (
                <li key={type.name} role="option" aria-selected={isSelected}>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault()
                      toggle(type.name)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm capitalize
                      transition-colors duration-100
                      ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    {/* Checkmark slot */}
                    <span className="w-5 h-5 shrink-0 flex items-center justify-center text-red-500">
                      {isSelected && (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </span>
                    {/* Type color indicator */}
                    <span className={`${getTypeClass(type.name)} w-3.5 h-3.5 rounded-full shrink-0`} />
                    {/* Label */}
                    <span className="text-gray-800">{type.name}</span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
