export const ordersApiUrl = import.meta.env.VITE_ORDERS_API_URL

function ensureOrdersApiUrl() {
  if (!ordersApiUrl) {
    throw new Error('No esta configurada la URL de Orders.API.')
  }
}

async function readJsonResponse(response) {
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

function createErrorMessage(status, body, fallback) {
  return body?.message || body?.detail || `${fallback} Orders.API respondio con el codigo ${status}.`
}

function normalizeOrderStatus(status) {
  if (status === 0) {
    return 'Pending'
  }

  if (status === 1) {
    return 'Confirmed'
  }

  if (status === 2) {
    return 'Cancelled'
  }

  return status
}

function normalizeOrder(order) {
  if (!order) {
    return order
  }

  return {
    ...order,
    status: normalizeOrderStatus(order.status),
  }
}

export async function createOrder({ customerId, basketId, customerName, idempotencyKey }) {
  ensureOrdersApiUrl()

  let response
  try {
    response = await fetch(`${ordersApiUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ customerId, basketId, customerName }),
    })
  } catch {
    throw new Error('No se pudo conectar con Orders.API. Verifica la URL configurada.')
  }

  const body = await readJsonResponse(response).catch(() => null)

  if (!response.ok) {
    throw new Error(createErrorMessage(response.status, body, 'No se pudo crear la orden.'))
  }

  return normalizeOrder(body)
}

export async function getOrders() {
  ensureOrdersApiUrl()

  let response
  try {
    response = await fetch(`${ordersApiUrl}/api/orders`)
  } catch {
    throw new Error('No se pudo consultar el listado de ordenes.')
  }

  const body = await readJsonResponse(response).catch(() => null)

  if (!response.ok) {
    throw new Error(createErrorMessage(response.status, body, 'No se pudieron consultar las ordenes.'))
  }

  return Array.isArray(body) ? body.map(normalizeOrder) : []
}

export async function getOrdersByCustomer(customerId) {
  ensureOrdersApiUrl()

  let response
  try {
    response = await fetch(`${ordersApiUrl}/api/orders/customer/${encodeURIComponent(customerId)}`)
  } catch {
    throw new Error('No se pudo consultar el historial de ordenes.')
  }

  const body = await readJsonResponse(response).catch(() => null)

  if (!response.ok) {
    throw new Error(createErrorMessage(response.status, body, 'No se pudieron consultar las ordenes.'))
  }

  return Array.isArray(body) ? body.map(normalizeOrder) : []
}

export async function getOrderById(orderId) {
  ensureOrdersApiUrl()

  let response
  try {
    response = await fetch(`${ordersApiUrl}/api/orders/${encodeURIComponent(orderId)}`)
  } catch {
    throw new Error('No se pudo consultar la orden.')
  }

  const body = await readJsonResponse(response).catch(() => null)

  if (!response.ok) {
    throw new Error(createErrorMessage(response.status, body, 'No se pudo consultar la orden.'))
  }

  return normalizeOrder(body)
}

export async function changeOrderStatus(orderId, status) {
  ensureOrdersApiUrl()

  let response
  try {
    response = await fetch(`${ordersApiUrl}/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
  } catch {
    throw new Error('No se pudo cambiar el estado de la orden.')
  }

  const body = await readJsonResponse(response).catch(() => null)

  if (!response.ok) {
    throw new Error(createErrorMessage(response.status, body, 'No se pudo cambiar el estado de la orden.'))
  }

  return normalizeOrder(body)
}

export async function downloadOrderPdf(orderId) {
  ensureOrdersApiUrl()

  let response
  try {
    response = await fetch(`${ordersApiUrl}/api/orders/${encodeURIComponent(orderId)}/pdf`)
  } catch {
    throw new Error('No se pudo conectar con Orders.API para generar el PDF.')
  }

  if (!response.ok) {
    const body = await readJsonResponse(response).catch(() => null)
    throw new Error(createErrorMessage(response.status, body, 'No se pudo generar el PDF.'))
  }

  const blob = await response.blob()
  if (blob.type && blob.type !== 'application/pdf') {
    throw new Error('Orders.API no devolvio un archivo PDF valido.')
  }

  return blob
}
