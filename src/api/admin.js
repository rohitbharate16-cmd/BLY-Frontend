import { apiClient } from './client'

const secured = { auth: true }

export const getAdminSession = () => apiClient.get('/admin/me', secured)
export const getAdminProducts = ({ search, category, sort } = {}) => {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (sort) params.set('sort', sort)
  const query = params.toString()
  return apiClient.get(`/admin/products${query ? `?${query}` : ''}`, secured)
}
export const getAdminProduct = (id) => apiClient.get(`/admin/products/${encodeURIComponent(id)}`, secured)
export const createAdminProduct = (payload) => apiClient.post('/admin/products', payload, secured)
export const updateAdminProduct = (id, payload) => apiClient.put(`/admin/products/${encodeURIComponent(id)}`, payload, secured)
export const archiveAdminProduct = (id) => apiClient.delete(`/admin/products/${encodeURIComponent(id)}`, secured)
export const uploadAdminProductImage = (file) => apiClient.upload('/admin/uploads/product-image', file, {
  ...secured,
  headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) },
})

export const getAdminCategories = () => apiClient.get('/admin/categories', secured)
export const createAdminCategory = (payload) => apiClient.post('/admin/categories', payload, secured)
export const updateAdminCategory = (id, payload) => apiClient.put(`/admin/categories/${encodeURIComponent(id)}`, payload, secured)
export const deleteAdminCategory = (id) => apiClient.delete(`/admin/categories/${encodeURIComponent(id)}`, secured)

export const getAdminHomeContent = () => apiClient.get('/admin/content/home', secured)
export const updateAdminHomeContent = (payload) => apiClient.put('/admin/content/home', payload, secured)
