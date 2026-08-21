import { lazy, Suspense } from 'react'
import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PlaceholderPage from './components/common/PlaceholderPage'
import ErrorBoundary from './components/common/ErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Account = lazy(() => import('./pages/Account'))
const Cart = lazy(() => import('./pages/Cart'))

const placeholderRoutes = {
  '/search': { title: 'Search', subtitle: 'Search across our full collection of beauty and self-care essentials.' },
  '/checkout': { title: 'Checkout', subtitle: 'Complete your purchase securely in the next phase.' },
  '/account/orders': { title: 'Your Orders', subtitle: 'Track and review your recently placed orders.' },
  '/contact': { title: 'Contact', subtitle: 'Reach out to our care team for assistance.' },
  '/shipping': { title: 'Shipping', subtitle: 'Delivery information and timelines.' },
  '/returns': { title: 'Returns', subtitle: 'Our policy on returns and exchanges.' },
  '/faq': { title: 'FAQ', subtitle: 'Answers to frequently asked questions.' },
  '/privacy': { title: 'Privacy Policy', subtitle: 'How we collect and use your information.' },
  '/terms': { title: 'Terms of Service', subtitle: 'The terms governing your use of BLY.' },
}

function App() {
  const location = useLocation()
  return (
    <div className="App">
      <ErrorBoundary resetKey={location.pathname}>
        <Suspense fallback={<div className="min-h-screen bg-cream" aria-busy="true" />}>
          <Routes>
          <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/our-story" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/account"
            element={(
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            )}
          />
          {Object.entries(placeholderRoutes).map(([path, props]) => (
            <Route key={path} path={path} element={<PlaceholderPage {...props} />} />
          ))}
          <Route
            path="*"
            element={
              <PlaceholderPage
                title="Page Not Found"
                subtitle="The page you are looking for doesn't exist or has been moved."
              />
            }
          />
          </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default App
