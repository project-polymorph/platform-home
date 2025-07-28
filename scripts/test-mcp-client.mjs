#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const origin = process.argv[2] || 'http://localhost:3000'

console.log(`Testing MCP server at: ${origin}/mcp`)

async function testMcpServer() {
  try {
    // Create transport and client
    const transport = new StreamableHTTPClientTransport(new URL(`${origin}/mcp`))
    const client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {},
        },
      }
    )

    console.log('Connecting to MCP server...')
    await client.connect(transport)
    console.log('✅ Connected successfully!')

    // List available tools
    console.log('\n📋 Listing available tools...')
    const toolsResponse = await client.listTools()
    console.log('Available tools:', JSON.stringify(toolsResponse.tools, null, 2))

    // Test the search_library tool with pagination
    console.log('\n🔍 Testing search_library tool with pagination...')
    const searchResult = await client.callTool({
      name: 'search_library',
      arguments: {
        query: 'transgender',
        limit: 5,
        offset: 0,
      },
    })

    console.log('First page search result:')
    const firstPageData = JSON.parse(searchResult.content[0].text)
    console.log(`Total results: ${firstPageData.pagination.total_count}`)
    console.log(`Returned: ${firstPageData.pagination.returned_count}`)
    console.log(`Page: ${firstPageData.pagination.page}/${firstPageData.pagination.total_pages}`)
    console.log(`Has more: ${firstPageData.pagination.has_more}`)

    // Test pagination - get second page
    if (firstPageData.pagination.has_more) {
      console.log('\n📄 Testing pagination - second page...')
      const secondPageResult = await client.callTool({
        name: 'search_library',
        arguments: {
          query: 'transgender',
          limit: 5,
          offset: firstPageData.pagination.next_offset,
        },
      })

      const secondPageData = JSON.parse(secondPageResult.content[0].text)
      console.log(
        `Second page: ${secondPageData.pagination.page}/${secondPageData.pagination.total_pages}`
      )
      console.log(`Returned: ${secondPageData.pagination.returned_count} results`)
    }

    await client.close()
    console.log('\n✅ Test completed successfully!')
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testMcpServer()
