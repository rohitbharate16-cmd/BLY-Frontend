import { useEffect, useMemo, useRef, useState } from 'react'
import { CartContext } from './cart-context'
import { useAuth } from './useAuth'

const STORAGE_PREFIX = 'bly-cart'
const GUEST_KEY = `${STORAGE_PREFIX}:guest`

function storageKeyFor(userId) {
  return userId ? `${STORAGE_PREFIX}:${userId}` : GUEST_KEY
}

function readCart(key) {
  try {
    const value = window.localStorage.getItem(key)
    const parsed = value ? JSON.parse(value) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function toCartItem(product, quantity) {
  return {
    id: product.id,
    name: product.name,
    category: product.categoryName || product.category,
    image: product.image,
    price: product.price,
    quantity,
  }
}

export function CartProvider({ children }) {
  // BUG FIX: previously the cart lived under a single global localStorage key
  // ('bly-cart') that had no relationship to who was signed in. Logging out
  // never cleared it, so the next person to use the browser would see the
  // previous shopper's bag. The cart is now scoped per-user (keyed by user id,
  // falling back to a separate "guest" bucket) and resets whenever the
  // signed-in user changes or signs out.
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  const [items, setItems] = useState([])
  const previousUserId = useRef(null)
  const hasHydrated = useRef(false)

  // Once the auth session finishes resolving on first load, hydrate from the
  // correct (guest or user-scoped) storage bucket exactly once.
  useEffect(() => {
    if (authLoading || hasHydrated.current) return
    hasHydrated.current = true
    previousUserId.current = userId
    setItems(readCart(storageKeyFor(userId)))
  }, [authLoading, userId])

  // When the signed-in user actually changes (login, logout, or switching
  // accounts on a shared browser), swap to that user's cart instead of
  // carrying the previous one over.
  //
  // BUG FIX: a plain "read whichever bucket matches the new user" swap still
  // leaked state on logout. The guest bucket is written to whenever someone
  // shops before signing in, so the very first thing a person did before
  // logging in (or before ever creating an account) would resurface as their
  // cart the moment they signed out — the bag was never actually empty, it
  // just quietly fell back to old guest data. An explicit sign-out has to
  // leave the cart genuinely empty, not "empty except for whatever was in
  // the guest bucket." So a real logout (was signed in, now signed out)
  // clears both the in-memory items and the stored guest bucket itself,
  // rather than reading it back in.
  useEffect(() => {
    if (authLoading || !hasHydrated.current) return
    if (previousUserId.current === userId) return

    const wasSignedIn = previousUserId.current !== null
    const isNowSignedOut = userId === null

    if (wasSignedIn && isNowSignedOut) {
      previousUserId.current = userId
      window.localStorage.removeItem(GUEST_KEY)
      setItems([])
      return
    }

    previousUserId.current = userId
    setItems(readCart(storageKeyFor(userId)))
  }, [authLoading, userId])

  useEffect(() => {
    if (authLoading || !hasHydrated.current) return
    window.localStorage.setItem(storageKeyFor(userId), JSON.stringify(items))
  }, [items, userId, authLoading])

  const value = useMemo(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0)
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)

    return {
      items,
      itemCount,
      subtotal,
      addItem(product, quantity = 1) {
        if (!userId) return false
        const amount = Math.max(1, Number(quantity) || 1)
        setItems((currentItems) => {
          const existing = currentItems.find((item) => item.id === product.id)
          if (!existing) return [...currentItems, toCartItem(product, amount)]

          return currentItems.map((item) => (
            item.id === product.id ? { ...item, quantity: item.quantity + amount } : item
          ))
        })
        return true
      },
      updateQuantity(id, quantity) {
        const amount = Number(quantity) || 0
        setItems((currentItems) => (
          amount <= 0
            ? currentItems.filter((item) => item.id !== id)
            : currentItems.map((item) => item.id === id ? { ...item, quantity: amount } : item)
        ))
      },
      removeItem(id) {
        setItems((currentItems) => currentItems.filter((item) => item.id !== id))
      },
      clearCart() {
        setItems([])
      },
    }
  }, [items, userId])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
