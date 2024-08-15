import { Navigate, Outlet } from 'react-router-dom'
import useAuth from "../../hooks/useAuth"

const ProtectedRoute = () => {
  const { auth } = useAuth()

  console.log(auth.accessToken)

  // Check if access token is present and user has the required role
  const isAuthorized = auth?.accessToken 

  // Redirect to authentication if there's no access token
  if (!auth?.accessToken) {
    return <Navigate to="/auth" />
  }

  return <Outlet />
}

export default ProtectedRoute
