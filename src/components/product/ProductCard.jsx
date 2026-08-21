import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ShoppingBag } from 'lucide-react'
import { cls } from '../../utils/cls'
import { useCart } from '../../context/useCart'
import SmartImage from '../common/SmartImage'

export default function ProductCard({ product, className }) {
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  if (!product) return null

  const { id, name, category, categoryName, price, image, newArrival, badge } = product
  const categoryLabel = categoryName || category
  const showBadge = badge || (newArrival ? 'New' : null)

  function handleQuickAdd(event) {
    event.preventDefault()
    event.stopPropagation()
    addItem(product, 1)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <Link
      to={`/product/${id}`}
      className={cls(
        'group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne',
        className,
      )}
    >
      <div className="relative mb-3 aspect-[4/5] overflow-hidden border border-[#E8DED2] bg-paper shadow-[0_0_0_rgba(46,33,28,0)] transition-shadow duration-500 group-hover:shadow-[0_24px_48px_-20px_rgba(46,33,28,0.28)]">
        <SmartImage
          src={image}
          alt={name}
          className="h-full w-full"
          imageClassName="h-full w-full object-cover object-center transition-transform duration-[1100ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
          widths={[360, 720]}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
          loading="lazy"
        />

        {/* bottom gradient for legibility of quick-add bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-espresso/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {showBadge && (
          <span className="absolute top-2 right-2 z-10 bg-champagne px-2 py-0.5 text-[10px] uppercase tracking-widest text-espresso">
            {showBadge}
          </span>
        )}

        {/* quick add — slides up on hover */}
        <div className="absolute inset-x-2 bottom-2 z-10 translate-y-[130%] opacity-0 transition-all duration-400 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden bg-paper/95 py-2.5 text-[11px] uppercase tracking-[0.16em] text-espresso backdrop-blur-sm transition-colors duration-200 hover:bg-espresso hover:text-paper"
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="added"
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center gap-2"
                >
                  <Check size={13} strokeWidth={1.75} />
                  Added
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag size={13} strokeWidth={1.5} />
                  Quick Add
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <div className="space-y-1 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-px">
        <p className="text-xs uppercase tracking-widest text-taupe">{categoryLabel}</p>
        <h3 className="min-h-12 font-display text-lg leading-tight text-espresso transition-colors duration-300 group-hover:text-brown">{name}</h3>
        <p className="text-base text-espresso">&#8377;{price}</p>
      </div>
    </Link>
  )
}
