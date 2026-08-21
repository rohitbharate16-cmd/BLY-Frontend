import { Link } from 'react-router-dom'
import Reveal from '../common/Reveal'
import CinematicMedia from '../motion/CinematicMedia'

/**
 * A full-bleed storytelling moment. Ships today as a still campaign image;
 * once real footage exists, pass videoSrc="/media/ritual.mp4" and nothing
 * else in this file needs to change — CinematicMedia handles the swap.
 */
export default function RitualMoment({ image, videoSrc, videoPoster }) {
  if (!image && !videoSrc) return null

  return (
    <section className="relative h-[70vh] min-h-[420px] overflow-hidden bg-espresso sm:h-[80vh]">
      <CinematicMedia
        type={videoSrc ? 'video' : 'image'}
        src={videoSrc}
        poster={videoPoster || image}
        fallbackSrc={image}
        alt=""
        className="absolute inset-0 h-full w-full"
        overlay
      />

      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <Reveal className="max-w-lg">
            <span className="mb-4 block text-xs uppercase tracking-[0.22em] text-champagne">
              A moment, slowed down
            </span>
            <h2 className="font-display text-3xl leading-[1.05] text-cream sm:text-4xl md:text-5xl">
              This is what the ritual feels like.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/80">
              Texture, warmth, and a little quiet — the same feeling we chase in
              every formula, captured in motion.
            </p>
            <Link to="/shop" className="btn-primary mt-8 inline-flex border-champagne bg-cream text-espresso hover:bg-champagne">
              EXPLORE THE RITUAL
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
