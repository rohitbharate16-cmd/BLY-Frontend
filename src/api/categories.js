import { supabase } from '../lib/supabase'
import { cached, invalidateCached } from './cache'

const CUSTOMER_CATEGORY_SLUGS = ['face', 'body', 'fragrance', 'wellness']

export function getCategories() {
  return cached('categories:all', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .in('slug', CUSTOMER_CATEGORY_SLUGS)
      .order('name')

    if (error) throw new Error(error.message)

    return data.map((cat) => ({
      id: cat.slug || String(cat.id),
      categoryId: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image_url || '',
    }))
  })
}

export function invalidateCategoryCache() {
  invalidateCached('categories:')
}
