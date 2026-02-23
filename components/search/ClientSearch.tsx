'use client'

import React, { useState, useEffect } from 'react'
import pako from 'pako'

interface SearchResult {
  url: string
  title: string
  description: string
  repo: string
}

const repos = [
  { domain: 'digital.transchinese.org', file: '/search-index/repo-digital-transchinese-org.json.gz', name: '数字档案' },
  { domain: 'comic.transchinese.org', file: '/search-index/repo-comic-transchinese-org.json.gz', name: '漫画' },
  { domain: 'unovel.transchinese.org', file: '/search-index/repo-unovel-transchinese-org.json.gz', name: '小说更新' },
]

export default function ClientSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const stripExt = (filename: string) => filename.replace(/\.[^/.]+$/, '')

  const loadRepo = async (repo: typeof repos[0]) => {
    try {
      setStatus(`加载 ${repo.name}...`)
      const res = await fetch(repo.file)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      const compressed = await res.arrayBuffer()
      const decompressed = pako.inflate(new Uint8Array(compressed), { to: 'string' })
      const data = JSON.parse(decompressed)
      
      return { repo, data }
    } catch (e) {
      console.error('加载失败:', repo.name, e)
      return null
    }
  }

  const search = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setResults([])
    setStatus('搜索中...')
    
    const lowerQuery = query.toLowerCase()
    const allResults: SearchResult[] = []
    
    for (const repo of repos) {
      const loaded = await loadRepo(repo)
      if (!loaded) continue
      
      const { data } = loaded
      for (const [key, doc] of Object.entries(data as Record<string, any>)) {
        if (key.toLowerCase().includes(lowerQuery) || 
            (doc.description || '').toLowerCase().includes(lowerQuery)) {
          allResults.push({
            url: `https://${repo.domain}/${stripExt(key)}`,
            title: key.split('/').pop() || key,
            description: doc.description || '',
            repo: repo.name
          })
        }
        if (allResults.length >= 50) break
      }
      
      if (allResults.length >= 50) break
    }
    
    setResults(allResults)
    setStatus(`找到 ${allResults.length} 条结果`)
    setLoading(false)
  }

  return (
    <div className=space-y-4>
      <div className=flex gap-2>
        <input
          type=text
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder=输入关键词...
          className=flex-1 px-4 py-2 border rounded
          onKeyPress={(e) => e.key === 'Enter' && search()}
        />
        <button
          onClick={search}
          disabled={loading}
          className=px-6 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400
        >
          {loading ? '搜索中...' : '搜索'}
        </button>
      </div>
      
      {status && <div className=text-sm text-gray-600>{status}</div>}
      
      <div className=space-y-3>
        {results.map((r, i) => (
          <div key={i} className=p-4 bg-gray-50 rounded>
            <a href={r.url} target=_blank rel=noopener className=text-blue-600 font-medium hover:underline>
              {r.title}
            </a>
            <p className=text-sm text-gray-600 mt-1>{r.description.slice(0, 200)}...</p>
            <span className=text-xs text-gray-400>{r.repo}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
