import { supabase } from '../lib/supabase'
import { cached, invalidateCached } from './cache'

const CUSTOMER_CATEGORY_SLUGS = ['face', 'body', 'fragrance', 'wellness']

function mapProduct(item) {
  const cat = item.categories || {}
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    category: cat.slug || cat.id,
    categoryName: cat.name,
    categoryId: item.category_id,
    type: item.product_type,
    price: item.price,
    shortDescription: item.short_description,
    description: item.description,
    howToUse: item.how_to_use,
    concern: item.concern,
    tags: item.tags || [],
    rating: item.rating,
    reviewCount: item.review_count,
    featured: item.featured,
    bestseller: item.bestseller,
    newArrival: item.new_arrival,
    image: item.image_url,
    isActive: item.is_active,
  }
}

async function fetchProducts({ categorySlug, flag } = {}) {
  let query = supabase
    .from('products')
    .select('*, categories!inner(*)')
    .eq('is_active', true)
    .in('categories.slug', CUSTOMER_CATEGORY_SLUGS)
    .order('created_at', { ascending: false })

  if (categorySlug) query = query.eq('categories.slug', categorySlug)
  if (flag) query = query.eq(flag, true)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data.map(mapProduct)
}

async function findProductByColumn(column, value) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq(column, value)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    if (error.code === '22P02') return null
    throw new Error(error.message)
  }
  return data
}

export function getProducts() {
  return cached('catalog:all', () => fetchProducts())
}

export async function getProductsByCategory(categorySlug) {
  if (!CUSTOMER_CATEGORY_SLUGS.includes(categorySlug)) return []
  return cached(`catalog:category:${categorySlug}`, () => fetchProducts({ categorySlug }))
}

export function getFeaturedProducts() {
  return cached('catalog:featured', () => fetchProducts({ flag: 'featured' }))
}

export function getBestsellers() {
  return cached('catalog:bestseller', () => fetchProducts({ flag: 'bestseller' }))
}

export function getNewArrivals() {
  return cached('catalog:new-arrival', () => fetchProducts({ flag: 'new_arrival' }))
}

export async function getProductById(id) {
  if (!id) return null
  try {
    return await cached(`catalog:product:${id}`, async () => {
      let data = await findProductByColumn('id', id)
      if (!data) data = await findProductByColumn('slug', id)
      return data ? mapProduct(data) : null
    })
  } catch (error) {
    if (error.message?.includes('No rows')) return null
    throw error
  }
}

export function invalidateProductCache() {
  invalidateCached('catalog:')
}
