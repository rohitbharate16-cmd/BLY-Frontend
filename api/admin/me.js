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

export default async function handler(request, response) {
  try {
    const authHeader = request.headers.authorization || ''
    const [, token] = authHeader.split(' ')

    if (!token) {
      return response.status(401).json({ error: { message: 'Missing authorization token', status: 401 } })
    }

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data?.user) {
      return response.status(401).json({ error: { message: 'Your session has expired. Please sign in again.', status: 401 } })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    const role = profile?.role || 'user'

    if (role !== 'admin') {
      return response.status(403).json({ error: { message: 'Admin access required', status: 403 } })
    }

    return response.status(200).json({ data: { id: data.user.id, role } })
  } catch (error) {
    console.error('[api/admin/me]', error)
    return response.status(500).json({ error: { message: 'Administrator access could not be verified.', status: 500 } })
  }
}
