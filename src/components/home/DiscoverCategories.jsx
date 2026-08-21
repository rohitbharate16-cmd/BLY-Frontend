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
        // An API proxy or an empty backend response can otherwise leave this
        // state as null, causing the render below to call `.map()` on null.
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
        <Reveal>
          <h2 className="font-display text-2xl text-espresso">
            DISCOVER BLY
          </h2>
          <p className="mt-2 text-sm text-taupe">
            Four pillars of considered beauty.
          </p>
        </Reveal>

        <div className="mt-8 space-y-2">
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="product-skeleton-shimmer h-[76px] border-y border-[#E8DED2]" />
            ))
            : categories.map((category, index) => (
              <Reveal key={category.id} delay={index * 70}>
                <Link
                  to={`/shop/${category.id}`}
                  className="group block border-y border-[#E8DED2] py-5 transition-colors duration-300 hover:bg-ivory/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-sans uppercase tracking-widest text-taupe">
                        {category.name}
                      </p>
                      <p className="mt-1 font-display text-sm text-espresso">
                        {categoryDescriptions[category.id]}
                      </p>
                    </div>
                    <span className="text-xs font-sans uppercase tracking-widest text-taupe transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brown">
                      EXPLORE
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
        </div>
      </div>
    </section>
  )
}
