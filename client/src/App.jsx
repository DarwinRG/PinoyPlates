import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { Suspense, lazy } from 'react'
import ErrorBoundary from '../src/components/ErrorBoundary'
import './App.css'

const Authentication = lazy(() => import('./pages/auth/Auth'))
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'))
const Home = lazy(() => import('./pages/home/Home'))
const Community = lazy(() => import('./pages/community/Community'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path="/auth" element={<Authentication />} />
              <Route path="/verify-email/:email" element={<VerifyEmail />} />
              <Route path="/community" element={<Community />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </AuthProvider>

  )
}

export default App
