import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthForm, AuthFormItem, AuthInput, AuthMessage, AuthShell } from '../components/auth/AuthForm'
import { useAuth } from '../context/useAuth'
import { getAuthErrorMessage } from '../utils/auth'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      await resetPassword(email.trim())
      setSuccess('If an account exists for this email, we’ve sent a secure password-reset link.')
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Reset your password." description="Enter your email and we’ll send a secure link to continue.">
      <AuthForm onSubmit={handleSubmit}>
        <AuthFormItem><AuthMessage>{error}</AuthMessage></AuthFormItem>
        <AuthFormItem><AuthMessage type="success">{success}</AuthMessage></AuthFormItem>
        <AuthFormItem>
          <AuthInput label="Email address" id="forgot-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </AuthFormItem>
        <AuthFormItem>
          <button type="submit" className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting}>
            {submitting ? 'SENDING LINK…' : 'SEND RESET LINK'}
          </button>
        </AuthFormItem>
        <AuthFormItem>
          <p className="text-center text-sm text-brown">
            Remembered your password? <Link to="/login" className="underline underline-offset-4 transition-colors hover:text-taupe">Sign in</Link>
          </p>
        </AuthFormItem>
      </AuthForm>
    </AuthShell>
  )
}
