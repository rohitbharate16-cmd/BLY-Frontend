import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cls } from '../../utils/cls'
import { premiumEase } from './variants'
import { optimizedImage } from '../../utils/image'

const viewport = {
  once: false,
  amount: 0.24,
  margin: '0px 0px -12% 0px',
}

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: premiumEase },
  },
}

const mediaVariants = {
  hidden: { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
  visible: {
    opacity: 1,
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 1.05, ease: premiumEase },
  },
}

const imageVariants = {
  hidden: { scale: 1.055 },
  visible: {
    scale: 1,
    transition: { duration: 1.35, ease: premiumEase },
  },
}

export function SectionReveal({ children, className, delay = 0, variant = 'up' }) {
  const baseVariants = variant === 'media' ? mediaVariants : revealVariants
  const variants = {
    hidden: baseVariants.hidden,
    visible: {
      ...baseVariants.visible,
      transition: {
        ...baseVariants.visible.transition,
        delay: delay / 1000,
      },
    },
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({ children, className, delayChildren = 0, stagger = 0.08, eager = false }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={eager ? 'visible' : undefined}
      whileInView={eager ? undefined : 'visible'}
      viewport={viewport}
      variants={{
        hidden: {},
        visible: { transition: { delayChildren, staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }) {
  return (
    <motion.div className={className} variants={revealVariants}>
      {children}
    </motion.div>
  )
}

export function ImageReveal({ src, alt, className, imageClassName, loading = 'lazy', priority = false, eager = false, imageWidth = 900 }) {
  const [failed, setFailed] = useState(false)
  const showFallback = !src || failed

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <motion.div
      className={cls('overflow-hidden', className)}
      initial="hidden"
      animate={eager ? 'visible' : undefined}
      whileInView={eager ? undefined : 'visible'}
      viewport={viewport}
      variants={mediaVariants}
    >
      {showFallback ? (
        <div className={cls('h-full w-full bg-[linear-gradient(145deg,#c5b5a1,#ede5da_52%,#a98d78)]', imageClassName)} role="img" aria-label={alt} />
      ) : (
        <motion.img
          src={optimizedImage(src, imageWidth)}
          srcSet={`${optimizedImage(src, Math.round(imageWidth / 2))} ${Math.round(imageWidth / 2)}w, ${optimizedImage(src, imageWidth)} ${imageWidth}w`}
          sizes="(min-width: 1024px) 50vw, 100vw"
          alt={alt}
          className={imageClassName}
          loading={loading}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          variants={imageVariants}
          onError={() => setFailed(true)}
        />
      )}
    </motion.div>
  )
}

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: premiumEase }}
    >
      {children}
    </motion.div>
  )
}
