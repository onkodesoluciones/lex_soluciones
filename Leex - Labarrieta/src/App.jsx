import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Login from './components/Auth/Login'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Defibrillators from './pages/Defibrillators'
import Tests from './pages/Tests'
import Inventory from './pages/Inventory'
import Documents from './pages/Documents'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/defibrillators" element={<Defibrillators />} />
                    <Route path="/tests" element={<Tests />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/documents" element={<Documents />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

