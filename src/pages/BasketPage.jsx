import BasketItem from '../components/basket/BasketItem'
import BasketSummary from '../components/basket/BasketSummary'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingMessage from '../components/common/LoadingMessage'
import { useBasket } from '../hooks/useBasket'

function BasketPage() {
  const {
    cart,
    isLoading,
    isSaving,
    error,
    increaseQuantity,
    decreaseQuantity,
    removeProduct,
    clearBasket,
    totalItems,
  } = useBasket()
  const items = Array.isArray(cart.items) ? cart.items : []
  const fallbackTotal = items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0)
  const totalPrice = Number(cart.totalPrice ?? fallbackTotal)

  const handleClearBasket = async () => {
    const confirmed = window.confirm('Deseas vaciar todo el carrito?')

    if (confirmed) {
      await clearBasket()
    }
  }

  return (
    <section className="page-section basket-page">
      <div className="page-heading">
        <p className="eyebrow">Basket.API</p>
        <h1>Carrito</h1>
        <p>Administra los productos guardados para el usuario temporal.</p>
      </div>

      {isLoading && <LoadingMessage message="Consultando carrito..." />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && items.length === 0 && (
        <div className="basket-empty-card">
          <h2>No hay productos agregados</h2>
          <p>Agrega productos desde el catalogo para verlos en esta seccion.</p>
          <div className="basket-total-preview">
            <span>Total estimado</span>
            <strong>$0.00</strong>
          </div>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="basket-layout">
          <div className="basket-list">
            {items.map((item) => (
              <BasketItem
                key={item.productId}
                item={item}
                isSaving={isSaving}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeProduct}
              />
            ))}
          </div>

          <BasketSummary
            totalItems={totalItems}
            totalPrice={totalPrice}
            isSaving={isSaving}
            onClear={handleClearBasket}
          />
        </div>
      )}
    </section>
  )
}

export default BasketPage
