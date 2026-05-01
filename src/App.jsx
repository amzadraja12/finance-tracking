import { useState } from 'react'
import Dashboard from './pages/Dashboard'
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
    <>
      <Dashboard onAddClick={handleAddUserClick} refreshKey={refreshKey} />
      {showModal && (
        <AddUserForm 
          onClose={handleCloseModal} 
          onUserAdded={handleUserAdded} 
        />
      )}
    </>
  )
}

export default App
