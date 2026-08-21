import { apiClient } from './client'
import { cached, invalidateCached } from './cache'

// { id, name, slug }
export function getCategories() {
  return cached('categories:all', () => apiClient.get('/categories'))
}

export function invalidateCategoryCache() {
  invalidateCached('categories:')
}
