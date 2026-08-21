import { Link } from 'react-router-dom'
import ProductGrid from '../product/ProductGrid'
import SectionLabel from '../common/SectionLabel'
import Reveal from '../common/Reveal'

export default function BlyEdit({ products, loading, error }) {

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <Reveal>
          <SectionLabel>THE BLY EDIT</SectionLabel>
          <h2 className="font-display text-3xl text-espresso sm:text-4xl">
            A considered selection of everyday beauty essentials.
          </h2>
        </Reveal>

        <div className="mt-8">
          <ProductGrid
            products={products}
            loading={loading}
            className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
          />
        </div>

        {error && <p className="mt-8 text-sm text-taupe">Products are currently unavailable.</p>}

        <Reveal className="mt-10 text-center" delay={180}>
          <Link to="/shop" className="font-sans text-sm uppercase tracking-widest text-espresso underline">
            SHOP ALL ESSENTIALS
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
