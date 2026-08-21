import { supabase } from '../lib/supabase'

const HOME_CONTENT_KEY = 'homepage'
const HOME_CONTENT_DEFAULT = {
  eyebrow: 'A considered ritual',
  title: 'Beauty Lies in You.',
  subtitle: 'Thoughtfully created beauty for every version of you.',
  imageUrl: '',
  featuredProductId: '',
}

export async function getHomeContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', HOME_CONTENT_KEY)
    .maybeSingle()

  if (error && !error.message?.includes('could not find the table')) {
    throw new Error(error.message)
  }

  return { ...HOME_CONTENT_DEFAULT, ...(data?.value || {}) }
}
