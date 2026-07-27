import { useRef, useState } from 'react'
import { useBasket } from '../../hooks/useBasket'
import { formatCurrency } from '../../utils/currency'

function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false)
  const isAddingRef = useRef(false)
  const { addProduct, isSaving } = useBasket()
  const hasImage = product.imageFiles && !imageFailed
  const categories = Array.isArray(product.category) ? product.category : []

  const handleAddToBasket = async () => {
    if (isAddingRef.current || isSaving) {
      return
    }

    isAddingRef.current = true

    try {
      await addProduct(product)
    } finally {
      isAddingRef.current = false
    }
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {hasImage ? (
          <img
            src={product.imageFiles}
            alt={product.name}
            className="product-image"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="image-placeholder" aria-label="Imagen no disponible">
            Sin imagen
          </div>
        )}
      </div>

      <div className="product-content">
        <div>
          <h2>{product.name}</h2>
          <p className="product-description">{product.descripcion || 'Sin descripcion disponible.'}</p>
        </div>

        <div className="category-list" aria-label="Categorias">
          {categories.length > 0 ? (
            categories.map((category) => <span key={category}>{category}</span>)
          ) : (
            <span>Sin categoria</span>
          )}
        </div>

        <div className="product-footer">
          <strong className="product-price">{formatCurrency(product.price)}</strong>
          <button type="button" onClick={handleAddToBasket} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
