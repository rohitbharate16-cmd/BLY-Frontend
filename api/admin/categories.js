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

const CATEGORY_COLUMNS = ['name', 'slug', 'description', 'image_url']

function mapCategory(category) {
  return { id: category.id, name: category.name, slug: category.slug, description: category.description || '', image: category.image_url || '' }
}

function text(value, field, { required = false, max = 1000 } = {}) {
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

function selectFields(object, columns) {
  return Object.fromEntries(columns.filter((column) => Object.hasOwn(object, column)).map((column) => [column, object[column]]))
}

function validateCategory(payload, { partial = false } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw { message: 'A category payload is required', status: 400 }
  const has = (key) => Object.hasOwn(payload, key)
  const value = {}
  if (!partial || has('name')) value.name = text(payload.name, 'Name', { required: true, max: 100 })
  if (!partial || has('slug')) value.slug = slug(payload.slug)
  if (!partial || has('description')) value.description = text(payload.description, 'Description', { max: 1000 })
  if (!partial || has('image')) value.image_url = text(payload.image, 'Image URL', { max: 2000 })
  return value
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
    const pathParts = url.pathname.replace(/^\/api\/admin\/categories\/?/, '').split('/').filter(Boolean)

    if (request.method === 'GET' && pathParts.length === 0) {
      const { data, error } = await supabase.from('categories').select('*').order('name')
      if (error) return response.status(500).json({ error: { message: error.message, status: 500 } })
      return response.status(200).json({ data: data.map(mapCategory) })
    }

    if (request.method === 'POST' && pathParts.length === 0) {
      const payload = await new Promise((resolve, reject) => {
        let body = ''
        request.on('data', (chunk) => { body += chunk })
        request.on('end', () => {
          try { resolve(JSON.parse(body)) } catch { reject({ message: 'Invalid JSON body', status: 400 }) }
        })
      })

      const category = validateCategory(payload)
      const { data, error } = await supabase.from('categories').insert(selectFields(category, CATEGORY_COLUMNS)).select('*').single()
      if (error) return response.status(400).json({ error: { message: error.message, status: 400 } })
      return response.status(201).json({ data: mapCategory(data) })
    }

    if (request.method === 'PUT' && pathParts.length === 1) {
      const payload = await new Promise((resolve, reject) => {
        let body = ''
        request.on('data', (chunk) => { body += chunk })
        request.on('end', () => {
          try { resolve(JSON.parse(body)) } catch { reject({ message: 'Invalid JSON body', status: 400 }) }
        })
      })

      const category = validateCategory(payload, { partial: true })
      if (!Object.keys(category).length) {
        return response.status(400).json({ error: { message: 'Provide at least one category field to update', status: 400 } })
      }

      const { data, error } = await supabase.from('categories').update(selectFields(category, CATEGORY_COLUMNS)).eq('id', pathParts[0]).select('*').maybeSingle()
      if (error) return response.status(400).json({ error: { message: error.message, status: 400 } })
      if (!data) return response.status(404).json({ error: { message: 'Category not found', status: 404 } })
      return response.status(200).json({ data: mapCategory(data) })
    }

    if (request.method === 'DELETE' && pathParts.length === 1) {
      const { count, error: countError } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', pathParts[0])
      if (countError) return response.status(500).json({ error: { message: countError.message, status: 500 } })
      if (count) return response.status(409).json({ error: { message: 'This category contains products. Move or delete those products before deleting the category.', status: 409 } })

      const { data, error } = await supabase.from('categories').delete().eq('id', pathParts[0]).select('*').maybeSingle()
      if (error) return response.status(500).json({ error: { message: error.message, status: 500 } })
      if (!data) return response.status(404).json({ error: { message: 'Category not found', status: 404 } })
      return response.status(200).json({ data: { deleted: true, category: mapCategory(data) } })
    }

    return response.status(405).json({ error: { message: 'Method not allowed', status: 405 } })
  } catch (error) {
    console.error('[api/admin/categories]', error)
    const status = error.status || 500
    return response.status(status).json({ error: { message: error.message || 'Internal server error', status } })
  }
}
