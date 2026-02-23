'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchForm from '@/components/search/SearchForm'
import SearchResults from '@/components/search/SearchResults'
import { SearchParams as SearchParamsType } from '@/components/search/SearchResult'
import { useClientSearch } from '@/components/search/useClientSearch'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { search, isSearching, error, results } = useClientSearch()
  const [hasInitialSearch, setHasInitialSearch] = useState(false)

  useEffect(() => {
    const query = searchParams.get('term') || ''
    const domain = searchParams.get('domain') || undefined
    const tag = searchParams.get('tag') || undefined
    const year = searchParams.get('year') || undefined
    const region = searchParams.get('region') || undefined

    if (query || domain || tag || year || region) {
      search({ query, domain, tag, year, region })
      setHasInitialSearch(true)
    }
  }, [searchParams, search])

  const handleSearch = (params: SearchParamsType) => {
    search(params)
    setHasInitialSearch(true)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
        搜索
      </h1>
      
      <div className="mb-8">
        <SearchForm
          onSearch={handleSearch}
          isSearching={isSearching}
          initialValues={{ query: searchParams.get('term') || '' }}
        />
      </div>

      {(hasInitialSearch || results.length > 0) && (
        <SearchResults results={results} error={error} />
      )}
    </div>
  )
}