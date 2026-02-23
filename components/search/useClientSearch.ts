/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import pako from 'pako'
import { SearchResult, SearchParams } from './SearchResult'

const REPO_INDEXES: Record<string, string> = {
  "digital.transchinese.org": "/search-index/repo-digital-transchinese-org.json.gz",
  "novel.transchinese.org": "/search-index/repo-novel-transchinese-org.json.gz",
  "comic.transchinese.org": "/search-index/repo-comic-transchinese-org.json.gz",
  "archive.cdtsf.com": "/search-index/repo-archive-cdtsf-com.json.gz",
  "news.transchinese.org": "/search-index/repo-news-transchinese-org.json.gz",
  "enovel.cdtsf.com": "/search-index/repo-enovel-cdtsf-com.json.gz",
  "fnovel.cdtsf.com": "/search-index/repo-fnovel-cdtsf-com.json.gz",
  "snovel.cdtsf.com": "/search-index/repo-snovel-cdtsf-com.json.gz",
  "unovel.transchinese.org": "/search-index/repo-unovel-transchinese-org.json.gz",
  "xnovel.transchinese.org": "/search-index/repo-xnovel-transchinese-org.json.gz",
}

const cache: Record<string, any> = {}

async function loadIndex(domain: string): Promise<any | null> {
  if (cache[domain]) return cache[domain]
  const file = REPO_INDEXES[domain]
  if (!file) return null
  
  try {
    const res = await fetch(file)
    const compressed = await res.arrayBuffer()
    const decompressed = pako.inflate(new Uint8Array(compressed), { to: 'string' })
    const data = JSON.parse(decompressed)
    cache[domain] = data
    return data
  } catch (e) {
    console.error('Failed to load', domain, e)
    return null
  }
}

export function useClientSearch() {
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])

  const search = useCallback(async (params: SearchParams) => {
    setIsSearching(true)
    setError(null)
    setResults([])

    try {
      const domains = params.domain ? params.domain.split(',') : Object.keys(REPO_INDEXES)
      const lowerQuery = params.query.toLowerCase()
      const found: SearchResult[] = []
      
      for (const domain of domains) {
        const index = await loadIndex(domain)
        if (!index) continue
        
        for (const [key, doc] of Object.entries(index)) {
          const d = doc as any
          const keyLower = key.toLowerCase()
          const descLower = (d.description || '').toLowerCase()
          
          if (lowerQuery && !keyLower.includes(lowerQuery) && !descLower.includes(lowerQuery)) {
            continue
          }
          
          if (params.tag && d.tags && !d.tags.includes(params.tag)) continue
          if (params.year && d.date && !d.date.includes(params.year)) continue
          if (params.region && d.region !== params.region) continue
          
          found.push({
            url: 'https://' + domain + '/' + key.replace(/\.[^/.]+$/, ''),
            description: d.description || '',
            tags: d.tags || [],
            type: d.type || '',
            author: d.author || '',
            date: d.date || '',
            region: d.region || '',
            format: d.format || '',
            size: d.size || 0,
            link: 'https://' + domain + '/' + key.replace(/\.[^/.]+$/, ''),
          })
          
          if (found.length >= 100) break
        }
        
        if (found.length >= 100) break
      }
      
      setResults(found)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSearching(false)
    }
  }, [])

  return { search, isSearching, error, results }
}