import { formatCurrency } from '../../utils/currency'

function BasketItem({ item, isSaving, onIncrease, onDecrease, onRemove }) {
  const subtotal = Number(item.price) * Number(item.quantity)

  return (
    <article className="basket-item">
      <div className="basket-item-info">
        <h2>{item.productName}</h2>
        {item.color && <p>Color: {item.color}</p>}
        <span>Precio unitario: {formatCurrency(item.price)}</span>
      </div>

      <div className="quantity-controls" aria-label={`Cantidad de ${item.productName}`}>
        <button type="button" onClick={() => onDecrease(item.productId)} disabled={isSaving}>
          -
        </button>
        <strong>{item.quantity}</strong>
        <button type="button" onClick={() => onIncrease(item.productId)} disabled={isSaving}>
          +
        </button>
      </div>

      <strong className="basket-item-subtotal">{formatCurrency(subtotal)}</strong>

      <button type="button" className="danger-button" onClick={() => onRemove(item.productId)} disabled={isSaving}>
        Eliminar
      </button>
    </article>
  )
}

export default BasketItem
