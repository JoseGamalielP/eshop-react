export const basketApiUrl = import.meta.env.VITE_BASKET_API_URL

function ensureBasketApiUrl() {
  if (!basketApiUrl) {
    throw new Error('No esta configurada la URL de Basket.API.')
  }
}

async function readJsonResponse(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  return JSON.parse(text)
}

function createEmptyBasket(userName) {
  return {
    userName,
    items: [],
    totalPrice: 0,
  }
}

export async function getBasket(userName) {
  ensureBasketApiUrl()

  let response

  try {
    response = await fetch(`${basketApiUrl}/basket/${encodeURIComponent(userName)}`)
  } catch {
    throw new Error('No se pudo conectar con Basket.API. Verifica que http://localhost:6001 este disponible.')
  }

  if (response.status === 404) {
    return createEmptyBasket(userName)
  }

  if (!response.ok) {
    throw new Error(`Basket.API respondio con el codigo ${response.status} al consultar el carrito.`)
  }

  const data = await readJsonResponse(response)
  const cart = data?.cart ?? data ?? createEmptyBasket(userName)

  return {
    userName: cart.userName ?? userName,
    items: Array.isArray(cart.items) ? cart.items : [],
    totalPrice: Number(cart.totalPrice ?? 0),
  }
}

export async function storeBasket(cart) {
  ensureBasketApiUrl()

  let response

  try {
    response = await fetch(`${basketApiUrl}/basket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cart }),
    })
  } catch {
    throw new Error('No se pudo guardar el carrito. Verifica la conexion con Basket.API.')
  }

  if (!response.ok) {
    const errorBody = await readJsonResponse(response).catch(() => null)
    const detail = errorBody?.detail ? ` ${errorBody.detail}` : ''
    throw new Error(`Basket.API respondio con el codigo ${response.status} al guardar el carrito.${detail}`)
  }

  return readJsonResponse(response)
}

export async function deleteBasket(userName) {
  ensureBasketApiUrl()

  let response

  try {
    response = await fetch(`${basketApiUrl}/basket/${encodeURIComponent(userName)}`, {
      method: 'DELETE',
    })
  } catch {
    throw new Error('No se pudo eliminar el carrito. Verifica la conexion con Basket.API.')
  }

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Basket.API respondio con el codigo ${response.status} al eliminar el carrito.`)
  }

  return readJsonResponse(response)
}
