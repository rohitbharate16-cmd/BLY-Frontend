import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from '../common/Reveal'
import { premiumEase } from '../motion/variants'
import { optimizedImage } from '../../utils/image'

const STAGES = [
  {
    id: 'wake',
    label: 'Morning',
    heading: 'Wake, gently.',
    copy: 'Start with a light cleanse and a moment of quiet before the day asks anything of you. No rush, no noise — just skin and water.',
    tint: 'linear-gradient(160deg, #F7F3EC 0%, #EFE8DD 60%, #E4D6C4 100%)',
  },
  {
    id: 'midday',
    label: 'Midday',
    heading: 'Hold the glow.',
    copy: 'Light layers that keep skin comfortable through the middle of a full day. Built to move with you, not against you.',
    tint: 'linear-gradient(160deg, #F1E7D6 0%, #E3CDA9 60%, #C9A876 100%)',
  },
  {
    id: 'evening',
    label: 'Evening',
    heading: 'Unwind, slowly.',
    copy: 'Richer textures and a slower hand — the part of the ritual that is just for you. Let the day dissolve.',
    tint: 'linear-gradient(160deg, #E9D9C4 0%, #B39A7A 60%, #8C7768 100%)',
  },
  {
    id: 'rest',
    label: 'Night',
    heading: 'Rest, restored.',
    copy: 'Overnight care that works quietly while the rest of the day finally lets go. Wake up looking like yourself.',
    tint: 'linear-gradient(160deg, #5A463B 0%, #2E211C 70%, #201510 100%)',
  },
]

export default function IngredientLab({ products = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)

  const stage = STAGES[activeIndex]
  const product = products.length ? products[activeIndex % products.length] : null
  const productImage = product?.image

  useEffect(() => {
    setImageFailed(false)
  }, [productImage])

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <Reveal className="max-w-lg">
          <span className="mb-4 block text-xs uppercase tracking-[0.18em] text-taupe">
            THE DAILY RHYTHM
          </span>
          <h2 className="font-display text-2xl text-espresso sm:text-3xl">
            One ritual, four moments.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-brown">
            A simple rhythm built around the way your skin actually lives — morning, midday, evening, and night.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#E8DED2]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={stage.id}
                  className="absolute inset-0"
                  style={{ background: stage.tint }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: premiumEase }}
                />
              </AnimatePresence>

              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence initial={false}>
                  {productImage && !imageFailed && (
                    <motion.img
                      key={product.id ?? stage.id}
                      src={optimizedImage(productImage, 1200)}
                      alt={product.name}
                      className="h-[62%] w-auto object-contain drop-shadow-[0_30px_40px_rgba(46,33,28,0.28)]"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.55, ease: premiumEase }}
                      onError={() => setImageFailed(true)}
                    />
                  )}
                  {(!productImage || imageFailed) && (
                    <motion.div
                      key={`${stage.id}-fallback`}
                      className="h-[62%] w-auto max-w-[70%] rounded-full border border-espresso/20 bg-cream/80"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.55, ease: premiumEase }}
                    />
                  )}
                </AnimatePresence>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/15 via-transparent to-transparent" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-wrap gap-2">
              {STAGES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={activeIndex === index}
                  className={`border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors ${
                    activeIndex === index
                      ? 'border-espresso bg-espresso text-paper'
                      : 'border-[#E8DED2] text-taupe hover:border-champagne hover:text-espresso'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-display text-2xl text-espresso">{stage.heading}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-brown">{stage.copy}</p>
              {product && (
                <p className="mt-4 text-xs uppercase tracking-[0.14em] text-taupe">
                  Featuring — {product.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
