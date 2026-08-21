import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import { PageTransition } from '../motion/Primitives'
import GrainOverlay from '../motion/GrainOverlay'

export default function Layout() {
  const location = useLocation()

  return (
    <>
      <GrainOverlay />
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  )
}
