import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="not-found-page">
      <p className="eyebrow">404</p>
      <h1>Pagina no encontrada</h1>
      <p>La ruta solicitada no existe en esta aplicacion.</p>
      <Link className="primary-link" to="/">
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFoundPage
