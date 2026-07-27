import { Outlet } from 'react-router-dom'
import { useBasket } from '../../hooks/useBasket'
import Navbar from './Navbar'

function Layout() {
  const { notification } = useBasket()

  return (
    <div className="app-shell">
      <Navbar />
      {notification && (
        <div className={`notification notification-${notification.type}`} role="status">
          {notification.message}
        </div>
      )}
      <main className="main-container">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
