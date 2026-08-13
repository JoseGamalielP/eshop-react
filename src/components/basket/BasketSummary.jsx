import { formatCurrency } from '../../utils/currency'

function BasketSummary({ totalItems, totalPrice, isSaving, isCheckingOut, onClear, onReviewPurchase }) {
  return (
    <aside className="basket-summary">
      <h2>Resumen</h2>
      <div className="summary-row">
        <span>Articulos</span>
        <strong>{totalItems}</strong>
      </div>
      <div className="summary-row total-row">
        <span>Total</span>
        <strong>{formatCurrency(totalPrice)}</strong>
      </div>
      <button type="button" className="full-width" onClick={onReviewPurchase} disabled={isSaving || isCheckingOut || totalItems === 0}>
        Realizar compra
      </button>
      <button type="button" className="danger-button full-width" onClick={onClear} disabled={isSaving || totalItems === 0}>
        Vaciar carrito
      </button>
    </aside>
  )
}

export default BasketSummary
