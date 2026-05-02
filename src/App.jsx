import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import UserDetails from './pages/UserDetails'
import AddUserForm from './components/AddUserForm'
import Login from './components/Login'

function AppContent() {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { isAdmin } = useAuth()

  const handleAddUserClick = () => setShowModal(true)
  const handleCloseModal = () => setShowModal(false)
  const handleUserAdded = () => {
    setShowModal(false)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <header style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                padding: '16px 24px',
                background: '#f9fafb',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <Login />
              </header>
              <Dashboard onAddClick={handleAddUserClick} refreshKey={refreshKey} isAdmin={isAdmin} />
              {showModal && (
                <AddUserForm 
                  onClose={handleCloseModal} 
                  onUserAdded={handleUserAdded} 
                />
              )}
            </>
          } 
        />
        <Route path="/user/:userId" element={<UserDetails refreshKey={refreshKey} isAdmin={isAdmin} />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
