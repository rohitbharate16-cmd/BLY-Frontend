import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/common/Reveal'
import SectionLabel from '../components/common/SectionLabel'
import CinematicMedia from '../components/motion/CinematicMedia'
import { StaggerContainer, StaggerItem } from '../components/motion/Primitives'
import { getBestsellers, getFeaturedProducts } from '../api/products'

const logoUrl = 'https://scntzjkdhyqliphbrlif.supabase.co/storage/v1/object/public/product-images/bly-logo.png'

const values = [
  {
    title: 'Slow, on purpose',
    copy: "We'd rather ship one formula a year that we're proud of than ten that are merely fine.",
  },
  {
    title: 'Ingredients you can say out loud',
    copy: 'Every label reads the way the box does. No filler, no fog.',
  },
  {
    title: 'Made to be used, not shelved',
    copy: 'Considered packaging, but never precious — this is for daily rituals, not display cases.',
  },
]

export default function About() {
  const [gallery, setGallery] = useState([])

  useEffect(() => {
    let active = true

    async function loadImagery() {
      try {
        const [featured, bestsellers] = await Promise.all([
          getFeaturedProducts(),
          getBestsellers(),
        ])
        if (!active) return
        const images = [...featured, ...bestsellers]
          .map((product) => product.image)
          .filter(Boolean)
        setGallery(Array.from(new Set(images)).slice(0, 5))
      } catch {
        if (active) setGallery([])
      }
    }

    loadImagery()
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      {/* Opening: large cinematic visual, minimal headline */}
      <section className="relative flex h-[86vh] min-h-[560px] items-end overflow-hidden bg-espresso">
        <CinematicMedia
          type="image"
          src={gallery[0]}
          alt="A BLY formula, up close"
          className="absolute inset-0 h-full w-full"
          overlay
          eager
        />
        <div className="relative z-10 w-full pb-16 md:pb-20">
          <div className="container mx-auto px-6 lg:px-8">
            <Reveal>
              <h1 className="max-w-2xl font-display text-4xl leading-[1.02] text-cream sm:text-6xl md:text-7xl">
                Beauty Lies in You.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/80 md:text-base">
                A quiet, considered brand for people who want their skin to feel like theirs again.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The story: editorial split */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto grid items-center gap-10 px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          <div className="lg:col-span-6">
            <Reveal>
              <SectionLabel>OUR STORY</SectionLabel>
              <h2 className="max-w-lg font-display text-3xl leading-[1.08] text-espresso sm:text-4xl">
                It started as a refusal.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-brown">
                A refusal of routines that asked us to hide, correct, and cover. BLY began
                as a handful of cold-pressed formulas mixed in small batches and handed to
                friends to test — no funding, no factory, just a conviction that
                everyday beauty could be gentler.
              </p>
              <p className="mt-4 max-w-md text-base leading-relaxed text-brown">
                Today we are a small team, still obsessed with the same question we
                started with: what does beauty look like when it is not performed for
                anyone but you?
              </p>
              <Link to="/shop" className="btn-primary mt-8 inline-flex">
                SHOP THE COLLECTION
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal variant="media" delay={140}>
              <CinematicMedia
                type="image"
                src={gallery[1] || gallery[0]}
                alt="From our shelves to yours"
                className="relative aspect-[4/5] w-full border border-[#E8DED2] shadow-[0_30px_60px_-30px_rgba(46,33,28,0.35)]"
              >
                {!gallery.length && (
                  <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_18%,#fffdf9,transparent_28%),linear-gradient(145deg,#d9cab8,#f4eee5_55%,#bc9e84)]">
                    <div className="relative grid h-52 w-52 place-items-center rounded-full border border-espresso/25 bg-cream/90 p-9 shadow-[0_20px_40px_-22px_rgba(46,33,28,.5)]">
                      <div className="absolute inset-3 rounded-full border border-dashed border-champagne/70" />
                      <img src={logoUrl} alt="BLY" className="relative h-full w-full object-contain" decoding="async" />
                    </div>
                    <span className="absolute right-5 top-5 text-[11px] uppercase tracking-[0.2em] text-brown">BLY / 01</span>
                  </div>
                )}
                <span className="absolute bottom-4 left-4 z-10 text-[10px] uppercase tracking-[0.2em] text-cream/90">
                  From our shelves to yours
                </span>
              </CinematicMedia>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values, with stronger visual hierarchy */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <Reveal className="max-w-xl">
            <SectionLabel>WHAT WE BELIEVE</SectionLabel>
            <h2 className="font-display text-2xl text-espresso sm:text-3xl">
              Three ideas we do not compromise on.
            </h2>
          </Reveal>

          <StaggerContainer className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-[#E8DED2] bg-[#E8DED2] md:grid-cols-3">
            {values.map((value, index) => (
              <StaggerItem key={value.title} className="relative bg-cream p-8 md:p-10">
                <span className="font-display text-4xl text-champagne/70">{`0${index + 1}`}</span>
                <h3 className="mt-6 font-display text-xl text-espresso">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-brown">{value.copy}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Closing: memorable full-width visual back into the shop */}
      <section className="relative flex h-[60vh] min-h-[420px] items-center overflow-hidden bg-espresso">
        <CinematicMedia
          type="image"
          src={gallery[2] || gallery[0]}
          alt=""
          className="absolute inset-0 h-full w-full"
          overlay
        />
        <div className="container relative z-10 mx-auto px-6 text-center lg:px-8">
          <Reveal className="mx-auto max-w-2xl space-y-2">
            <p className="font-display text-2xl italic text-cream sm:text-3xl">
              We are not trying to reinvent you.
            </p>
            <p className="font-display text-2xl italic text-cream sm:text-3xl">
              We are just here to help you feel like you, slightly more often.
            </p>
            <Link to="/shop" className="btn-primary mt-8 inline-flex border-champagne bg-cream text-espresso hover:bg-champagne">
              DISCOVER THE EDIT
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
