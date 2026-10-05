import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PublicShop from './pages/PublicShop'
import CreateModel from './pages/CreateModel'
import CreateShop from './pages/CreateShop'
import AdminRoute from './components/AdminRoute'
import AdminCategories from './pages/admin/Categories'
import AdminDashboard from './pages/admin/Dashboard'
import AdminStylists from './pages/admin/Stylists'
import AdminShops from './pages/admin/Shops'
import PublicModel from './pages/PublicModel'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/stylists"
            element={
              <AdminRoute>
                <AdminStylists />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/shops"
            element={
              <AdminRoute>
                <AdminShops />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />
          <Route path="/shops/:slug/models/:modelId" element={<PublicModel />} />
          <Route path="/shops/:slug" element={<PublicShop />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protégées */}

          <Route
            path="/dashboard/shop/new"
            element={
              <ProtectedRoute>
                <CreateShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/models/new"
            element={
              <ProtectedRoute>
                <CreateModel />
              </ProtectedRoute>
            }
          />

          {/* Racine */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App