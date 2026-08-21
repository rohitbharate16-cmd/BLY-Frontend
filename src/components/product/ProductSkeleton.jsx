import { motion } from 'framer-motion'

export default function ProductSkeleton() {
  return (
    <motion.div
      aria-hidden="true"
      className="product-skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <div className="product-skeleton-shimmer aspect-[4/5] border border-[#E8DED2]" />
      <div className="mt-3 space-y-2">
        <div className="product-skeleton-shimmer h-3 w-2/5" />
        <div className="product-skeleton-shimmer h-5 w-4/5" />
        <div className="product-skeleton-shimmer h-4 w-1/4" />
      </div>
    </motion.div>
  )
}
