import { supabase } from '../lib/supabase'

// Base URL of the backend API. Configure via VITE_API_URL in frontend/.env.
// Failing explicitly in production prevents the app from silently requesting
// JSON from the frontend origin, which would return HTML and blank the page.
const API_BASE_URL = import.meta.env.VITE_API_URL

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_URL is not configured. ' +
    'Set it in your deployment environment to point to your backend API.',
  )
}

// A hung request (dropped connection, sleeping backend host) previously left
// callers awaiting a promise that never resolved, which shows up to a
// shopper as a page stuck on its loading state forever. Aborting after a
// bound gives every caller's existing catch/error UI a chance to run.
const REQUEST_TIMEOUT_MS = 15_000

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function getAuthHeader() {
  // Attach the Supabase access token when a session exists so the backend
  // can verify who is calling. Public endpoints ignore this header.
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('The request took too long. Please check your connection and try again.', { status: 0 })
    }
    throw new ApiError('Network error. Please check your connection and try again.', { status: 0 })
  } finally {
    clearTimeout(timer)
  }
}

async function request(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const authHeader = auth ? await getAuthHeader() : {}

  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || `Request failed with status ${response.status}`
    throw new ApiError(message, { status: response.status, details: payload?.error })
  }

  // Backend responses are shaped as { data: ... }. Unwrap when present so
  // callers keep working with plain values, same as before the separation.
  return payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload
}

async function requestRaw(path, { method = 'POST', body, auth = false, headers = {} } = {}) {
  const authHeader = auth ? await getAuthHeader() : {}
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, { method, headers: { ...authHeader, ...headers }, body })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || `Request failed with status ${response.status}`
    throw new ApiError(message, { status: response.status, details: payload?.error })
  }
  return payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload
}

export const apiClient = {
  get(path, options) {
    return request(path, { ...options, method: 'GET' })
  },
  post(path, body, options) {
    return request(path, { ...options, method: 'POST', body })
  },
  put(path, body, options) {
    return request(path, { ...options, method: 'PUT', body })
  },
  patch(path, body, options) {
    return request(path, { ...options, method: 'PATCH', body })
  },
  delete(path, options) {
    return request(path, { ...options, method: 'DELETE' })
  },
  upload(path, body, options) {
    return requestRaw(path, { ...options, method: 'POST', body })
  },
}
