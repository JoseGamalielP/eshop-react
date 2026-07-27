import { NavLink } from 'react-router-dom'
import { useBasket } from '../../hooks/useBasket'

function Navbar() {
  const { totalItems } = useBasket()

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
        <NavLink to="/basket">
          Carrito <span className="basket-count">{totalItems}</span>
        </NavLink>
      </nav>
    </header>
  )
}

export default Navbar
