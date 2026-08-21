import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StaggerContainer, StaggerItem } from '../components/motion/Primitives'
import { useAuth } from '../context/useAuth'
import { getAuthErrorMessage } from '../utils/auth'

export default function Account() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'BLY Member'

  async function handleSignOut() {
    setError('')
    setSubmitting(true)
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
      setSubmitting(false)
    }
  }

  return (
    <section className="bg-cream py-16 md:py-24">
      <StaggerContainer className="container mx-auto max-w-3xl px-6 lg:px-8" stagger={0.1}>
        <StaggerItem>
          <p className="text-xs uppercase tracking-[0.22em] text-taupe">BLY / MEMBER</p>
          <h1 className="mt-4 font-display text-4xl leading-none text-espresso sm:text-5xl">My Account</h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-brown">A considered place for the details that make your BLY experience yours.</p>
        </StaggerItem>

        <StaggerItem className="mt-10 border-y border-[#E8DED2]">
          <div className="grid gap-7 py-7 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-taupe">Name</p>
              <p className="mt-2 font-display text-2xl text-espresso">{fullName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-taupe">Email</p>
              <p className="mt-2 text-sm text-espresso">{user.email}</p>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem className="mt-8">
          {error && <p className="mb-4 border border-[#C99B8D] bg-[#FBF2EF] px-4 py-3 text-sm text-brown" role="alert">{error}</p>}
          <button type="button" className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60" onClick={handleSignOut} disabled={submitting}>
            {submitting ? 'SIGNING OUT…' : 'LOG OUT'}
          </button>
        </StaggerItem>
      </StaggerContainer>
    </section>
  )
}
