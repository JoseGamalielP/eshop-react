import { useState } from 'react'
import { Link } from 'react-router-dom'
import BasketItem from '../components/basket/BasketItem'
import BasketSummary from '../components/basket/BasketSummary'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingMessage from '../components/common/LoadingMessage'
import { useBasket } from '../hooks/useBasket'
import { createOrder } from '../services/orderService'
import { formatCurrency } from '../utils/currency'

const TAX_RATE = 0.18

function createIdempotencyKey() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function BasketPage() {
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutOrder, setCheckoutOrder] = useState(null)
  const [checkoutKey, setCheckoutKey] = useState('')
  const [isReviewingPurchase, setIsReviewingPurchase] = useState(false)
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
  const subtotal = items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0)
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const totalPrice = subtotal + tax

  const handleClearBasket = async () => {
    const confirmed = window.confirm('Deseas vaciar todo el carrito?')

    if (confirmed) {
      await clearBasket()
    }
  }

  const handleReviewPurchase = () => {
    setCheckoutError('')
    setCheckoutOrder(null)
    setIsReviewingPurchase(true)
  }

  const handleCancelReview = () => {
    setIsReviewingPurchase(false)
    setCheckoutKey('')
  }

  const handleConfirmCheckout = async () => {
    if (isCheckingOut || items.length === 0) {
      return
    }

    const idempotencyKey = checkoutKey || createIdempotencyKey()
    setCheckoutKey(idempotencyKey)
    setIsCheckingOut(true)
    setCheckoutError('')

    try {
      const order = await createOrder({
        customerId: cart.userName,
        basketId: cart.userName,
        customerName: cart.userName,
        idempotencyKey,
      })

      setCheckoutOrder(order)
      setCheckoutKey('')
      setIsReviewingPurchase(false)
      await clearBasket()
    } catch (err) {
      setCheckoutError(err.message)
    } finally {
      setIsCheckingOut(false)
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
      {checkoutError && <ErrorMessage message={checkoutError} />}

      {isReviewingPurchase && items.length > 0 && (
        <section className="checkout-review-card">
          <div>
            <p className="eyebrow">Revision de compra</p>
            <h2>Confirma tu orden</h2>
            <p>Revisa productos, cantidades y total antes de generar la orden de compra.</p>
          </div>

          <div className="order-items-list">
            {items.map((item) => (
              <article key={item.productId} className="order-item-row">
                <span>{item.productName}</span>
                <span>{item.quantity} x {formatCurrency(item.price)}</span>
                <strong>{formatCurrency(Number(item.price) * Number(item.quantity))}</strong>
              </article>
            ))}
          </div>

          <div className="order-meta-grid">
            <span>Cliente: {cart.userName}</span>
            <span>Productos: {totalItems}</span>
            <span>Subtotal: {formatCurrency(subtotal)}</span>
            <span>IVA: {formatCurrency(tax)}</span>
            <strong>Total: {formatCurrency(totalPrice)}</strong>
          </div>

          <div className="checkout-review-actions">
            <button type="button" onClick={handleConfirmCheckout} disabled={isCheckingOut || isSaving}>
              {isCheckingOut ? 'Generando orden...' : 'Confirmar compra'}
            </button>
            <button type="button" className="secondary-button" onClick={handleCancelReview} disabled={isCheckingOut}>
              Seguir editando carrito
            </button>
          </div>
        </section>
      )}

      {checkoutOrder && (
        <section className="order-confirmation">
          <div>
            <p className="eyebrow">Orders.API</p>
            <h2>Orden creada correctamente</h2>
            <p>Orden {checkoutOrder.id}</p>
          </div>
          <div className="order-meta-grid">
            <span>Cliente: {checkoutOrder.customerName || checkoutOrder.customerId}</span>
            <span>Fecha: {new Date(checkoutOrder.createdAt).toLocaleString()}</span>
            <span>Estado: {checkoutOrder.status}</span>
            <span>Subtotal: {formatCurrency(checkoutOrder.subtotal)}</span>
            <span>Impuestos: {formatCurrency(checkoutOrder.tax)}</span>
            <strong>Total: {formatCurrency(checkoutOrder.total)}</strong>
          </div>
          <div className="order-items-list">
            {checkoutOrder.items?.map((item) => (
              <article key={item.productId} className="order-item-row">
                <span>{item.productName}</span>
                <span>{item.quantity} x {formatCurrency(item.unitPrice)}</span>
                <strong>{formatCurrency(item.lineTotal)}</strong>
              </article>
            ))}
          </div>
          <Link className="primary-link" to="/orders">
            Ir a Ordenes para confirmar
          </Link>
        </section>
      )}

      {!isLoading && items.length === 0 && (
        <div className="basket-empty-card">
          <h2>No hay productos agregados</h2>
          <p>Agrega productos desde el catalogo para verlos en esta seccion.</p>
          <div className="basket-total-preview">
            <span>Subtotal: {formatCurrency(0)}</span>
            <span>IVA: {formatCurrency(0)}</span>
            <strong>Total: {formatCurrency(0)}</strong>
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
            subtotal={subtotal}
            tax={tax}
            totalPrice={totalPrice}
            isSaving={isSaving}
            isCheckingOut={isCheckingOut}
            onClear={handleClearBasket}
            onReviewPurchase={handleReviewPurchase}
          />
        </div>
      )}
    </section>
  )
}

export default BasketPage
