import { NextResponse } from 'next/server'
import { searchDocuments, SearchParams } from '@/lib/search-engine'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const searchConfig: SearchParams = {
    query: searchParams.get('term') || '',
    domain: searchParams.get('domain') || '',
    tag: searchParams.get('tag') || undefined,
    year: searchParams.get('year') || undefined,
    region: searchParams.get('region') || undefined,
  }

  const results = searchDocuments(searchConfig)
  return NextResponse.json(results)
}
