import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

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

async function getProducts({ category, flag } = {}) {
  let query = supabase
    .from('products')
    .select('*, categories!inner(*)')
    .eq('is_active', true)
    .in('categories.slug', CUSTOMER_CATEGORY_SLUGS)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('categories.slug', category)
  if (flag) query = query.eq(flag, true)

  const { data, error } = await query
  if (error) return { error: { message: error.message, status: 500 } }

  return { data: data.map(mapProduct) }
}

async function getProductByIdentifier(identifier) {
  if (!identifier) return { data: null }

  let query = supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_active', true)
    .eq('id', identifier)
    .maybeSingle()

  let { data, error } = await query
  if (error && error.code !== '22P02') {
    return { error: { message: error.message, status: 500 } }
  }

  if (!data) {
    query = supabase
      .from('products')
      .select('*, categories(*)')
      .eq('is_active', true)
      .eq('slug', identifier)
      .maybeSingle()

    const fallback = await query
    if (fallback.error && fallback.error.code !== '22P02') {
      return { error: { message: fallback.error.message, status: 500 } }
    }
    data = fallback.data
  }

  return { data: data ? mapProduct(data) : null }
}

export default async function handler(request, response) {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`)
    const pathParts = url.pathname.replace(/^\/api\/products\/?/, '').split('/').filter(Boolean)

    if (request.method === 'GET' && pathParts.length === 0) {
      const category = url.searchParams.get('category')
      const flag = url.searchParams.get('flag')

      if (category && !CUSTOMER_CATEGORY_SLUGS.includes(category)) {
        return response.status(200).json({ data: [] })
      }

      if (flag && !['featured', 'bestseller', 'new_arrival'].includes(flag)) {
        return response.status(400).json({ error: { message: `Invalid flag "${flag}"`, status: 400 } })
      }

      if (category) {
        const result = await getProducts({ category })
        if (result.error) return response.status(result.error.status).json({ error: result.error })
        return response.status(200).json(result)
      }

      if (flag) {
        const result = await getProducts({ flag })
        if (result.error) return response.status(result.error.status).json({ error: result.error })
        return response.status(200).json(result)
      }

      const result = await getProducts()
      if (result.error) return response.status(result.error.status).json({ error: result.error })
      return response.status(200).json(result)
    }

    if (request.method === 'GET' && pathParts.length === 1) {
      const identifier = decodeURIComponent(pathParts[0])
      const result = await getProductByIdentifier(identifier)
      if (result.error) return response.status(result.error.status).json({ error: result.error })
      if (!result.data) return response.status(404).json({ error: { message: 'Product not found', status: 404 } })
      return response.status(200).json(result)
    }

    return response.status(405).json({ error: { message: 'Method not allowed', status: 405 } })
  } catch (error) {
    console.error('[api/products]', error)
    return response.status(500).json({ error: { message: 'Internal server error', status: 500 } })
  }
}
