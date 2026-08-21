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

export default async function handler(request, response) {
  try {
    if (request.method !== 'GET') {
      return response.status(405).json({ error: { message: 'Method not allowed', status: 405 } })
    }

    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', HOME_CONTENT_KEY)
      .maybeSingle()

    if (error && !error.message?.includes('could not find the table')) {
      return response.status(500).json({ error: { message: error.message, status: 500 } })
    }

    return response.status(200).json({ data: { ...HOME_CONTENT_DEFAULT, ...(data?.value || {}) } })
  } catch (error) {
    console.error('[api/content/home]', error)
    return response.status(500).json({ error: { message: 'Internal server error', status: 500 } })
  }
}
