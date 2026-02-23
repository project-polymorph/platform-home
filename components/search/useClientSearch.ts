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

interface IndexDocument {
  description?: string
  tags?: string[]
  type?: string
  author?: string
  date?: string
  region?: string
  format?: string
  size?: number
}

const cache: Record<string, Record<string, IndexDocument>> = {}
const RESULT_LIMIT = 100

async function loadIndex(domain: string): Promise<Record<string, IndexDocument> | null> {
  if (cache[domain]) return cache[domain]
  const file = REPO_INDEXES[domain]
  if (!file) return null
  
  try {
    const res = await fetch(file)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const compressed = await res.arrayBuffer()
    const decompressed = pako.inflate(new Uint8Array(compressed), { to: 'string' })
    const data = JSON.parse(decompressed) as Record<string, IndexDocument>
    cache[domain] = data
    return data
  } catch (e) {
    console.error('Failed to load', domain, e)
    throw new Error(`Failed to load index for ${domain}`)
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
        if (found.length >= RESULT_LIMIT) break
        
        const index = await loadIndex(domain)
        if (!index) continue
        
        for (const [key, doc] of Object.entries(index)) {
          if (found.length >= RESULT_LIMIT) break
          
          const keyLower = key.toLowerCase()
          const descLower = (doc.description || '').toLowerCase()
          
          // 支持中文搜索：检查是否包含查询词
          const queryMatch = !lowerQuery || 
            keyLower.includes(lowerQuery) || 
            descLower.includes(lowerQuery)
          
          if (!queryMatch) continue
          
          if (params.tag && doc.tags && !doc.tags.includes(params.tag)) continue
          if (params.year && doc.date && !doc.date.includes(params.year)) continue
          if (params.region && doc.region !== params.region) continue
          
          const url = 'https://' + domain + '/' + key.replace(/\.[^/.]+$/, '')
          found.push({
            url,
            description: doc.description || '',
            tags: doc.tags || [],
            type: doc.type || '',
            author: doc.author || '',
            date: doc.date || '',
            region: doc.region || '',
            format: doc.format || '',
            size: doc.size || 0,
            link: url,
          })
        }
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