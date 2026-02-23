'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchForm from '@/components/search/SearchForm'
import SearchResults from '@/components/search/SearchResults'
import { SearchParams as SearchParamsType } from '@/components/search/SearchResult'
import { useClientSearch } from '@/components/search/useClientSearch'

// Loading component
const SearchLoading = () => (
  <div className="flex justify-center p-8">
    <div className="animate-pulse">Loading...</div>
  </div>
)

// Main search component
function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { search, isSearching, error, results } = useClientSearch()

  useEffect(() => {
    const query = searchParams.get('term') || ''
    const domain = searchParams.get('domain') || ''
    const tag = searchParams.get('tag') || ''
    const year = searchParams.get('year') || ''
    const region = searchParams.get('region') || ''

    if (query || domain || tag || year || region) {
      search({ 
        query, 
        domain: domain || undefined, 
        tag: tag || undefined, 
        year: year || undefined, 
        region: region || undefined 
      })
    }
  }, [searchParams, search])

  const handleSearch = (params: SearchParamsType) => {
    // Update URL with search params
    const urlParams = new URLSearchParams()
    if (params.query) urlParams.set('term', params.query)
    if (params.domain) urlParams.set('domain', params.domain)
    if (params.tag) urlParams.set('tag', params.tag)
    if (params.year) urlParams.set('year', params.year)
    if (params.region) urlParams.set('region', params.region)
    
    router.push(`?${urlParams.toString()}`, { scroll: false })
    
    search(params)
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8 rounded-md bg-amber-50 p-4 text-center text-amber-800">
        更完善的搜索功能请访问 <a href="https://tsindex.org">tsindex.org 多元性别搜索引擎</a>
      </div>

      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold">条目检索</h1>
        <SearchForm
          onSearch={handleSearch}
          isSearching={isSearching}
          initialValues={{
            query: searchParams.get('term') || '',
            domain: searchParams.get('domain') || '',
            tag: searchParams.get('tag') || '',
            year: searchParams.get('year') || '',
            region: searchParams.get('region') || '',
          }}
        />
        <SearchResults results={results} error={error} />
      </div>
    </div>
  )
}

// Main exported component with Suspense boundary
export default function FileSearch() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  )
}