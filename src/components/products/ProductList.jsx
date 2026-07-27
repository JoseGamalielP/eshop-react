import ProductCard from './ProductCard'

function ProductList({ products }) {
  if (!products.length) {
    return <p className="empty-message">No existen productos para mostrar.</p>
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductList
