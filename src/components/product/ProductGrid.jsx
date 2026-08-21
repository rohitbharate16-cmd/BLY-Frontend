import { AnimatePresence, motion } from 'framer-motion'
import ProductCard from './ProductCard'
import ProductSkeleton from './ProductSkeleton'
import { StaggerContainer, StaggerItem } from '../motion/Primitives'

const defaultGridClass = 'grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4'

export default function ProductGrid({ products = [], loading = false, className = defaultGridClass, skeletonCount = 4, eager = false }) {
  const productKey = products.map((product) => product.id).join('-') || 'empty'

  return (
    <AnimatePresence mode="wait" initial={false}>
      {loading ? (
        <motion.div
          key="product-skeletons"
          className={className}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
        >
          {Array.from({ length: skeletonCount }, (_, index) => <ProductSkeleton key={index} />)}
        </motion.div>
      ) : (
        <StaggerContainer key={`products-${productKey}`} className={className} eager={eager}>
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </AnimatePresence>
  )
}
