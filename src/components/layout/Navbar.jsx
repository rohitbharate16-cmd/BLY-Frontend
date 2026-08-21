import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { cls } from '../../utils/cls'
import { useAuth } from '../../context/useAuth'
import { useCart } from '../../context/useCart'
import { premiumEase } from '../motion/variants'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
]

const logoUrl = 'https://scntzjkdhyqliphbrlif.supabase.co/storage/v1/object/public/product-images/bly-logo.png'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const accountRef = useRef(null)
  const navigate = useNavigate()
  const { user, loading, signOut } = useAuth()
  const { itemCount } = useCart()
  const accountName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'BLY Member'
  const { scrollY, scrollYProgress } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24)
  })

  useEffect(() => {
    if (!accountOpen) return undefined

    function handlePointerDown(event) {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setAccountOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [accountOpen])

  useEffect(() => {
    if (!user) setAccountOpen(false)
  }, [user])

  async function handleSignOut() {
    setAccountError('')
    setAccountOpen(false)
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch {
      setAccountError('Unable to sign out. Please try again.')
      setAccountOpen(true)
    }
  }

  return (
    <motion.header
      className={cls(
        'sticky top-0 z-40 border-b bg-paper/90 backdrop-blur-md transition-[border-color,box-shadow] duration-500',
        scrolled ? 'border-[#E8DED2] shadow-[0_8px_24px_-16px_rgba(46,33,28,0.25)]' : 'border-transparent',
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-champagne"
        style={{ scaleX: scrollYProgress }}
      />
      <motion.div
        className="container relative mx-auto flex items-center justify-between px-6 lg:px-8"
        animate={{ height: scrolled ? 60 : 80 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ minHeight: 64 }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 text-espresso focus:outline-none lg:hidden"
            onClick={() => setMobileOpen((isOpen) => !isOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="group inline-flex h-10 items-center" aria-label="BLY home">
            <motion.img
              src={logoUrl}
              alt="BLY"
              className="h-9 w-auto object-contain sm:h-10"
              decoding="async"
              fetchPriority="high"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.06, rotate: -2 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </Link>
        </div>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => cls(
                'relative py-1 text-xs uppercase tracking-[0.16em] text-espresso transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:bg-espresso after:transition-transform after:duration-300 hover:text-brown hover:after:scale-x-100',
                isActive ? 'after:scale-x-100' : 'after:scale-x-0',
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Utility navigation">
          <Link to="/search" className="hidden p-2 text-espresso transition-colors duration-200 hover:text-taupe sm:inline-flex" aria-label="Search">
            <Search size={18} strokeWidth={1.5} />
          </Link>
          {loading ? (
            <span className="hidden p-2 text-taupe sm:inline-flex" aria-label="Checking account session">
              <User size={18} strokeWidth={1.5} />
            </span>
          ) : user ? (
            <div ref={accountRef} className="relative hidden sm:block">
              <button
                type="button"
                className="inline-flex p-2 text-espresso transition-colors duration-200 hover:text-taupe focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne"
                onClick={() => {
                  setAccountError('')
                  setAccountOpen((isOpen) => !isOpen)
                }}
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <User size={18} strokeWidth={1.5} />
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-3 w-56 origin-top-right border border-[#E8DED2] bg-paper p-4 shadow-[0_16px_32px_rgba(46,33,28,0.09)]"
                    initial={{ opacity: 0, scale: 0.97, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: -4 }}
                    transition={{ duration: 0.22, ease: premiumEase }}
                    role="menu"
                  >
                    <div className="border-b border-[#E8DED2] pb-3">
                      <p className="truncate text-sm text-espresso">{accountName}</p>
                      <p className="mt-1 truncate text-xs text-taupe">{user.email}</p>
                    </div>
                    <div className="mt-2 flex flex-col">
                      <Link
                        to="/account"
                        className="py-2 text-xs uppercase tracking-[0.14em] text-espresso transition-colors hover:text-taupe"
                        onClick={() => setAccountOpen(false)}
                        role="menuitem"
                      >
                        My Account
                      </Link>
                      <button
                        type="button"
                        className="py-2 text-left text-xs uppercase tracking-[0.14em] text-espresso transition-colors hover:text-taupe focus:outline-none"
                        onClick={handleSignOut}
                        role="menuitem"
                      >
                        Log out
                      </button>
                    </div>
                    {accountError && <p className="mt-2 text-xs text-brown" role="alert">{accountError}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="hidden p-2 text-espresso transition-colors duration-200 hover:text-taupe sm:inline-flex" aria-label="Account">
              <User size={18} strokeWidth={1.5} />
            </Link>
          )}
          <Link to="/cart" className="relative inline-flex p-2 text-espresso transition-colors duration-200 hover:text-taupe" aria-label={`Bag${itemCount ? `, ${itemCount} items` : ''}`}>
            <ShoppingBag size={19} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-espresso px-1 text-[9px] leading-none text-paper">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </nav>
      </motion.div>

      {mobileOpen && (
        <nav className="border-t border-[#E8DED2] bg-paper lg:hidden" aria-label="Mobile navigation">
          <div className="container mx-auto flex flex-col px-6 py-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => cls(
                  'border-b border-[#E8DED2] py-3 text-xs uppercase tracking-[0.16em] transition-colors',
                  isActive ? 'text-espresso' : 'text-taupe hover:text-espresso',
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </motion.header>
  )
}
