import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthForm, AuthFormItem, AuthInput, AuthMessage, AuthShell, PasswordInput } from '../components/auth/AuthForm'
import { useAuth } from '../context/useAuth'
import { getAuthErrorMessage } from '../utils/auth'

export default function Signup() {
  const { signUp, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!authLoading && user) navigate('/account', { replace: true })
  }, [authLoading, navigate, user])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const data = await signUp({ fullName: fullName.trim(), email: email.trim(), password })
      if (data.user?.identities?.length === 0) {
        setError('An account already exists for this email. Try signing in instead.')
      } else if (!data.session) {
        setSuccess('Check your inbox to confirm your email address, then return to sign in.')
      } else {
        navigate('/account', { replace: true })
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Begin with BLY." description="Create your account for a more considered way to shop and care for yourself.">
      <AuthForm onSubmit={handleSubmit}>
        <AuthFormItem><AuthMessage>{error}</AuthMessage></AuthFormItem>
        <AuthFormItem><AuthMessage type="success">{success}</AuthMessage></AuthFormItem>
        <AuthFormItem>
          <AuthInput label="Full name" id="signup-name" type="text" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        </AuthFormItem>
        <AuthFormItem>
          <AuthInput label="Email address" id="signup-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </AuthFormItem>
        <AuthFormItem>
          <PasswordInput label="Password" id="signup-password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="6" required />
        </AuthFormItem>
        <AuthFormItem>
          <PasswordInput label="Confirm password" id="signup-confirm-password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength="6" required />
        </AuthFormItem>
        <AuthFormItem>
          <button type="submit" className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting}>
            {submitting ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
          </button>
        </AuthFormItem>
        <AuthFormItem>
          <p className="text-center text-sm text-brown">
            Already have an account? <Link to="/login" className="underline underline-offset-4 transition-colors hover:text-taupe">Sign in</Link>
          </p>
        </AuthFormItem>
      </AuthForm>
    </AuthShell>
  )
}
