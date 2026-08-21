import { useState } from 'react'
import { cls } from '../../utils/cls'
import { optimizedImage } from '../../utils/image'

// Centralizes responsive Supabase-transformed sources plus a broken-image
// fallback so a missing/failed asset never leaves a blank or broken visual
// area. The wrapper keeps the caller's aspect-ratio classes so nothing
// shifts layout when the fallback appears.
export default function SmartImage({
  src,
  alt = '',
  widths = [480, 960],
  sizes = '100vw',
  className,
  imageClassName = 'h-full w-full object-cover object-center',
  loading = 'lazy',
  priority = false,
  fallbackClassName,
}) {
  const [failed, setFailed] = useState(false)
  const showFallback = !src || failed
  const maxWidth = widths[widths.length - 1]

  return (
    <div className={cls('relative overflow-hidden', className)}>
      {showFallback ? (
        <div
          className={cls(
            'flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#c5b5a1,#ede5da_52%,#a98d78)]',
            fallbackClassName,
          )}
          role="img"
          aria-label={alt}
        />
      ) : (
        <img
          src={optimizedImage(src, maxWidth)}
          srcSet={widths.map((width) => `${optimizedImage(src, width)} ${width}w`).join(', ')}
          sizes={sizes}
          alt={alt}
          className={imageClassName}
          loading={priority ? 'eager' : loading}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
