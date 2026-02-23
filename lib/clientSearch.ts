/* eslint-disable @typescript-eslint/no-explicit-any */
import pako from 'pako'
import { SearchResult } from '@/components/search/SearchResult'

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

const cache: Record<string, Promise<any | null>> = {}

async function loadIndex(domain: string): Promise<any | null> {
  if (domain in cache) {
    return cache[domain]
  }
  const file = REPO_INDEXES[domain]
  if (!file) return null
  const promise: Promise<any | null> = (async () => {
    try {
      const res = await fetch(file)
      const compressed = await res.arrayBuffer()
      const decompressed = pako.inflate(new Uint8Array(compressed), { to: 'string' })
      const data = JSON.parse(decompressed)
      return data
    } catch (e) {
      console.error('Failed to load', domain, e)
      return null
    }
  })()
  cache[domain] = promise
  return promise
}

export async function clientSearch(
  query: string,
  domain?: string,
  tag?: string,
  year?: string,
  region?: string
): Promise<SearchResult[]> {
  const domains = domain
    ? domain.split(',').map(d => d.trim()).filter(Boolean)
    : Object.keys(REPO_INDEXES)
  const lowerQuery = query.toLowerCase()
  const found: SearchResult[] = []
  for (const d of domains) {
    if (found.length >= 100) break
    const index = await loadIndex(d)
    if (!index) continue
    for (const [key, doc] of Object.entries(index)) {
      if (found.length >= 100) break
      const docAny = doc as any
      const keyLower = key.toLowerCase()
      const descLower = (docAny.description || '').toLowerCase()
      if (lowerQuery && !keyLower.includes(lowerQuery) && !descLower.includes(lowerQuery)) continue
      if (tag && (!docAny.tags || !docAny.tags.includes(tag))) continue
      if (year && (!docAny.date || !docAny.date.includes(year))) continue
      if (region && docAny.region !== region) continue
      found.push({
        url: 'https://' + d + '/' + key.replace(/\.[^/.]+$/, ''),
        description: docAny.description || '',
        tags: docAny.tags || [],
        type: docAny.type || '',
        author: docAny.author || '',
        date: docAny.date || '',
        region: docAny.region || '',
        format: docAny.format || '',
        size: docAny.size || 0,
        link: 'https://' + d + '/' + key.replace(/\.[^/.]+$/, ''),
      })
    }
  }
  return found
}