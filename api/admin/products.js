import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

const PRODUCT_COLUMNS = ['name', 'slug', 'category_id', 'product_type', 'short_description', 'description', 'how_to_use', 'concern', 'tags', 'price', 'rating', 'review_count', 'featured', 'bestseller', 'new_arrival', 'image_url', 'is_active']

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

function text(value, field, { required = false, max = 2000 } = {}) {
  if (value === undefined || value === null) {
    if (required) throw { message: `${field} is required`, status: 400 }
    return null
  }
  if (typeof value !== 'string') throw { message: `${field} must be text`, status: 400 }
  const result = value.trim()
  if (required && !result) throw { message: `${field} is required`, status: 400 }
  if (result.length > max) throw { message: `${field} must be ${max} characters or fewer`, status: 400 }
  return result || null
}

function slug(value) {
  const result = text(value, 'Slug', { required: true, max: 120 })
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) throw { message: 'Slug may contain lowercase letters, numbers, and single hyphens only', status: 400 }
  return result
}

function number(value, field, { min = 0, integer = false, fallback = null } = {}) {
  if (value === undefined || value === null || value === '') return fallback
  const result = Number(value)
  if (!Number.isFinite(result) || result < min || (integer && !Number.isInteger(result))) throw { message: `${field} must be a valid ${integer ? 'whole ' : ''}number`, status: 400 }
  return result
}

function bool(value, field, fallback = false) {
  if (value === undefined || value === null) return fallback
  if (typeof value !== 'boolean') throw { message: `${field} must be true or false`, status: 400 }
  return value
}

function url(value, field) {
  const result = text(value, field, { max: 2000 })
  if (!result) return null
  try {
    const parsed = new URL(result)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
  } catch {
    throw { message: `${field} must be a valid http(s) URL`, status: 400 }
  }
  return result
}

function tags(value) {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== 'string')) throw { message: 'Tags must be an array of text values', status: 400 }
  const result = [...new Set(value.map((tag) => tag.trim()).filter(Boolean))]
  if (result.length > 30 || result.some((tag) => tag.length > 80)) throw { message: 'Use at most 30 tags of 80 characters or fewer', status: 400 }
  return result
}

function selectFields(object, columns) {
  return Object.fromEntries(columns.filter((column) => Object.hasOwn(object, column)).map((column) => [column, object[column]]))
}

function validateProduct(payload, { partial = false } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw { message: 'A product payload is required', status: 400 }
  const has = (key) => Object.hasOwn(payload, key)
  const value = {}
  if (!partial || has('name')) value.name = text(payload.name, 'Name', { required: true, max: 160 })
  if (!partial || has('slug')) value.slug = slug(payload.slug)
  if (!partial || has('categoryId')) value.category_id = text(payload.categoryId, 'Category', { required: true, max: 100 })
  if (!partial || has('productType')) value.product_type = text(payload.productType, 'Product type', { max: 160 })
  if (!partial || has('shortDescription')) value.short_description = text(payload.shortDescription, 'Short description', { max: 500 })
  if (!partial || has('description')) value.description = text(payload.description, 'Description', { max: 10000 })
  if (!partial || has('howToUse')) value.how_to_use = text(payload.howToUse, 'Ingredients and details', { max: 5000 })
  if (!partial || has('concern')) value.concern = text(payload.concern, 'Concern', { max: 500 })
  if (!partial || has('tags')) value.tags = tags(payload.tags)
  if (!partial || has('price')) value.price = number(payload.price, 'Price')
  if (!partial || has('rating')) value.rating = number(payload.rating, 'Rating', { fallback: 0 })
  if (!partial || has('reviewCount')) value.review_count = number(payload.reviewCount, 'Review count', { integer: true, fallback: 0 })
  if (!partial || has('featured')) value.featured = bool(payload.featured, 'Featured')
  if (!partial || has('bestseller')) value.bestseller = bool(payload.bestseller, 'Bestseller')
  if (!partial || has('newArrival')) value.new_arrival = bool(payload.newArrival, 'New arrival')
  if (!partial || has('image')) value.image_url = url(payload.image, 'Image URL')
  if (!partial || has('isActive')) value.is_active = bool(payload.isActive, 'Availability', true)
  return value
}

async function ensureCategory(categoryId) {
  const { data, error } = await supabase.from('categories').select('id').eq('id', categoryId).maybeSingle()
  if (error) throw { message: error.message, status: 500 }
  if (!data) throw { message: 'Select a valid category', status: 400 }
}

export default async function handler(request, response) {
  try {
    const authHeader = request.headers.authorization || ''
    const [, token] = authHeader.split(' ')

    if (!token) {
      return response.status(401).json({ error: { message: 'Missing authorization token', status: 401 } })
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !userData?.user) {
      return response.status(401).json({ error: { message: 'Your session has expired. Please sign in again.', status: 401 } })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle()

    const role = profile?.role || 'user'
    if (role !== 'admin') {
      return response.status(403).json({ error: { message: 'Admin access required', status: 403 } })
    }

    const url = new URL(request.url, `http://${request.headers.host}`)
    const pathParts = url.pathname.replace(/^\/api\/admin\/products\/?/, '').split('/').filter(Boolean)

    if (request.method === 'GET' && pathParts.length === 0) {
      const search = url.searchParams.get('search') || ''
      const category = url.searchParams.get('category') || ''
      const sort = url.searchParams.get('sort') || ''

      let query = supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false })
      if (category) query = query.eq('category_id', category)

      const { data, error } = await query
      if (error) return response.status(500).json({ error: { message: error.message, status: 500 } })

      let results = data.map(mapProduct)
      if (search) {
        const term = String(search).toLowerCase()
        results = results.filter((product) => [product.name, product.slug, product.categoryName].some((field) => field?.toLowerCase().includes(term)))
      }
      if (sort === 'price-asc') results.sort((a, b) => a.price - b.price)
      if (sort === 'price-desc') results.sort((a, b) => b.price - a.price)
      if (sort === 'name') results.sort((a, b) => a.name.localeCompare(b.name))

      return response.status(200).json({ data: results })
    }

    if (request.method === 'GET' && pathParts.length === 1) {
      const { data, error } = await supabase.from('products').select('*, categories(*)').eq('id', pathParts[0]).maybeSingle()
      if (error) return response.status(500).json({ error: { message: error.message, status: 500 } })
      if (!data) return response.status(404).json({ error: { message: 'Product not found', status: 404 } })
      return response.status(200).json({ data: mapProduct(data) })
    }

    if (request.method === 'POST' && pathParts.length === 0) {
      const payload = await new Promise((resolve, reject) => {
        let body = ''
        request.on('data', (chunk) => { body += chunk })
        request.on('end', () => {
          try { resolve(JSON.parse(body)) } catch { reject({ message: 'Invalid JSON body', status: 400 }) }
        })
      })

      const product = validateProduct(payload)
      await ensureCategory(product.category_id)

      const { data, error } = await supabase.from('products').insert(selectFields(product, PRODUCT_COLUMNS)).select('*, categories(*)').single()
      if (error) return response.status(400).json({ error: { message: error.message, status: 400 } })
      return response.status(201).json({ data: mapProduct(data) })
    }

    if (request.method === 'PUT' && pathParts.length === 1) {
      const payload = await new Promise((resolve, reject) => {
        let body = ''
        request.on('data', (chunk) => { body += chunk })
        request.on('end', () => {
          try { resolve(JSON.parse(body)) } catch { reject({ message: 'Invalid JSON body', status: 400 }) }
        })
      })

      const product = validateProduct(payload, { partial: true })
      if (!Object.keys(product).length) {
        return response.status(400).json({ error: { message: 'Provide at least one product field to update', status: 400 } })
      }
      if (product.category_id) await ensureCategory(product.category_id)

      const { data, error } = await supabase.from('products').update(selectFields(product, PRODUCT_COLUMNS)).eq('id', pathParts[0]).select('*, categories(*)').maybeSingle()
      if (error) return response.status(400).json({ error: { message: error.message, status: 400 } })
      if (!data) return response.status(404).json({ error: { message: 'Product not found', status: 404 } })
      return response.status(200).json({ data: mapProduct(data) })
    }

    if (request.method === 'DELETE' && pathParts.length === 1) {
      const { data, error } = await supabase.from('products').update({ is_active: false }).eq('id', pathParts[0]).select('*, categories(*)').maybeSingle()
      if (error) return response.status(500).json({ error: { message: error.message, status: 500 } })
      if (!data) return response.status(404).json({ error: { message: 'Product not found', status: 404 } })
      return response.status(200).json({ data: { archived: true, product: mapProduct(data) } })
    }

    return response.status(405).json({ error: { message: 'Method not allowed', status: 405 } })
  } catch (error) {
    console.error('[api/admin/products]', error)
    const status = error.status || 500
    return response.status(status).json({ error: { message: error.message || 'Internal server error', status } })
  }
}
