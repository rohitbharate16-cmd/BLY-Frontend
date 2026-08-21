import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthForm, AuthFormItem, AuthMessage, AuthShell, PasswordInput } from '../components/auth/AuthForm'
import { useAuth } from '../context/useAuth'
import { getAuthErrorMessage } from '../utils/auth'

export default function ResetPassword() {
  const { session, loading: authLoading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!success) return undefined
    const timer = window.setTimeout(() => navigate('/account', { replace: true }), 900)
    return () => window.clearTimeout(timer)
  }, [navigate, success])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await updatePassword(password)
      setSuccess('Your password has been updated. Taking you to your account…')
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <AuthShell title="Preparing your reset." description="Verifying your secure password-reset link.">
        <p className="text-sm text-taupe" aria-live="polite">Please wait a moment.</p>
      </AuthShell>
    )
  }

  if (!session) {
    return (
      <AuthShell title="This link is unavailable." description="Password-reset links are secure and may expire after use.">
        <div className="space-y-5">
          <AuthMessage>Request a new reset link to continue.</AuthMessage>
          <Link to="/forgot-password" className="btn-primary">REQUEST A NEW LINK</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Choose a new password." description="Create a new password for your BLY account.">
      <AuthForm onSubmit={handleSubmit}>
        <AuthFormItem><AuthMessage>{error}</AuthMessage></AuthFormItem>
        <AuthFormItem><AuthMessage type="success">{success}</AuthMessage></AuthFormItem>
        <AuthFormItem>
          <PasswordInput label="New password" id="reset-password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="6" required />
        </AuthFormItem>
        <AuthFormItem>
          <PasswordInput label="Confirm new password" id="reset-confirm-password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength="6" required />
        </AuthFormItem>
        <AuthFormItem>
          <button type="submit" className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting || Boolean(success)}>
            {submitting ? 'UPDATING PASSWORD…' : 'UPDATE PASSWORD'}
          </button>
        </AuthFormItem>
      </AuthForm>
    </AuthShell>
  )
}
