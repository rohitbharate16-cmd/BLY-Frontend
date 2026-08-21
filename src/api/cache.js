const entries = new Map()

// Keeps repeat navigation snappy without turning the storefront into a stale
// static site. Concurrent callers share one request and expired values are
// naturally fetched again.
export function cached(key, load, ttl = 90_000) {
  const current = entries.get(key)
  if (current && current.expiresAt > Date.now()) return current.value

  const value = Promise.resolve()
    .then(load)
    .catch((error) => {
      if (entries.get(key)?.value === value) entries.delete(key)
      throw error
    })

  entries.set(key, { value, expiresAt: Date.now() + ttl })
  return value
}

export function invalidateCached(prefix) {
  for (const key of entries.keys()) {
    if (key.startsWith(prefix)) entries.delete(key)
  }
}
