import { Component } from 'react'

// A failed lazy-loaded route chunk (flaky network, stale deploy after a
// redeploy) or an unexpected render error previously produced a fully
// blank page with no way back for the shopper. This boundary catches
// those errors at the route level and renders a recoverable state instead.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
    this.reset = this.reset.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Logged for diagnostics; never shown to the shopper.
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  componentDidUpdate(prevProps) {
    // Recover automatically when the route changes (e.g. the shopper used
    // the nav or hit back) instead of staying stuck on the error state.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  reset() {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <section className="flex min-h-[60vh] items-center justify-center bg-cream px-6 py-16">
          <div className="max-w-md text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-taupe">BLY</p>
            <h1 className="mt-3 font-display text-3xl text-espresso">Something didn&apos;t load correctly.</h1>
            <p className="mt-4 text-sm leading-relaxed text-brown">
              A page or resource failed to load, possibly due to a slow or interrupted connection.
              Reloading usually fixes this.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
                RELOAD PAGE
              </button>
              <button type="button" className="btn-secondary" onClick={this.reset}>
                TRY AGAIN
              </button>
            </div>
          </div>
        </section>
      )
    }
    return this.props.children
  }
}
