import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthForm, AuthFormItem, AuthInput, AuthMessage, AuthShell, PasswordInput } from '../components/auth/AuthForm'
import { useAuth } from '../context/useAuth'
import { getAuthErrorMessage } from '../utils/auth'

function getDestination(location) {
  const from = location.state?.from
  if (!from?.pathname || from.pathname === '/login') return '/account'
  return `${from.pathname}${from.search || ''}${from.hash || ''}`
}

export default function Login() {
  const { signIn, user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const destination = getDestination(location)

  useEffect(() => {
    if (!authLoading && user) navigate(destination, { replace: true })
  }, [authLoading, destination, navigate, user])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await signIn({ email: email.trim(), password })
      navigate(destination, { replace: true })
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Welcome back." description="Sign in to continue your considered beauty ritual.">
      <AuthForm onSubmit={handleSubmit}>
        <AuthFormItem><AuthMessage>{error}</AuthMessage></AuthFormItem>
        <AuthFormItem>
          <AuthInput label="Email address" id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </AuthFormItem>
        <AuthFormItem>
          <PasswordInput label="Password" id="login-password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </AuthFormItem>
        <AuthFormItem>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs uppercase tracking-[0.12em] text-brown underline-offset-4 transition-colors hover:text-taupe hover:underline">
              Forgot password?
            </Link>
          </div>
        </AuthFormItem>
        <AuthFormItem>
          <button type="submit" className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting}>
            {submitting ? 'SIGNING IN…' : 'SIGN IN'}
          </button>
        </AuthFormItem>
        <AuthFormItem>
          <p className="text-center text-sm text-brown">
            New to BLY? <Link to="/signup" className="underline underline-offset-4 transition-colors hover:text-taupe">Create an account</Link>
          </p>
        </AuthFormItem>
      </AuthForm>
    </AuthShell>
  )
}
