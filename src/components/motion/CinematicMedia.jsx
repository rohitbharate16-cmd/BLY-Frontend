import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cls } from '../../utils/cls'
import { optimizedImage } from '../../utils/image'

/**
 * CinematicMedia
 *
 * A single reusable component for every "immersive visual" moment on the
 * site — hero loops, category storytelling, campaign banners, About-page
 * sections. It supports three interchangeable media shapes so a section can
 * ship today with a static image and swap in real footage later without any
 * component changes:
 *
 *   type="video"  → optimized <video> (mp4/webm), muted/loop/playsInline,
 *                   with a poster and automatic fallback to `fallbackSrc`
 *                   if the video fails to load or decode.
 *   type="gif"    → an animated image asset (gif/apng/animated webp).
 *   type="image"  → a plain static image (the default / always-safe option).
 *
 * Usage once real assets exist:
 *   <CinematicMedia type="video" src="/media/ritual.mp4" poster="/media/ritual.jpg" />
 * Until then, every call site in this codebase passes type="image" with a
 * product/campaign photo, so nothing breaks and nothing needs rewriting.
 */
export default function CinematicMedia({
  type = 'image',
  src,
  webmSrc,
  poster,
  fallbackSrc,
  alt = '',
  autoPlay = true,
  loop = true,
  muted = true,
  eager = false,
  className,
  mediaClassName,
  overlay = false,
  children,
}) {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef(null)
  const [inView, setInView] = useState(eager)
  const [videoFailed, setVideoFailed] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  // Lazy-load below-the-fold media: don't request video/gif bytes until the
  // section is actually about to enter the viewport.
  useEffect(() => {
    if (eager || inView) return
    const node = containerRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [eager, inView])

  const showMotionMedia = type !== 'image' && inView && !videoFailed && !(type === 'video' && prefersReducedMotion)
  const stillSrc = fallbackSrc || poster || src
  const optimizedStill = stillSrc ? optimizedImage(stillSrc, 1200) : null
  const optimizedSrc = src ? optimizedImage(src, 1200) : null
  const showImageFallback = type === 'image' && (!optimizedStill || imageFailed)

  return (
    <div ref={containerRef} className={cls('relative overflow-hidden', className)}>
      {type === 'video' && showMotionMedia && (
        <video
          className={cls('h-full w-full object-cover', mediaClassName)}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload={eager ? 'auto' : 'none'}
          aria-label={alt}
          onError={() => setVideoFailed(true)}
        >
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          {src && <source src={src} type="video/mp4" />}
        </video>
      )}

      {type === 'gif' && showMotionMedia && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={cls('h-full w-full object-cover', mediaClassName)}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setVideoFailed(true)}
        />
      )}

      {/* Static fallback: renders for type="image", before the motion asset
          has loaded, if the video failed, or when the person prefers
          reduced motion (a still frame instead of an autoplaying video). */}
      {!showMotionMedia && optimizedStill && !imageFailed && !showImageFallback && (
        <img
          src={optimizedStill}
          alt={alt}
          className={cls('h-full w-full object-cover', mediaClassName)}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      )}

      {showImageFallback && (
        <div className={cls('h-full w-full bg-[linear-gradient(145deg,#c5b5a1,#ede5da_52%,#a98d78)]', mediaClassName)} role="img" aria-label={alt} />
      )}

      {overlay && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(46,33,28,0) 40%, rgba(46,33,28,0.35) 100%)' }}
        />
      )}

      {children}
    </div>
  )
}
