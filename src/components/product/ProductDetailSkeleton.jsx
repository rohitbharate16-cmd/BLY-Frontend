import { motion } from 'framer-motion'

export default function ProductDetailSkeleton() {
  return (
    <motion.section
      className="py-8 md:py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      aria-label="Loading product details"
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="product-skeleton-shimmer aspect-[4/5] border border-[#E8DED2]" />
          <div className="pt-1">
            <div className="product-skeleton-shimmer h-3 w-16" />
            <div className="product-skeleton-shimmer mt-3 h-10 w-3/4" />
            <div className="product-skeleton-shimmer mt-5 h-4 w-28" />
            <div className="product-skeleton-shimmer mt-6 h-4 w-full" />
            <div className="product-skeleton-shimmer mt-2 h-4 w-4/5" />
            <div className="product-skeleton-shimmer mt-6 h-7 w-24" />
            <div className="product-skeleton-shimmer mt-8 h-11 w-full" />
          </div>
        </div>
      </div>
    </motion.section>
  )
}
