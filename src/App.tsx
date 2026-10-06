import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Models from './pages/Models'
import ShopPage from './pages/Shop'
import CreateModel from './pages/CreateModel'
import CreateShop from './pages/CreateShop'
import PublicShop from './pages/PublicShop'
import PublicModel from './pages/PublicModel'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/admin/Dashboard'
import AdminCategories from './pages/admin/Categories'
import AdminStylists from './pages/admin/Stylists'
import AdminShops from './pages/admin/Shops'
import ScrollToTop from './components/ScrollToTop'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import ModelDetail from './pages/ModelDetail'
import Settings from './pages/Settings'
import ConfirmDeletion from './pages/ConfirmDeletion'
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* ─── Routes publiques ─── */}
          <Route path="/shops/:slug/models/:modelId" element={<PublicModel />} />
          <Route path="/shops/:slug" element={<PublicShop />} />

          {/* ─── Auth ─── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account/deletion/confirm/:token" element={<ConfirmDeletion />} />

          {/* ─── Dashboard styliste (protégé) ─── */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/models" element={<ProtectedRoute><Models /></ProtectedRoute>} />
          <Route path="/dashboard/models/new" element={<ProtectedRoute><CreateModel /></ProtectedRoute>} />
          <Route path="/dashboard/models/:id" element=
          {<ProtectedRoute><ModelDetail /></ProtectedRoute>}/>
          <Route path="/dashboard/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
          <Route path="/dashboard/shop/new" element={<ProtectedRoute><CreateShop /></ProtectedRoute>} />
          <Route path="/onboarding"element=
          {<ProtectedRoute><Onboarding /></ProtectedRoute>}/>
          <Route path="/dashboard/settings"element=
          {<ProtectedRoute><Settings /></ProtectedRoute>}/>

          {/* ─── Admin SaaS (protégé + rôle admin) ─── */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/stylists" element={<AdminRoute><AdminStylists /></AdminRoute>} />
          <Route path="/admin/shops" element={<AdminRoute><AdminShops /></AdminRoute>} />

          {/* ─── Racine & 404 ─── */}
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App