#!/usr/bin/env node

// Test script for MCP server
// Usage: node scripts/test-mcp.js

const baseUrl = process.env.MCP_URL || 'http://localhost:3000/api/mcp'

async function testMCPServer() {
  console.log('Testing MCP Server at:', baseUrl)
  console.log('=====================================\n')

  // Test 1: GET server info
  console.log('1. Testing GET /api/mcp (server info)...')
  try {
    const response = await fetch(baseUrl)
    const data = await response.json()
    console.log('✓ Server info:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('✗ Failed:', error.message)
  }
  console.log('\n')

  // Test 2: List tools
  console.log('2. Testing tools/list...')
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'tools/list' }),
    })
    const data = await response.json()
    console.log('✓ Available tools:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('✗ Failed:', error.message)
  }
  console.log('\n')

  // Test 3: Search with basic query
  console.log('3. Testing search_library tool (basic query)...')
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'search_library',
          arguments: {
            query: 'transgender',
          },
        },
      }),
    })
    const data = await response.json()
    const content = JSON.parse(data.content[0].text)
    console.log(`✓ Found ${content.resultCount} results`)
    console.log('First 3 results:')
    content.results.slice(0, 3).forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.description}`)
      console.log(`     URL: ${result.url}`)
      console.log(`     Tags: ${result.tags.join(', ')}`)
    })
  } catch (error) {
    console.error('✗ Failed:', error.message)
  }
  console.log('\n')

  // Test 4: Search with filters
  console.log('4. Testing search_library tool (with filters)...')
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'search_library',
          arguments: {
            query: '',
            year: '2023',
            tag: 'trans',
          },
        },
      }),
    })
    const data = await response.json()
    const content = JSON.parse(data.content[0].text)
    console.log(`✓ Found ${content.resultCount} results for year:2023, tag:trans`)
  } catch (error) {
    console.error('✗ Failed:', error.message)
  }
  console.log('\n')

  // Test 5: Invalid tool
  console.log('5. Testing invalid tool call...')
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'invalid_tool',
          arguments: {},
        },
      }),
    })
    const data = await response.json()
    if (data.error) {
      console.log('✓ Correctly returned error:', data.error.message)
    } else {
      console.error('✗ Should have returned an error')
    }
  } catch (error) {
    console.error('✗ Failed:', error.message)
  }

  console.log('\n=====================================')
  console.log('MCP server testing complete!')
}

// Run tests
testMCPServer().catch(console.error)
