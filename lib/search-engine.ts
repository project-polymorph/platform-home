import combinedIndex from '../combined_search_index.json'

export interface Document {
  type: string
  format: string
  size: number
  md5: string
  link: string | null
  description: string
  'archived date': string
  author: string
  date: string
  region: string
  tags: string[]
}

export interface SearchIndex {
  [domain: string]: {
    [key: string]: Document
  }
}

export interface SearchParams {
  query: string
  domain?: string
  tag?: string
  year?: string
  region?: string
}

export interface SearchResult {
  url: string
  description: string
  tags: string[]
  type: string
  author: string
  date: string
  region: string
  format: string
  size: number
  link: string
}

function stripFileExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '')
}

export function searchDocuments(params: SearchParams): SearchResult[] {
  const searchResults: SearchResult[] = []
  const MAX_RESULTS = 600
  const index = combinedIndex as SearchIndex

  for (const domain in index) {
    // Skip if domains specified and current domain not included
    if (params.domain && params.domain !== '' && !params.domain.includes(domain)) {
      continue
    }

    const domainIndex = index[domain]
    for (const key in domainIndex) {
      if (searchResults.length >= MAX_RESULTS) {
        return searchResults
      }

      const document = domainIndex[key]

      // Check all filter conditions
      if (
        (params.query === '' || // Search term match
          key.toLowerCase().includes(params.query.toLowerCase()) ||
          document.description.toLowerCase().includes(params.query.toLowerCase())) &&
        (!params.tag || document.tags.includes(params.tag)) && // Tag match
        (!params.year || document.date.includes(params.year)) && // Year match
        (!params.region || document.region.toLowerCase() === params.region.toLowerCase()) // Region match
      ) {
        const link: string = document.link ? document.link : 'unknown'
        searchResults.push({
          url: `https://${domain}/${stripFileExtension(key)}`,
          description: document.description,
          tags: document.tags,
          type: document.type,
          author: document.author,
          date: document.date,
          region: document.region,
          format: document.format,
          size: document.size,
          link: link,
        })
      }
    }
  }

  return searchResults
}
