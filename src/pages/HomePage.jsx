import { Link } from 'react-router-dom'
import { basketApiUrl } from '../services/basketService'
import { catalogApiUrl } from '../services/catalogService'

function HomePage() {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">Frontend React para microservicios .NET</p>
        <h1>Catalogo y carrito para eShop</h1>
        <p>
          Esta aplicacion consume las APIs existentes de Catalog y Basket usando Vite,
          React Router y servicios JavaScript separados.
        </p>
        <Link className="primary-link" to="/products">
          Ver productos
        </Link>
      </div>
      <div className="hero-panel">
        <span>Catalog.API</span>
        <strong>{catalogApiUrl}</strong>
        <span>Basket.API</span>
        <strong>{basketApiUrl}</strong>
      </div>
    </section>
  )
}

export default HomePage
