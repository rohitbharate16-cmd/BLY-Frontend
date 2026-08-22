import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Star, StarHalf } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import ProductDetailSkeleton from '../components/product/ProductDetailSkeleton'
import ProductGrid from '../components/product/ProductGrid'
import { ImageReveal } from '../components/motion/Primitives'
import { detailItemVariants } from '../components/motion/variants'
import { useCart } from '../context/useCart'
import { getProductById, getProductsByCategory } from '../api/products'

function RatingDisplay({ rating }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  const stars = []

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} size={14} fill="currentColor" />)
  }
  if (hasHalf) {
    stars.push(<StarHalf key="half" size={14} fill="currentColor" />)
  }
  const emptyCount = 5 - stars.length
  for (let i = 0; i < emptyCount; i++) {
    stars.push(
      <Star key={`empty-${i}`} size={14} className="text-[#E8DED2]" />,
    )
  }

  return <div className="flex items-center gap-0.5 text-champagne">{stars}</div>
}

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToBag, setAddedToBag] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    let active = true

    if (!id) {
      setLoading(false)
      return () => { active = false }
    }

    async function fetchProduct() {
      setLoading(true)
      setError(null)
      setProduct(null)
      setRelated([])
      setQuantity(1)
      setAddedToBag(false)
      try {
        const prod = await getProductById(id)
        if (!active) return
        setProduct(prod)
        if (prod) {
          const rel = await getProductsByCategory(prod.category)
          if (!active) return
          setRelated(rel.filter((p) => p.id !== prod.id).slice(0, 4))
        }
      } catch (requestError) {
        if (!active) return
        setProduct(null)
        setRelated([])
        setError(requestError.message || 'We could not load this product.')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchProduct()
    return () => { active = false }
  }, [id, retryKey])

  if (loading) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h1 className="font-display text-2xl text-espresso">{error ? 'Product Unavailable' : 'Product Not Found'}</h1>
          <p className="mt-3 text-sm text-taupe">
            {error || 'We could not find the product you are looking for.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {error && <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="btn-secondary">TRY AGAIN</button>}
            <button type="button" onClick={() => navigate('/shop')} className="btn-primary">RETURN TO SHOP</button>
          </div>
        </div>
      </section>
    )
  }

  const increment = () => setQuantity((q) => q + 1)
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1))
  const handleAddToBag = () => {
    const success = addItem(product, quantity)
    if (!success) {
      navigate('/login')
      return
    }
    setAddedToBag(true)
  }

  return (
    <motion.section
      className="bg-cream py-8 md:py-12 lg:py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(25rem,0.88fr)] lg:items-start lg:gap-14 xl:gap-20">
          <div className="lg:sticky lg:top-24">
            <ImageReveal
              src={product.image}
              alt={product.name}
              className="aspect-[4/5] w-full max-w-[32rem] border border-[#E8DED2] bg-paper shadow-[0_26px_50px_-34px_rgba(46,33,28,0.36)] lg:h-[min(68vh,40rem)] lg:w-[min(100%,32rem)]"
              imageClassName="h-full w-full object-contain object-center"
              loading="eager"
              priority
              eager
              imageWidth={1200}
            />
          </div>

          <motion.div
            className="flex min-w-0 flex-col lg:pt-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { delayChildren: 0.14, staggerChildren: 0.1 } },
            }}
          >
            <motion.p variants={detailItemVariants} className="text-xs uppercase tracking-[0.2em] text-taupe">
              {product.categoryName || product.category}
            </motion.p>
            <motion.h1 variants={detailItemVariants} className="mt-3 font-display text-4xl leading-[0.95] text-espresso sm:text-5xl">
              {product.name}
            </motion.h1>

            <motion.div variants={detailItemVariants} className="mt-4 flex items-center gap-2">
              <RatingDisplay rating={product.rating || 0} />
              <span className="text-xs text-taupe">({product.reviewCount} reviews)</span>
            </motion.div>

            <motion.p variants={detailItemVariants} className="mt-6 text-2xl font-medium text-espresso sm:text-3xl">
              &#8377;{product.price}
            </motion.p>
            <motion.p variants={detailItemVariants} className="mt-6 max-w-xl text-base leading-relaxed text-brown sm:text-lg">
              {product.shortDescription}
            </motion.p>

            <motion.div variants={detailItemVariants} className="mt-8 flex items-center gap-4 border-y border-[#E8DED2] py-5">
              <div className="flex items-center border border-[#E8DED2]">
                <button
                  type="button"
                  onClick={decrement}
                  className="px-3 py-1.5 text-sm text-espresso transition-colors hover:bg-ivory"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm text-espresso">{quantity}</span>
                <button
                  type="button"
                  onClick={increment}
                  className="px-3 py-1.5 text-sm text-espresso transition-colors hover:bg-ivory"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button type="button" className="btn-primary flex-1 text-xs" onClick={handleAddToBag}>
                {addedToBag ? 'ADDED TO BAG' : 'ADD TO BAG'}
              </button>
            </motion.div>
            <AnimatePresence initial={false}>
              {addedToBag && (
                <motion.p
                  className="mt-4 text-xs uppercase tracking-[0.12em] text-taupe"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.24 }}
                  role="status"
                >
                  Your selection is in the bag.
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div variants={detailItemVariants} className="mt-10 space-y-8">
              <section>
                <h2 className="text-xs uppercase tracking-[0.22em] text-espresso">Description</h2>
                <p className="mt-4 text-base leading-[1.75] text-brown sm:text-lg">{product.description || product.shortDescription}</p>
              </section>

              {product.howToUse && (
                <section className="border-t border-[#E8DED2] pt-8">
                  <h2 className="text-xs uppercase tracking-[0.22em] text-espresso">Ingredients & ritual details</h2>
                  <p className="mt-4 whitespace-pre-line text-base leading-[1.75] text-brown sm:text-lg">{product.howToUse}</p>
                </section>
              )}

              <section className="border-t border-[#E8DED2] pt-8">
                <h2 className="text-xs uppercase tracking-[0.22em] text-espresso">Product details</h2>
                <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-base text-brown sm:text-lg">
                  {product.type && <><dt className="text-taupe">Type</dt><dd>{product.type}</dd></>}
                  <dt className="text-taupe">Category</dt><dd>{product.categoryName || product.category}</dd>
                  {product.concern && <><dt className="text-taupe">Concern</dt><dd>{product.concern}</dd></>}
                </dl>
                {(product.tags || []).length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.tags.map((tag) => <span key={tag} className="border border-[#E8DED2] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-taupe">{tag}</span>)}
                  </div>
                )}
              </section>
            </motion.div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="font-display text-sm uppercase tracking-widest text-espresso">
              YOU MAY ALSO LIKE
            </h2>
            <div className="mt-4">
              <ProductGrid
                products={related}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
              />
            </div>
          </div>
        )}
      </div>
    </motion.section>
  )
}
