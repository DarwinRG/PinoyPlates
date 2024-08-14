import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { Suspense, lazy } from 'react'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UnderDevelopment from '../src/components/warning/UnderDevelopment'
import './App.css'

const Authentication = lazy(() => import('./pages/auth/Auth'))
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'))
const Home = lazy(() => import('./pages/home/Home'))
const Community = lazy(() => import('./pages/community/Community'))
const PersistLogin = lazy(() => import('./components/PersistLogin'))
const ForgotPassword = lazy(() => import('./pages/forgot-password/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/reset-password/ResetPassword'))
const NotFound = lazy(() => import('./pages/notfound/NotFound'))

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1100)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            {isMobile ? (
              <UnderDevelopment />
            ) : (
              <Routes>
                <Route path="/auth" element={<Authentication />} />
                <Route path="/verify-email/:email" element={<VerifyEmail />} />
                <Route path='/forgot-password' element={<ForgotPassword />}/>
                <Route path='/reset-password/:resetToken' element={<ResetPassword />}/>
                <Route element={<PersistLogin />}>
                  <Route path='/' element={<Home />} />
                  <Route path="/community" element={<Community />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            )}
          </Suspense>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  )
}

export default App
