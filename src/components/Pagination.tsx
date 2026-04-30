'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  /** Base path to push on page change, e.g. "/pokemon" or "/pokemon-ssr" */
  basePath?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (page <= 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }
      const qs = params.toString()
      const dest = basePath ? `${basePath}${qs ? `?${qs}` : ''}` : `?${qs}`
      startTransition(() => {
        router.push(dest)
      })
    },
    [router, searchParams, basePath]
  )

  if (totalPages <= 1) return null

  const getPageNumbers = (): Array<number | '...'> => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: Array<number | '...'> = [1]
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div
      className={`flex items-center justify-center gap-1.5 sm:gap-2 mt-10 flex-wrap transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}
    >
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1 || isPending}
        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>

      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            disabled={isPending}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
              page === currentPage
                ? 'bg-red-500 text-white shadow-sm'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages || isPending}
        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  )
}
