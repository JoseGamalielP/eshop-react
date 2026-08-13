import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useBasket } from '../../hooks/useBasket'

function Navbar() {
  const { totalItems, userName, changeUserName, isLoading, isSaving } = useBasket()
  const [nextUserName, setNextUserName] = useState(userName)

  const handleSubmit = (event) => {
    event.preventDefault()
    changeUserName(nextUserName)
  }

  useEffect(() => {
    setNextUserName(userName)
  }, [userName])

  return (
    <header className="navbar">
      <NavLink to="/" className="brand" aria-label="Ir al inicio">
        eShop React
      </NavLink>

      <nav className="nav-links" aria-label="Navegacion principal">
        <NavLink to="/" end>
          Inicio
        </NavLink>
        <NavLink to="/products">Productos</NavLink>
        <NavLink to="/products/manage">Administrar productos</NavLink>
        <NavLink to="/orders">Ordenes</NavLink>
        <NavLink to="/basket">
          Carrito <span className="basket-count">{totalItems}</span>
        </NavLink>
      </nav>

      <form className="customer-switcher" onSubmit={handleSubmit} aria-label="Cambiar cliente activo">
        <label htmlFor="customer-switcher-input">Cliente</label>
        <input
          id="customer-switcher-input"
          type="text"
          value={nextUserName}
          onChange={(event) => setNextUserName(event.target.value)}
          disabled={isLoading || isSaving}
        />
        <button type="submit" disabled={isLoading || isSaving || !nextUserName.trim() || nextUserName.trim() === userName}>
          Cambiar
        </button>
      </form>
    </header>
  )
}

export default Navbar
