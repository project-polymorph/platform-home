import { createMcpHandler } from '@vercel/mcp-adapter'
import { z } from 'zod'
import { searchDocuments } from '@/lib/search-engine'

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      'search_library',
      'Search the Chinese Digital Library for Gender Diversity. Returns matching documents based on search criteria.',
      z.object({
        query: z
          .string()
          .describe('Search term to match in document titles or descriptions')
          .optional(),
        domain: z.string().describe('Filter by specific domain').optional(),
        tag: z.string().describe('Filter by specific tag').optional(),
        year: z.string().describe('Filter by year').optional(),
        region: z.string().describe('Filter by region').optional(),
        limit: z
          .number()
          .min(1)
          .max(50)
          .default(10)
          .describe('Maximum number of results to return (default: 10, max: 50)'),
        offset: z
          .number()
          .min(0)
          .default(0)
          .describe('Number of results to skip for pagination (default: 0)'),
      }),
      async ({ query, domain, tag, year, region, limit = 10, offset = 0 }) => {
        console.log('[MCP] Searching with params:', {
          query,
          domain,
          tag,
          year,
          region,
          limit,
          offset,
        })

        const allResults = searchDocuments({
          query: query || '',
          domain,
          tag,
          year,
          region,
        })

        // Apply pagination
        const paginatedResults = allResults.slice(offset, offset + limit)
        const hasMore = offset + limit < allResults.length

        console.log(
          '[MCP] Found',
          allResults.length,
          'total results, returning',
          paginatedResults.length,
          'results'
        )

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  results: paginatedResults,
                  pagination: {
                    total_count: allResults.length,
                    returned_count: paginatedResults.length,
                    limit,
                    offset,
                    has_more: hasMore,
                    next_offset: hasMore ? offset + limit : null,
                    page: Math.floor(offset / limit) + 1,
                    total_pages: Math.ceil(allResults.length / limit),
                  },
                },
                null,
                2
              ),
            },
          ],
        }
      }
    )
  },
  {
    capabilities: {
      tools: {
        search_library: {
          description: 'Search the Chinese Digital Library for Gender Diversity',
        },
      },
    },
  },
  {
    basePath: '',
    verboseLogs: true,
    maxDuration: 60,
  }
)

export { handler as GET, handler as POST, handler as DELETE }
