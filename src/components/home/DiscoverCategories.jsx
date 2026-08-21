import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../../api/categories'
import Reveal from '../common/Reveal'
import SmartImage from '../common/SmartImage'

const categoryDescriptions = {
  face: 'Mindful essentials for skin that glows from within.',
  body: 'Indulgent care for your outermost layer.',
  wellness: 'Inner beauty, elevated.',
  fragrance: 'Scented stories for quiet confidence.',
}

export default function DiscoverCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    getCategories()
      .then((data) => {
        if (active) setCategories(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (active) setCategories([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <Reveal className="mb-10 md:mb-14">
          <h2 className="font-display text-3xl text-espresso sm:text-4xl md:text-5xl">
            DISCOVER BLY
          </h2>
          <p className="mt-3 max-w-lg text-base text-taupe sm:text-lg">
            Four pillars of considered beauty.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="product-skeleton-shimmer h-32 border border-[#E8DED2] sm:h-40" />
              ))
            : categories.map((category, index) => (
                <Reveal key={category.id} delay={index * 100}>
                  <Link
                    to={`/shop/${category.id}`}
                    className="group relative flex items-center gap-5 overflow-hidden border border-[#E8DED2] bg-paper px-5 py-4 transition-all duration-500 hover:border-espresso/40 hover:shadow-[0_20px_40px_-20px_rgba(46,33,28,0.25)] sm:px-6 sm:py-5"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden border border-[#E8DED2] sm:h-20 sm:w-20">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#c5b5a1,#ede5da_52%,#a98d78)]">
                          <span className="font-display text-lg text-espresso/60">{category.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans uppercase tracking-widest text-taupe">Category</p>
                      <h3 className="mt-1 font-display text-xl text-espresso sm:text-2xl">{category.name}</h3>
                      <p className="mt-1 text-sm text-brown line-clamp-1">{categoryDescriptions[category.id]}</p>
                    </div>

                    <span className="hidden text-xs font-sans uppercase tracking-widest text-taupe transition-all duration-300 group-hover:translate-x-1 group-hover:text-espresso sm:block">
                      EXPLORE
                    </span>
                  </Link>
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  )
}
