import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import { PageTransition } from '../motion/Primitives'
import GrainOverlay from '../motion/GrainOverlay'
import ScrollToTop from '../common/ScrollToTop'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20" aria-busy="true" aria-label="Loading page">
      <div className="w-full max-w-md space-y-4">
        <div className="h-3 w-24 animate-pulse rounded-full bg-[#E8DED2]" />
        <div className="h-8 w-3/4 animate-pulse rounded-full bg-[#E8DED2]" />
        <div className="h-4 w-full animate-pulse rounded-full bg-[#E8DED2]" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#E8DED2]" />
      </div>
    </div>
  )
}

export default function Layout() {
  const location = useLocation()

  return (
    <>
      <GrainOverlay />
      <Navbar />
      <ScrollToTop />
      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence initial={false}>
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
