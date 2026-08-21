import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { StaggerContainer, StaggerItem } from '../components/motion/Primitives'
import { premiumEase } from '../components/motion/variants'
import { useCart } from '../context/useCart'
import SmartImage from '../components/common/SmartImage'

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)
}

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <section className="bg-cream py-16 md:py-24">
        <div className="container mx-auto max-w-xl px-6 text-center lg:px-8">
          <p className="text-xs uppercase tracking-[0.22em] text-taupe">BLY / YOUR BAG</p>
          <h1 className="mt-4 font-display text-4xl leading-none text-espresso sm:text-5xl">Your bag is waiting.</h1>
          <p className="mt-5 text-sm leading-relaxed text-brown">Discover considered essentials for the rituals that belong to you.</p>
          <Link to="/shop" className="btn-primary mt-8">SHOP COLLECTION</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-cream py-12 md:py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <StaggerContainer className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16" stagger={0.08}>
          <div>
            <StaggerItem>
              <p className="text-xs uppercase tracking-[0.22em] text-taupe">BLY / YOUR BAG</p>
              <h1 className="mt-4 font-display text-4xl leading-none text-espresso sm:text-5xl">Your Bag</h1>
            </StaggerItem>

            <div className="mt-9 border-t border-[#E8DED2]">
              {items.map((item) => (
                <StaggerItem key={item.id} className="border-b border-[#E8DED2] py-5 sm:py-6">
                  <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:gap-6">
                    <Link to={`/product/${item.id}`} className="aspect-[4/5] overflow-hidden border border-[#E8DED2] bg-paper">
                      <SmartImage
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full"
                        imageClassName="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                        widths={[240, 360]}
                        sizes="(min-width: 640px) 7.5rem, 6rem"
                      />
                    </Link>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.14em] text-taupe">{item.category}</p>
                      <Link to={`/product/${item.id}`} className="mt-1 block font-display text-xl text-espresso transition-colors hover:text-brown sm:text-2xl">{item.name}</Link>
                      <p className="mt-2 text-sm text-espresso">₹{formatPrice(item.price)}</p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center border border-[#E8DED2]">
                          <button type="button" className="px-3 py-1.5 text-sm text-espresso transition-colors hover:bg-ivory" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button>
                          <span className="w-8 text-center text-sm text-espresso" aria-label={`${item.quantity} ${item.name}`}>{item.quantity}</span>
                          <button type="button" className="px-3 py-1.5 text-sm text-espresso transition-colors hover:bg-ivory" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}>+</button>
                        </div>
                        <button type="button" className="text-xs uppercase tracking-[0.12em] text-taupe underline-offset-4 transition-colors hover:text-espresso hover:underline" onClick={() => removeItem(item.id)}>Remove</button>
                      </div>
                    </div>
                    <p className="hidden whitespace-nowrap text-sm text-espresso sm:block">₹{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </div>

          <StaggerItem>
            <aside className="border border-[#E8DED2] bg-paper p-6 lg:sticky lg:top-28">
              <p className="text-xs uppercase tracking-[0.18em] text-taupe">Order Summary</p>
              <div className="mt-6 flex items-baseline justify-between border-b border-[#E8DED2] pb-5">
                <span className="text-sm text-brown">Subtotal</span>
                <span className="font-display text-2xl text-espresso">₹{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-taupe">Shipping and any applicable taxes are calculated at checkout.</p>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.18, ease: premiumEase }}>
                <Link to="/checkout" className="btn-primary mt-6 w-full">PROCEED TO CHECKOUT</Link>
              </motion.div>
              <Link to="/shop" className="mt-5 block text-center text-xs uppercase tracking-[0.12em] text-brown underline-offset-4 transition-colors hover:text-taupe hover:underline">Continue shopping</Link>
            </aside>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  )
}
