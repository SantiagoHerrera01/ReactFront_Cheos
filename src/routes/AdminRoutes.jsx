import { Navigate, Outlet } from 'react-router-dom'
import { useUser } from '../context/UserContext'

export default function AdminRoutes() {
  const { user, loading } = useUser()

  if (loading) return null
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" />

  return <Outlet />
}
