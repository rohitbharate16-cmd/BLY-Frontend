const ADMIN_BASE = '/api/admin'

async function adminFetch(path, options = {}) {
  const response = await fetch(`${ADMIN_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 204) return null

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || `Request failed with status ${response.status}`
    const error = new Error(message)
    error.status = payload?.error?.status || response.status
    throw error
  }

  return payload?.data ?? payload
}

const secured = { headers: {} }

export function getAdminSession() {
  return adminFetch('/me', { method: 'GET', ...secured })
}

export function getAdminProducts({ search, category, sort } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (sort) params.set('sort', sort)
  const query = params.toString()
  return adminFetch(`/products${query ? `?${query}` : ''}`, { method: 'GET', ...secured })
}

export function getAdminProduct(id) {
  return adminFetch(`/products/${encodeURIComponent(id)}`, { method: 'GET', ...secured })
}

export function createAdminProduct(payload) {
  return adminFetch('/products', { method: 'POST', ...secured, body: JSON.stringify(payload) })
}

export function updateAdminProduct(id, payload) {
  return adminFetch(`/products/${encodeURIComponent(id)}`, { method: 'PUT', ...secured, body: JSON.stringify(payload) })
}

export function archiveAdminProduct(id) {
  return adminFetch(`/products/${encodeURIComponent(id)}`, { method: 'DELETE', ...secured })
}

export function uploadAdminProductImage(file) {
  return adminFetch('/uploads', {
    method: 'POST',
    ...secured,
    headers: {
      'Content-Type': file.type,
      'X-File-Name': encodeURIComponent(file.name),
    },
    body: file,
  })
}

export function getAdminCategories() {
  return adminFetch('/categories', { method: 'GET', ...secured })
}

export function createAdminCategory(payload) {
  return adminFetch('/categories', { method: 'POST', ...secured, body: JSON.stringify(payload) })
}

export function updateAdminCategory(id, payload) {
  return adminFetch(`/categories/${encodeURIComponent(id)}`, { method: 'PUT', ...secured, body: JSON.stringify(payload) })
}

export function deleteAdminCategory(id) {
  return adminFetch(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE', ...secured })
}

export function getAdminHomeContent() {
  return adminFetch('/content', { method: 'GET', ...secured })
}

export function updateAdminHomeContent(payload) {
  return adminFetch('/content', { method: 'PUT', ...secured, body: JSON.stringify(payload) })
}
