import { useEffect, useState } from 'react'
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
      try {
        const [featuredProducts, bestsellerProducts, content] = await Promise.all([
          getFeaturedProducts(),
          getBestsellers(),
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

  return (
    <>
      <Hero product={featured.find((product) => product.id === homeContent?.featuredProductId) || featured[0]} content={homeContent} />
      <BlyEdit products={featured} loading={productLoading} error={productError} />
      <DiscoverCategories />
      <BrandStatement />
      <RitualMoment image={(featured[2] || bestsellers[0] || featured[0])?.image} />
      <IngredientLab products={featured.length ? featured : bestsellers} />
      <FeaturedCampaign product={featured[1] || featured[0]} />
      <MostLoved products={bestsellers} loading={productLoading} error={productError} />
      <Newsletter />
    </>
  )
}
