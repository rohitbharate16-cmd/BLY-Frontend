import { useEffect, useState, useMemo } from 'react'
import Hero from '../components/home/Hero'
import BlyEdit from '../components/home/BlyEdit'
import DiscoverCategories from '../components/home/DiscoverCategories'
import BrandStatement from '../components/home/BrandStatement'
import RitualMoment from '../components/home/RitualMoment'
import IngredientLab from '../components/home/IngredientLab'
import FeaturedCampaign from '../components/home/FeaturedCampaign'
import MostLoved from '../components/home/MostLoved'
import Newsletter from '../components/home/Newsletter'
import { getBestsellers, getFeaturedProducts } from '../api/products'
import { getHomeContent } from '../api/content'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [productLoading, setProductLoading] = useState(true)
  const [productError, setProductError] = useState(false)
  const [homeContent, setHomeContent] = useState(null)

  useEffect(() => {
    let active = true

    async function fetchHomeProducts() {
      setProductLoading(true)
      setProductError(false)

      try {
        const [featuredProducts, bestsellerProducts, content] = await Promise.all([
          getFeaturedProducts().catch(() => []),
          getBestsellers().catch(() => []),
          getHomeContent().catch(() => null),
        ])
        if (!active) return
        setFeatured(featuredProducts.slice(0, 4))
        setBestsellers(bestsellerProducts.slice(0, 4))
        setHomeContent(content)
      } catch {
        if (active) setProductError(true)
      } finally {
        if (active) setProductLoading(false)
      }
    }

    fetchHomeProducts()
    return () => {
      active = false
    }
  }, [])

  const heroImages = useMemo(() => {
    const srcs = [
      homeContent?.imageUrl,
      ...featured.slice(0, 4).map((p) => p.image),
      ...bestsellers.slice(0, 2).map((p) => p.image),
    ].filter(Boolean)
    return [...new Set(srcs)]
  }, [homeContent?.imageUrl, featured, bestsellers])

  const heroProduct = useMemo(() => {
    return featured.find((product) => product.id === homeContent?.featuredProductId) || featured[0]
  }, [featured, homeContent?.featuredProductId])

  return (
    <>
      <Hero product={heroProduct} content={homeContent} images={heroImages} />
      <BlyEdit products={featured} loading={productLoading} error={productError} />
      <DiscoverCategories />
      <BrandStatement />
      <RitualMoment image={(bestsellers[0] || featured[2] || featured[0])?.image} />
      <IngredientLab products={featured.length ? featured : bestsellers} />
      <FeaturedCampaign product={featured[3] || featured[1] || featured[0]} />
      <MostLoved products={bestsellers} loading={productLoading} error={productError} />
      <Newsletter />
    </>
  )
}
