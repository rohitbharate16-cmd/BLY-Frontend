export function getAuthErrorMessage(error) {
  const message = error?.message?.toLowerCase() || ''

  if (message.includes('invalid login credentials')) return 'The email or password you entered is incorrect.'
  if (message.includes('email not confirmed')) return 'Please confirm your email before signing in.'
  if (message.includes('already registered') || message.includes('already been registered')) return 'An account already exists for this email. Try signing in instead.'
  if (message.includes('password should be at least')) return 'Your password must meet the minimum length required by BLY.'
  if (message.includes('rate limit')) return 'Too many attempts. Please wait a moment before trying again.'
  if (message.includes('expired') || message.includes('invalid token')) return 'This link has expired. Please request a new one.'

  return 'Something went wrong. Please try again.'
}
