import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

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

const PRODUCT_IMAGES_BUCKET = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images'
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const MAX_IMAGE_BYTES = 8 * 1024 * 1024

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

    if (request.method !== 'POST') {
      return response.status(405).json({ error: { message: 'Method not allowed', status: 405 } })
    }

    const contentType = request.headers['content-type']?.split(';')[0]?.trim().toLowerCase() || ''
    const filename = request.headers['x-file-name'] || ''

    if (!ACCEPTED_IMAGE_TYPES.has(contentType)) {
      return response.status(400).json({ error: { message: 'Use a JPG, PNG, WebP, or AVIF image', status: 400 } })
    }

    const chunks = []
    for await (const chunk of request) {
      chunks.push(chunk)
    }
    const bytes = Buffer.concat(chunks)

    if (bytes.length === 0) {
      return response.status(400).json({ error: { message: 'Choose an image file to upload', status: 400 } })
    }
    if (bytes.length > MAX_IMAGE_BYTES) {
      return response.status(400).json({ error: { message: 'Images must be 8 MB or smaller', status: 400 } })
    }

    const sourceExtension = String(filename || '').toLowerCase().match(/\.(jpe?g|png|webp|avif)$/)?.[1]
    const extension = sourceExtension === 'jpeg' ? 'jpg' : (sourceExtension || contentType.split('/')[1])
    const objectPath = `products/${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(objectPath, bytes, {
      contentType,
      cacheControl: '31536000',
      upsert: false,
    })

    if (uploadError) {
      return response.status(500).json({ error: { message: `Image upload failed: ${uploadError.message}`, status: 500 } })
    }

    const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(objectPath)
    if (!data?.publicUrl) {
      return response.status(500).json({ error: { message: 'Image uploaded but a public URL could not be created', status: 500 } })
    }

    return response.status(201).json({ data: { url: data.publicUrl, path: objectPath } })
  } catch (error) {
    console.error('[api/admin/uploads]', error)
    return response.status(500).json({ error: { message: 'Internal server error', status: 500 } })
  }
}
