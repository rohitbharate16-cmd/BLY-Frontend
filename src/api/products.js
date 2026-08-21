import { apiClient } from './client'
import { cached, invalidateCached } from './cache'

// Centralized product data access. This replaces the previous direct
// Supabase calls in src/services/products.js — the frontend now talks to
// the backend API, which is the only layer allowed to query Supabase for
// product data. The returned shape is unchanged so existing pages/
// components keep working without modification:
//
// { id, name, slug, category, categoryName, price, shortDescription,
//   description, howToUse, concern, tags, rating, reviewCount, featured,
//   bestseller, newArrival, image, isActive }

const CUSTOMER_CATEGORY_SLUGS = ['face', 'body', 'fragrance', 'wellness']

export function getProducts() {
  return cached('catalog:all', () => apiClient.get('/products'))
}

export async function getProductsByCategory(categorySlug) {
  if (!CUSTOMER_CATEGORY_SLUGS.includes(categorySlug)) return []

  return cached(`catalog:category:${categorySlug}`, () => apiClient.get(`/products?category=${encodeURIComponent(categorySlug)}`))
}

export function getFeaturedProducts() {
  return cached('catalog:featured', () => apiClient.get('/products?flag=featured'))
}

export function getBestsellers() {
  return cached('catalog:bestseller', () => apiClient.get('/products?flag=bestseller'))
}

export function getNewArrivals() {
  return cached('catalog:new-arrival', () => apiClient.get('/products?flag=new_arrival'))
}

export async function getProductById(id) {
  if (!id) return null

  try {
    return await cached(`catalog:product:${id}`, () => apiClient.get(`/products/${encodeURIComponent(id)}`))
  } catch (error) {
    // Preserve prior behavior: a missing/inactive product resolves to null
    // instead of throwing, so pages can render a "Product Not Found" state.
    if (error.status === 404) return null
    throw error
  }
}

export function invalidateProductCache() {
  invalidateCached('catalog:')
}
