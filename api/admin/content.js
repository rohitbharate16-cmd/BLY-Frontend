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

const HOME_CONTENT_KEY = 'homepage'
const HOME_CONTENT_DEFAULT = {
  eyebrow: 'A considered ritual',
  title: 'Beauty Lies in You.',
  subtitle: 'Thoughtfully created beauty for every version of you.',
  imageUrl: '',
  featuredProductId: '',
}

function text(value, field, { required = false, max = 500 } = {}) {
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

    if (request.method === 'GET') {
      const { data, error } = await supabase.from('site_content').select('value').eq('key', HOME_CONTENT_KEY).maybeSingle()
      if (error && !error.message?.includes('could not find the table')) {
        return response.status(500).json({ error: { message: error.message, status: 500 } })
      }
      return response.status(200).json({ data: { ...HOME_CONTENT_DEFAULT, ...(data?.value || {}) } })
    }

    if (request.method === 'PUT') {
      const payload = await new Promise((resolve, reject) => {
        let body = ''
        request.on('data', (chunk) => { body += chunk })
        request.on('end', () => {
          try { resolve(JSON.parse(body)) } catch { reject({ message: 'Invalid JSON body', status: 400 }) }
        })
      })

      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return response.status(400).json({ error: { message: 'A homepage content payload is required', status: 400 } })
      }

      const content = {
        eyebrow: text(payload.eyebrow, 'Hero eyebrow', { max: 120 }) || HOME_CONTENT_DEFAULT.eyebrow,
        title: text(payload.title, 'Hero title', { required: true, max: 160 }),
        subtitle: text(payload.subtitle, 'Hero subtitle', { required: true, max: 500 }),
        imageUrl: url(payload.imageUrl, 'Hero image URL') || '',
        featuredProductId: text(payload.featuredProductId, 'Featured product', { max: 100 }) || '',
      }

      if (content.featuredProductId) {
        const { data: product } = await supabase.from('products').select('id').eq('id', content.featuredProductId).maybeSingle()
        if (!product) {
          return response.status(400).json({ error: { message: 'Select a valid featured product', status: 400 } })
        }
      }

      const { data, error } = await supabase.from('site_content').upsert({ key: HOME_CONTENT_KEY, value: content }, { onConflict: 'key' }).select('value').single()
      if (error) return response.status(500).json({ error: { message: error.message, status: 500 } })
      return response.status(200).json({ data: { ...HOME_CONTENT_DEFAULT, ...(data?.value || {}) } })
    }

    return response.status(405).json({ error: { message: 'Method not allowed', status: 405 } })
  } catch (error) {
    console.error('[api/admin/content]', error)
    const status = error.status || 500
    return response.status(status).json({ error: { message: error.message || 'Internal server error', status } })
  }
}
