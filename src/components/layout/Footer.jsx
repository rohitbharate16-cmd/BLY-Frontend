import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Reveal from '../common/Reveal'

const footerLinks = {
  SHOP: [
    { label: 'Face', to: '/shop/face' },
    { label: 'Body', to: '/shop/body' },
    { label: 'Wellness', to: '/shop/wellness' },
    { label: 'Fragrance', to: '/shop/fragrance' },
  ],
  ABOUT: [
    { label: 'Our Story', to: '/our-story' },
  ],
  HELP: [
    { label: 'Contact', to: '/contact' },
    { label: 'FAQ', to: '/faq' },
  ],
}

export default function Footer() {
  return (
    <footer className="mt-auto overflow-hidden border-t border-[#E8DED2] bg-paper py-12 md:py-14">
      <div className="container mx-auto px-6 lg:px-8">
        <Reveal className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="mb-4 text-xs uppercase tracking-widest text-taupe">{title}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-espresso transition-colors hover:text-taupe"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>

        <Reveal delay={120} className="mt-14 border-t border-[#E8DED2] pt-7 text-center">
          <Link to="/" aria-label="BLY home" className="inline-block">
            <motion.span
              className="inline-block font-display text-4xl font-semibold tracking-[0.14em] text-espresso sm:text-5xl"
              whileHover={{ scale: 1.04, letterSpacing: '0.18em' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              BLY
            </motion.span>
          </Link>
          <p className="mt-2 text-xs uppercase tracking-widest text-taupe">
            BEAUTY LIES IN YOU
          </p>
          <p className="mt-1 text-xs text-taupe">
            &copy; 2026 BLY
          </p>
        </Reveal>
      </div>
    </footer>
  )
}
