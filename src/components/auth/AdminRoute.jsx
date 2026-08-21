import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getAdminSession } from '../../api/admin'
import { useAuth } from '../../context/useAuth'

// The browser only asks whether the current session is allowed. The backend
// verifies the token and reads profiles.role itself before returning success.
export default function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const [status, setStatus] = useState('checking')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true
    if (authLoading) return () => { active = false }
    if (!user) {
      setStatus('signed-out')
      return () => { active = false }
    }

    setStatus('checking')
    getAdminSession()
      .then(() => { if (active) setStatus('allowed') })
      .catch((error) => {
        if (!active) return
        if (error.status === 401) setStatus('signed-out')
        else if (error.status === 403) setStatus('denied')
        else setStatus('error')
      })

    return () => { active = false }
  }, [authLoading, retryKey, user])

  if (authLoading || status === 'checking') {
    return <section className="min-h-[52vh]" aria-busy="true" aria-label="Checking administrator access" />
  }
  if (status === 'signed-out') return <Navigate to="/login" replace state={{ from: location }} />
  if (status === 'error') {
    return (
      <section className="min-h-[52vh] bg-cream py-16">
        <div className="container mx-auto max-w-xl px-6 text-center lg:px-8">
          <p className="text-xs uppercase tracking-[0.18em] text-taupe">BLY / Admin</p>
          <h1 className="mt-3 font-display text-3xl text-espresso">Admin access is unavailable.</h1>
          <p className="mt-4 text-sm leading-relaxed text-brown">The backend could not verify your administrator role. Check its server-only Supabase service-role key, then try again.</p>
          <button type="button" className="btn-primary mt-7" onClick={() => setRetryKey((value) => value + 1)}>TRY AGAIN</button>
        </div>
      </section>
    )
  }
  if (status !== 'allowed') return <Navigate to="/account" replace state={{ adminDenied: true }} />
  return children
}
