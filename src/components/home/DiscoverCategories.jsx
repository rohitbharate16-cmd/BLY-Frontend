import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../../api/categories'
import Reveal from '../common/Reveal'

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
    <section className="py-16 md:py-24 lg:py-28">
      <div className="container mx-auto px-6 lg:px-8">
        <Reveal className="mb-12 md:mb-16 lg:mb-20">
          <p className="mb-4 block text-xs uppercase tracking-[0.18em] text-taupe">
            The Collection
          </p>
          <h2 className="font-display text-4xl text-espresso sm:text-5xl md:text-6xl lg:text-7xl">
            Discover BLY
          </h2>
          <p className="mt-4 max-w-lg text-base text-taupe sm:text-lg md:text-xl">
            Four pillars of considered beauty.
          </p>
        </Reveal>

        <div className="border-t border-[#E8DED2]">
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="product-skeleton-shimmer h-24 border-b border-[#E8DED2] md:h-28"
                />
              ))
            : categories.map((category, index) => (
                <Reveal key={category.id} delay={index * 100}>
                  <Link
                    to={`/shop/${category.id}`}
                    className="group relative flex items-center gap-4 border-b border-[#E8DED2] py-5 transition-colors duration-500 hover:bg-ivory/40 md:gap-6 md:py-6 lg:py-8"
                  >
                    <span className="font-display text-2xl text-champagne/60 transition-colors duration-500 group-hover:text-champagne sm:text-3xl md:text-4xl lg:text-5xl">
                      {`0${index + 1}`}
                    </span>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-2xl text-espresso transition-colors duration-300 group-hover:text-brown sm:text-3xl md:text-4xl lg:text-5xl">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm text-brown line-clamp-1 sm:text-base md:text-lg">
                        {categoryDescriptions[category.id]}
                      </p>
                    </div>

                    <span className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-taupe transition-all duration-300 group-hover:translate-x-1 group-hover:text-espresso sm:text-sm">
                      Explore
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.33337 8H12.6667M12.6667 8L8.00004 3.33333M12.6667 8L8.00004 12.6667"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  )
}
