import { useSearchParams, useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { Search, SortAsc } from 'lucide-react'
import ProductGrid from '../components/product/ProductGrid'
import { getProducts, getProductsByCategory } from '../api/products'
import { getCategories } from '../api/categories'

const sortOptions = [
  { value: 'default', label: 'Sort By' },
  { value: 'price-low', label: 'Price, Low to High' },
  { value: 'price-high', label: 'Price, High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name, A to Z' },
]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const pathCategory = params.category || ''
  const activeCategory = pathCategory || 'all'

  const [allProducts, setAllProducts] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true

    async function fetchData() {
      setLoading(true)
      setError(null)
      setAllProducts([])
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          activeCategory === 'all' ? getProducts() : getProductsByCategory(activeCategory),
        ])
        if (!active) return
        setAllCategories(cats)
        setAllProducts(prods)
      } catch (err) {
        if (active) setError(err.message || 'Failed to load products')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchData()
    return () => {
      active = false
    }
  }, [activeCategory, retryKey])

  const filtered = useMemo(() => {
    let result = allProducts

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    const sortBy = searchParams.get('sort') || 'default'
    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    return result
  }, [allProducts, searchQuery, searchParams])

  const categoryTabs = [{ id: 'all', name: 'ALL' }, ...allCategories.map((c) => ({
    id: c.id,
    name: c.name.toUpperCase(),
  }))]

  const handleSortChange = (e) => {
    const newSort = e.target.value
    if (newSort === 'default') {
      searchParams.delete('sort')
      setSearchParams(searchParams)
    } else {
      searchParams.set('sort', newSort)
      setSearchParams(searchParams)
    }
  }

  const handleCategoryChange = (catId) => {
    navigate(catId === 'all' ? '/shop' : `/shop/${catId}`)
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-5xl leading-none text-espresso sm:text-6xl">SHOP BLY</h1>
          <p className="mt-3 text-base text-taupe">
            Explore our collection of beauty and self-care essentials.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-[#E8DED2] bg-paper pl-10 pr-4 py-2.5 text-sm text-espresso placeholder:text-taupe/50 focus:outline-none focus:ring-1 focus:ring-champagne"
              aria-label="Search products"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-taupe">
              {loading ? 'Loading collection' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
            </span>

            <div className="relative">
              <select
                value={searchParams.get('sort') || 'default'}
                onChange={handleSortChange}
                className="appearance-none border border-[#E8DED2] bg-paper pl-3 pr-8 py-2 text-xs text-espresso focus:outline-none focus:ring-1 focus:ring-champagne"
                aria-label="Sort products"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <SortAsc size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-taupe" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-[#E8DED2] pb-1">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              className={`border-b-2 px-1 pb-2 text-xs font-sans uppercase tracking-widest transition-colors
                ${activeCategory === tab.id
                  ? 'border-espresso text-espresso'
                  : 'border-transparent text-taupe hover:text-espresso'
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-taupe">Unable to load products. Please try again later.</p>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-5 btn-primary text-xs"
            >
              RETRY
            </button>
          </div>
        ) : !loading && filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-taupe">
            No products found. Try adjusting your search or filters.
          </p>
        ) : (
          <ProductGrid products={filtered} loading={loading} skeletonCount={8} eager />
        )}
      </div>
    </section>
  )
}
