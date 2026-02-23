"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import pako from "pako"

interface SearchResult {
  title: string
  desc: string
  url: string
}

const repos = [
  { domain: "digital.transchinese.org", file: "/search-index/repo-digital-transchinese-org.json.gz", name: "Digital Archive" }
]

export default function ClientSearch() {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [status, setStatus] = React.useState("")

  const search = async () => {
    if (!query.trim()) return
    setStatus("Loading...")
    try {
      const res = await fetch(repos[0].file)
      const compressed = await res.arrayBuffer()
      const decompressed = pako.inflate(new Uint8Array(compressed), { to: "string" })
      const data = JSON.parse(decompressed)
      const found: SearchResult[] = []
      for (const [key, doc] of Object.entries(data)) {
        const d = doc as any
        if ((d.description || "").toLowerCase().includes(query.toLowerCase())) {
          found.push({ 
            title: key.split("/").pop() || key, 
            desc: d.description || "", 
            url: "https://" + repos[0].domain + "/" + key.replace(/\.[^/.]+$/, "") 
          })
        }
        if (found.length >= 10) break
      }
      setResults(found)
      setStatus("Found " + found.length + " results")
    } catch (e: any) {
      setStatus("Error: " + e.message)
    }
  }

  return React.createElement("div", { className: "space-y-4" },
    React.createElement("div", { className: "flex gap-2" },
      React.createElement("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search...", className: "flex-1 px-4 py-2 border rounded" }),
      React.createElement("button", { onClick: search, className: "px-6 py-2 bg-blue-600 text-white rounded" }, "Search")
    ),
    status && React.createElement("div", { className: "text-sm text-gray-600" }, status),
    React.createElement("div", { className: "space-y-3" },
      results.map((r, i) => React.createElement("div", { key: i, className: "p-4 bg-gray-50 rounded" },
        React.createElement("a", { href: r.url, target: "_blank", className: "text-blue-600 font-medium hover:underline" }, r.title),
        React.createElement("p", { className: "text-sm text-gray-600 mt-1" }, r.desc.slice(0, 200) + "...")
      ))
    )
  )
}
