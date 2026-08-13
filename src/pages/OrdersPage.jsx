import { useEffect, useMemo, useState } from 'react'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingMessage from '../components/common/LoadingMessage'
import {
  changeOrderStatus,
  downloadOrderPdf,
  getOrders,
} from '../services/orderService'
import { formatCurrency } from '../utils/currency'

const statusLabels = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  Cancelled: 'Cancelada',
}

function getStatusLabel(status) {
  return statusLabels[status] || status
}

/**
 * Obtiene el username visible de la orden.
 *
 * Idealmente el backend debe devolver:
 * {
 *   username: "scooby"
 * }
 *
 * Se permite customerName como compatibilidad temporal,
 * pero NUNCA usamos customerId para la búsqueda por usuario.
 */
function getOrderUsername(order) {
  return order?.username || order?.customerName || ''
}

/**
 * ID corto solamente para presentación.
 * El ID completo se conserva en title y para todas las llamadas al backend.
 */
function getShortOrderId(id) {
  if (!id) {
    return ''
  }

  if (id.length <= 14) {
    return id
  }

  return `${id.slice(0, 14)}…`
}

function formatOrderDate(date) {
  if (!date) {
    return 'Fecha no disponible'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Fecha no disponible'
  }

  return parsedDate.toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState('')

  const [orderFilter, setOrderFilter] = useState('')
  const [usernameFilter, setUsernameFilter] = useState('')
  const [sortDirection, setSortDirection] = useState('desc')

  const [isLoading, setIsLoading] = useState(true)
  const [actionOrderId, setActionOrderId] = useState('')
  const [pdfOrderId, setPdfOrderId] = useState('')

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      setError('')

      const data = await getOrders()

      setOrders(Array.isArray(data) ? data : [])

      // Si la orden seleccionada ya no existe, cerramos el detalle.
      setSelectedOrderId((currentId) => {
        if (!currentId) {
          return ''
        }

        const stillExists = data?.some((order) => order.id === currentId)

        return stillExists ? currentId : ''
      })
    } catch (err) {
      setError(err.message || 'No fue posible consultar las órdenes.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialOrders() {
      try {
        setIsLoading(true)
        setError('')

        const data = await getOrders()

        if (!ignore) {
          setOrders(Array.isArray(data) ? data : [])

          // No abrir automáticamente la primera orden.
          setSelectedOrderId('')
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'No fue posible consultar las órdenes.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadInitialOrders()

    return () => {
      ignore = true
    }
  }, [])

  const filteredOrders = useMemo(() => {
    const orderQuery = orderFilter.trim().toLowerCase()
    const usernameQuery = usernameFilter.trim().toLowerCase()

    return [...orders]
      .filter((order) => {
        const orderId = String(order.id || '').toLowerCase()

        const username = getOrderUsername(order)
          .trim()
          .toLowerCase()

        const matchesOrder =
          !orderQuery || orderId.includes(orderQuery)

        const matchesUsername =
          !usernameQuery || username.includes(usernameQuery)

        return matchesOrder && matchesUsername
      })
      .sort((a, b) => {
        const first = new Date(a.createdAt).getTime()
        const second = new Date(b.createdAt).getTime()

        return sortDirection === 'desc'
          ? second - first
          : first - second
      })
  }, [orders, orderFilter, usernameFilter, sortDirection])

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) || null

  const updateOrder = (updatedOrder) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    )

    setSelectedOrderId(updatedOrder.id)
  }

  const handleChangeStatus = async (order, status) => {
    if (!order || actionOrderId) {
      return
    }

    setActionOrderId(order.id)
    setError('')
    setNotice('')

    try {
      const updatedOrder = await changeOrderStatus(order.id, status)

      updateOrder(updatedOrder)

      setNotice(
        `La orden #${getShortOrderId(updatedOrder.id)} ahora está ${getStatusLabel(
          updatedOrder.status
        ).toLowerCase()}.`
      )
    } catch (err) {
      setError(err.message || 'No fue posible actualizar la orden.')
    } finally {
      setActionOrderId('')
    }
  }

  const handleDownloadPdf = async (order) => {
    if (!order || pdfOrderId) {
      return
    }

    setPdfOrderId(order.id)
    setError('')
    setNotice('')

    try {
      // El PDF viene de Orders.API.
      // React NO genera el contenido.
      const blob = await downloadOrderPdf(order.id)

      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `orden-${order.id}.pdf`

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)

      setNotice(
        `Comprobante de la orden #${getShortOrderId(
          order.id
        )} generado correctamente.`
      )
    } catch (err) {
      setError(err.message || 'No fue posible generar el PDF.')
    } finally {
      setPdfOrderId('')
    }
  }

  const clearFilters = () => {
    setOrderFilter('')
    setUsernameFilter('')
    setSortDirection('desc')
  }

  const openOrderDetail = (orderId) => {
    setSelectedOrderId(orderId)
  }

  const closeOrderDetail = () => {
    if (actionOrderId || pdfOrderId) {
      return
    }

    setSelectedOrderId('')
  }

  useEffect(() => {
    if (!selectedOrder) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeOrderDetail()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedOrder, actionOrderId, pdfOrderId])

  return (
    <section className="page-section orders-page">
      {/* ENCABEZADO */}
      <div className="page-heading orders-heading">
        <p className="eyebrow">Orders.API</p>

        <h1>Órdenes de compra</h1>

        <p>
          Consulta, confirma y descarga los comprobantes de las órdenes
          registradas.
        </p>
      </div>

      {/* MENSAJES */}
      {isLoading && (
        <LoadingMessage message="Consultando órdenes..." />
      )}

      {error && <ErrorMessage message={error} />}

      {notice && (
        <p className="management-notice management-notice-success">
          {notice}
        </p>
      )}

      {/* FILTROS */}
      <section className="orders-filter-panel">
        <label className="order-filter-field">
          <span>Buscar por orden</span>

          <input
            type="search"
            value={orderFilter}
            onChange={(event) =>
              setOrderFilter(event.target.value)
            }
            placeholder="Ej. a82d14..."
            autoComplete="off"
          />
        </label>

        <label className="order-filter-field">
          <span>Buscar por usuario</span>

          <input
            type="search"
            value={usernameFilter}
            onChange={(event) =>
              setUsernameFilter(event.target.value)
            }
            placeholder="Ej. scooby"
            autoComplete="off"
          />
        </label>

        <label className="order-filter-field">
          <span>Ordenamiento</span>

          <select
            value={sortDirection}
            onChange={(event) =>
              setSortDirection(event.target.value)
            }
          >
            <option value="desc">Más recientes</option>
            <option value="asc">Más antiguas</option>
          </select>
        </label>

        <button
          type="button"
          className="secondary-button orders-clear-button"
          onClick={clearFilters}
        >
          Limpiar filtros
        </button>
      </section>

      {!isLoading && filteredOrders.length === 0 && (
        <div className="orders-empty-state">
          <h3>No encontramos órdenes</h3>

          <p>
            Intenta cambiar el número de orden o el username.
          </p>

          {(orderFilter || usernameFilter) && (
            <button
              type="button"
              className="secondary-button"
              onClick={clearFilters}
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}

      {/* LISTA DE ÓRDENES */}
      <div className="orders-list orders-list-modern">
        {filteredOrders.map((order) => {
          const username = getOrderUsername(order)

          const isSelected =
            selectedOrder?.id === order.id

          return (
            <article
              key={order.id}
              className={`order-card ${
                isSelected ? 'order-card-selected' : ''
              }`}
            >
              <div className="order-card-top">
                <div className="order-card-identity">
                  <span className="order-card-label">
                    Orden
                  </span>

                  <h2
                    className="order-id"
                    title={order.id}
                  >
                    #{getShortOrderId(order.id)}
                  </h2>

                  <p className="order-date">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>

                <span
                  className={`status-badge status-${String(
                    order.status
                  ).toLowerCase()}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="order-card-summary">
                <div className="order-summary-item">
                  <span>Usuario</span>

                  <strong
                    className="order-username"
                    title={username || undefined}
                  >
                    {username || 'Sin username'}
                  </strong>
                </div>

                <div className="order-summary-item">
                  <span>Productos</span>

                  <strong>
                    {order.items?.length ?? 0}
                  </strong>
                </div>

                <div className="order-summary-item">
                  <span>Subtotal</span>

                  <strong>
                    {formatCurrency(order.subtotal)}
                  </strong>
                </div>

                <div className="order-summary-item">
                  <span>Impuestos</span>

                  <strong>
                    {formatCurrency(order.tax)}
                  </strong>
                </div>
              </div>

              <div className="order-card-total">
                <span>Total</span>

                <strong>
                  {formatCurrency(order.total)}
                </strong>
              </div>

              <div className="order-card-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => openOrderDetail(order.id)}
                >
                  Ver opciones
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* MODAL DE OPCIONES DE ORDEN */}
      {selectedOrder && (
        <div
          className="order-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeOrderDetail()
            }
          }}
        >
          <section
            className="order-detail-card order-detail-featured order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
          >
          <div className="order-detail-topbar">
            <div className="order-detail-heading">
              <p className="eyebrow">
                Detalle de la orden
              </p>

              <h2
                id="order-modal-title"
                className="order-detail-id"
                title={selectedOrder.id}
              >
                #{getShortOrderId(selectedOrder.id)}
              </h2>

              <p>
                {formatOrderDate(
                  selectedOrder.createdAt
                )}
              </p>
            </div>

            <div className="order-detail-top-actions">
              <span
                className={`status-badge status-${String(
                  selectedOrder.status
                ).toLowerCase()}`}
              >
                {getStatusLabel(
                  selectedOrder.status
                )}
              </span>

              <button
                type="button"
                className="order-detail-close"
                onClick={closeOrderDetail}
                disabled={Boolean(actionOrderId || pdfOrderId)}
                aria-label="Cerrar detalle de la orden"
                title="Cerrar detalle"
              >
                ×
              </button>
            </div>
          </div>

          {/* DATOS PRINCIPALES */}
          <div className="order-detail-summary">
            <div>
              <span>Usuario</span>

              <strong>
                {getOrderUsername(selectedOrder) ||
                  'Sin username'}
              </strong>
            </div>

            <div>
              <span>Productos</span>

              <strong>
                {selectedOrder.items?.length ?? 0}
              </strong>
            </div>

            <div>
              <span>Subtotal</span>

              <strong>
                {formatCurrency(
                  selectedOrder.subtotal
                )}
              </strong>
            </div>

            <div>
              <span>Impuestos</span>

              <strong>
                {formatCurrency(selectedOrder.tax)}
              </strong>
            </div>

            <div className="order-detail-total">
              <span>Total</span>

              <strong>
                {formatCurrency(selectedOrder.total)}
              </strong>
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="order-detail-products">
            <div className="order-detail-section-heading">
              <div>
                <h3>Productos</h3>

                <p>
                  Artículos incluidos en esta orden.
                </p>
              </div>
            </div>

            <div className="order-items-list">
              {selectedOrder.items?.length > 0 ? (
                selectedOrder.items.map(
                  (item, index) => (
                    <article
                      key={`${item.productId}-${index}`}
                      className="order-item-row"
                    >
                      <div className="order-item-info">
                        <strong
                          title={item.productName}
                        >
                          {item.productName}
                        </strong>

                        <span>
                          {item.quantity} ×{' '}
                          {formatCurrency(
                            item.unitPrice
                          )}
                        </span>
                      </div>

                      <strong className="order-item-total">
                        {formatCurrency(
                          item.lineTotal
                        )}
                      </strong>
                    </article>
                  )
                )
              ) : (
                <p className="empty-message">
                  Esta orden no contiene productos.
                </p>
              )}
            </div>
          </div>

          {/* ACCIONES DEL DETALLE */}
          <div className="order-status-actions">
            {selectedOrder.status === 'Pending' && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleChangeStatus(
                      selectedOrder,
                      'Confirmed'
                    )
                  }
                  disabled={
                    actionOrderId ===
                    selectedOrder.id
                  }
                >
                  {actionOrderId ===
                  selectedOrder.id
                    ? 'Confirmando...'
                    : 'Confirmar orden'}
                </button>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() =>
                    handleChangeStatus(
                      selectedOrder,
                      'Cancelled'
                    )
                  }
                  disabled={
                    actionOrderId ===
                    selectedOrder.id
                  }
                >
                  {actionOrderId ===
                  selectedOrder.id
                    ? 'Procesando...'
                    : 'Cancelar orden'}
                </button>

                <p className="order-state-note">
                  Confirma la orden para poder
                  generar el comprobante PDF.
                </p>
              </>
            )}

            {selectedOrder.status ===
              'Confirmed' && (
              <button
                type="button"
                onClick={() =>
                  handleDownloadPdf(selectedOrder)
                }
                disabled={
                  pdfOrderId === selectedOrder.id
                }
              >
                {pdfOrderId === selectedOrder.id
                  ? 'Generando PDF...'
                  : 'Generar PDF'}
              </button>
            )}

            {selectedOrder.status ===
              'Cancelled' && (
              <p className="order-state-note">
                Esta orden fue cancelada y ya no
                puede confirmarse.
              </p>
            )}
          </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default OrdersPage
