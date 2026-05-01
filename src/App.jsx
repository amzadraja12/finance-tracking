import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import UserDetails from './pages/UserDetails'
import AddUserForm from './components/AddUserForm'

function App() {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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
              <Dashboard onAddClick={handleAddUserClick} refreshKey={refreshKey} />
              {showModal && (
                <AddUserForm 
                  onClose={handleCloseModal} 
                  onUserAdded={handleUserAdded} 
                />
              )}
            </>
          } 
        />
        <Route path="/user/:userId" element={<UserDetails refreshKey={refreshKey} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
