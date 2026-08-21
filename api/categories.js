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

const CUSTOMER_CATEGORY_SLUGS = ['face', 'body', 'fragrance', 'wellness']

export default async function handler(request, response) {
  try {
    if (request.method !== 'GET') {
      return response.status(405).json({ error: { message: 'Method not allowed', status: 405 } })
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .in('slug', CUSTOMER_CATEGORY_SLUGS)
      .order('name')

    if (error) {
      return response.status(500).json({ error: { message: error.message, status: 500 } })
    }

    const categories = data.map((cat) => ({
      id: cat.slug || String(cat.id),
      categoryId: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image_url || '',
    }))

    return response.status(200).json({ data: categories })
  } catch (error) {
    console.error('[api/categories]', error)
    return response.status(500).json({ error: { message: 'Internal server error', status: 500 } })
  }
}
