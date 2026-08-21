import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react'
import { premiumEase } from '../motion/variants'
import { optimizedImage } from '../../utils/image'

const logoUrl = 'https://scntzjkdhyqliphbrlif.supabase.co/storage/v1/object/public/product-images/bly-logo.png'

const highlights = ['Dermatologist-formulated', 'Clean, considered ingredients', 'Since 2026']

export default function Hero({ product, content }) {
  const copyTransition = (delay) => ({ duration: 0.9, delay, ease: premiumEase })
  const eyebrow = content?.eyebrow || 'A considered ritual'
  const title = content?.title || 'Beauty Lies in You.'
  const subtitle = content?.subtitle || 'Thoughtfully created beauty for every version of you.'
  const image = content?.imageUrl || product?.image
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = image && !imageFailed

  return (
    <section className="relative isolate overflow-hidden bg-[#e9e1d6]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_17%,rgba(255,255,255,.68),transparent_26%),radial-gradient(circle_at_88%_84%,rgba(174,142,112,.23),transparent_28%)]" />
      <div className="pointer-events-none absolute left-[8%] top-0 h-full border-l border-espresso/10" />
      <div className="pointer-events-none absolute right-[8%] top-0 h-full border-l border-espresso/10" />

      <div className="container relative mx-auto grid gap-12 px-6 py-16 sm:py-20 lg:min-h-[640px] lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-8 lg:py-24">
        <div className="relative z-10 lg:col-span-7">
          <motion.div className="flex items-center gap-3 text-xs uppercase tracking-[0.23em] text-brown" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={copyTransition(0.16)}>
            <Sparkles size={14} strokeWidth={1.35} />
            <span>{eyebrow}</span>
          </motion.div>
          <div className="mt-6 overflow-hidden sm:mt-7">
            <motion.h1 className="max-w-2xl font-display text-[clamp(2.75rem,6.2vw,5.75rem)] leading-[0.92] tracking-[-0.03em] text-espresso" initial={{ opacity: 0, y: '105%' }} animate={{ opacity: 1, y: 0 }} transition={copyTransition(0.42)}>
              {title}
            </motion.h1>
          </div>
          <motion.p className="mt-6 max-w-md text-base leading-relaxed text-brown sm:text-lg" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={copyTransition(0.62)}>
            {subtitle}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={copyTransition(0.8)}>
            <Link to="/shop" className="btn-primary gap-3 px-7 py-3.5">Explore the collection <ArrowUpRight size={16} strokeWidth={1.5} /></Link>
            <Link to="/about" className="btn-secondary px-7 py-3.5">Our philosophy</Link>
          </motion.div>
          <motion.ul
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-espresso/15 pt-6 text-xs uppercase tracking-[0.14em] text-taupe"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={copyTransition(0.98)}
          >
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-champagne" aria-hidden="true" />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="relative lg:col-span-5">
          <motion.div className="absolute -left-6 top-8 hidden h-[calc(100%-4rem)] w-full border border-espresso/20 lg:block" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.1, delay: 0.1, ease: premiumEase }} />
          <motion.figure className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden bg-[#d5c8b8] shadow-[25px_32px_0_rgba(46,33,28,0.09),0_42px_64px_-42px_rgba(46,33,28,.65)] lg:max-w-none" initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} transition={{ duration: 1.2, delay: 0.16, ease: premiumEase }}>
            {showImage ? <motion.img src={optimizedImage(image, 1400)} srcSet={`${optimizedImage(image, 720)} 720w, ${optimizedImage(image, 1400)} 1400w`} sizes="(min-width: 1024px) 38vw, 100vw" alt={product?.name || title} className="h-full w-full object-cover object-center" loading="eager" decoding="async" fetchPriority="high" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.8, delay: 0.16, ease: premiumEase }} onError={() => setImageFailed(true)} /> : <div className="h-full w-full bg-[linear-gradient(145deg,#c5b5a1,#ede5da_52%,#a98d78)]" />}
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/45 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-paper sm:p-6"><div><p className="text-[10px] uppercase tracking-[0.2em] text-paper/70">The BLY ritual</p><p className="mt-1 font-display text-2xl leading-none">{product?.name || 'Made for your moment'}</p></div><span className="border border-paper/55 px-2 py-1 text-[10px] uppercase tracking-[0.14em]">01 / 01</span></figcaption>
          </motion.figure>
          <motion.div
            className="absolute -bottom-7 -left-5 hidden h-24 w-24 items-center justify-center border border-espresso/25 bg-cream/95 p-4 shadow-[0_16px_26px_-18px_rgba(46,33,28,.55)] lg:flex"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 1.2, ease: premiumEase }}
          >
            <img src={logoUrl} alt="BLY" className="h-full w-full object-contain" decoding="async" />
          </motion.div>
        </div>
      </div>
      <motion.div className="relative hidden items-center justify-center gap-2 pb-8 text-xs uppercase tracking-[0.2em] text-taupe lg:flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}>Scroll to discover <ArrowDown size={14} strokeWidth={1.4} /></motion.div>
    </section>
  )
}
