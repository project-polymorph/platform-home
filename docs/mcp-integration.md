# MCP Integration Documentation

## Overview

This project includes a complete Model Context Protocol (MCP) server integration that allows AI assistants like Claude Code to search the Chinese Digital Library for Gender Diversity through a standardized API interface.

## Architecture

### All-in-One Deployment

- **Platform**: Vercel Serverless
- **Framework**: Next.js 15 with App Router
- **Transport**: HTTP-based MCP server
- **Integration**: Shared codebase with web application

### Components

```
├── app/[transport]/route.ts     # MCP server endpoint
├── lib/search-engine.ts         # Shared search logic
└── scripts/test-mcp-client.mjs  # Test client
```

## MCP Server Configuration

### Endpoint

- **URL**: `http://localhost:3000/mcp` (development)
- **URL**: `https://your-domain.vercel.app/mcp` (production)
- **Transport**: HTTP
- **Protocol**: JSON-RPC 2.0 compliant

### Tools Available

#### `search_library`

Search the Chinese Digital Library for Gender Diversity with advanced filtering and pagination.

**Parameters:**

- `query` (string, optional): Search term to match in document titles or descriptions
- `domain` (string, optional): Filter by specific domain
- `tag` (string, optional): Filter by specific tag
- `year` (string, optional): Filter by year
- `region` (string, optional): Filter by region
- `limit` (number, default: 10, max: 50): Maximum number of results to return
- `offset` (number, default: 0): Number of results to skip for pagination

**Response Format:**

```json
{
  "results": [...],
  "pagination": {
    "total_count": 600,
    "returned_count": 10,
    "limit": 10,
    "offset": 0,
    "has_more": true,
    "next_offset": 10,
    "page": 1,
    "total_pages": 60
  }
}
```

## Setup Instructions

### 1. Claude Code Integration

Add the MCP server to Claude Code:

```bash
# Development
claude mcp add gender-diversity-library --transport http http://localhost:3000/mcp

# Production
claude mcp add gender-diversity-library --transport http https://your-domain.vercel.app/mcp
```

### 2. Verify Connection

Check MCP server status:

```bash
claude mcp list
```

### 3. Test Functionality

Run the test script:

```bash
node scripts/test-mcp-client.mjs
```

## Usage Examples

### Basic Search

```javascript
// Search for documents about "transgender"
{
  "name": "search_library",
  "arguments": {
    "query": "transgender",
    "limit": 5
  }
}
```

### Advanced Search with Filters

```javascript
// Search with multiple filters
{
  "name": "search_library",
  "arguments": {
    "query": "gender identity",
    "domain": "academic",
    "year": "2023",
    "limit": 10,
    "offset": 0
  }
}
```

### Pagination

```javascript
// Get next page of results
{
  "name": "search_library",
  "arguments": {
    "query": "transgender",
    "limit": 10,
    "offset": 10  // Use next_offset from previous response
  }
}
```

## Implementation Details

### Technology Stack

- **MCP Framework**: `@vercel/mcp-adapter`
- **Validation**: Zod schemas
- **Search Engine**: Shared with web application
- **Type Safety**: Full TypeScript support

### Key Features

- ✅ JSON-RPC 2.0 compliant responses
- ✅ Proper error handling and validation
- ✅ MCP-standard pagination
- ✅ Token limit compliance (25,000 token limit)
- ✅ Shared search logic with web app
- ✅ Type-safe parameter validation

### Performance Optimizations

- **Default Limit**: 10 results to prevent token overflow
- **Maximum Limit**: 50 results per request
- **Efficient Pagination**: Offset-based pagination
- **Shared Logic**: No code duplication between web and MCP

## Development

### Running Tests

```bash
# Start development server
yarn dev

# Test MCP integration
node scripts/test-mcp-client.mjs

# Test with Claude Code
claude mcp list
```

### Debugging

Enable verbose logging in the MCP handler:

```typescript
{
  basePath: '',
  verboseLogs: true,
  maxDuration: 60
}
```

## Deployment

### Vercel Deployment

The MCP server deploys automatically with the main application:

```bash
# Deploy to Vercel
vercel --prod

# Update Claude Code configuration
claude mcp remove gender-diversity-library
claude mcp add gender-diversity-library --transport http https://your-domain.vercel.app/mcp
```

### Environment Variables

No additional environment variables required for MCP functionality.

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify server is running on correct port
   - Check transport type (use `--transport http`)
   - Ensure URL is accessible

2. **Tool Call Errors**
   - Check parameter validation (Zod schemas)
   - Verify JSON-RPC 2.0 compliance
   - Review server logs for detailed errors

3. **Response Too Large**
   - Reduce `limit` parameter (max 50)
   - Use pagination with `offset`
   - Filter results with specific parameters

### Debug Commands

```bash
# Test server connectivity
curl http://localhost:3000/mcp

# List MCP servers with debug info
claude mcp list --debug

# View server logs
# Check Next.js development logs
```

## Security Considerations

- **Rate Limiting**: Implement rate limiting for production
- **Input Validation**: All parameters validated with Zod
- **CORS**: Configure appropriate CORS policies for production
- **Authentication**: Consider adding authentication for production use
