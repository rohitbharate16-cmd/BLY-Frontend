import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { premiumEase } from './variants'

/**
 * Cinemagraph
 * A slow, looping crossfade + Ken-Burns zoom across a set of images to read as a
 * living, ambient "video" moment rather than a static photo — the same technique
 * premium beauty/fashion sites use for hero loops when they don't want an actual
 * heavy video file. Not a literal .mp4/.gif — a motion-driven simulation of one,
 * built entirely from real product photography already in the catalog.
 */
export default function Cinemagraph({ images = [], interval = 3600, className, imageClassName, overlay = true }) {
  const [index, setIndex] = useState(0)
  const validImages = images.filter(Boolean)

  useEffect(() => {
    if (validImages.length < 2) return undefined
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % validImages.length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [validImages.length, interval])

  if (validImages.length === 0) return null

  return (
    <div className={className} aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.img
          key={validImages[index]}
          src={validImages[index]}
          className={imageClassName}
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.16 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.4, ease: premiumEase },
            scale: { duration: interval / 1000 + 1.4, ease: 'linear' },
          }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AnimatePresence>
      {overlay && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(46,33,28,0) 40%, rgba(46,33,28,0.35) 100%)' }}
        />
      )}
    </div>
  )
}
