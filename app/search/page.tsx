import ClientSearch from '@/components/search/ClientSearch'

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">搜索</h1>
      <ClientSearch />
    </div>
  )
}
