import { Link } from 'react-router-dom'
import Reveal from '../common/Reveal'
import { ImageReveal } from '../motion/Primitives'

export default function FeaturedCampaign({ product }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
          {product ? (
            <ImageReveal
              src={product.image}
              alt={product.name}
              className="relative mx-auto aspect-[4/5] w-full max-w-md border border-[#E8DED2] bg-ivory lg:mx-0"
              imageClassName="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md border border-[#E8DED2] bg-ivory lg:mx-0" />
          )}

          <Reveal delay={140} className="lg:pr-8">
            <span className="mb-4 block text-xs uppercase tracking-[0.18em] text-taupe">
              THE DAILY GLOW
            </span>
            <h2 className="max-w-md font-display text-3xl leading-[1.05] text-espresso md:text-4xl">
              A radiant complexion, refined.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-brown">
              Meet the essentials that turn routine into ritual — cleanser, serum,
              and moisturizer working as one.
            </p>
            <Link to="/shop/face" className="mt-7 inline-flex">
              <span className="btn-primary text-xs">SHOP NOW</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
