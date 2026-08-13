export const catalogApiUrl = import.meta.env.VITE_CATALOG_API_URL

function ensureCatalogApiUrl() {
  if (!catalogApiUrl) {
    throw new Error('No esta configurada la URL de Catalog.API.')
  }
}

function createCatalogUrl(path) {
  const normalizedBase = catalogApiUrl.endsWith('/') ? catalogApiUrl.slice(0, -1) : catalogApiUrl
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${normalizedBase}${normalizedPath}`

  return catalogApiUrl.startsWith('http') ? new URL(url) : new URL(url, window.location.origin)
}

async function readJsonResponse(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  return JSON.parse(text)
}

function normalizeProductRequest(product) {
  return {
    name: product.name?.trim(),
    description: (product.description ?? product.descripcion ?? '').trim(),
    category: Array.isArray(product.category) ? product.category : [],
    imagesFiles: product.imageFiles?.trim() ?? '',
    price: Number(product.price),
  }
}

async function requestCatalog(url, options = {}, connectionMessage = 'No se pudo conectar con Catalog.API.') {
  let response

  try {
    response = await fetch(url, options)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    throw new Error(`${connectionMessage} Verifica que ${catalogApiUrl || 'Catalog.API'} este disponible.`)
  }

  return response
}

export async function getProducts(
  {
    pageIndex = 1,
    pageSize = 10,
    name = '',
  } = {},
  signal,
) {
  ensureCatalogApiUrl()

  const url = createCatalogUrl('/products')
  url.searchParams.set('pageIndex', pageIndex)
  url.searchParams.set('pageSize', pageSize)

  if (name.trim()) {
    url.searchParams.set('name', name.trim())
  }

  const response = await requestCatalog(url, { signal }, 'No se pudo conectar con Catalog.API.')

  if (!response.ok) {
    throw new Error(`Catalog.API respondio con el codigo ${response.status}.`)
  }

  return readJsonResponse(response)
}

export async function getProductById(productId, signal) {
  ensureCatalogApiUrl()

  const data = await getProducts({ pageIndex: 1, pageSize: 1000 }, signal)
  const products = Array.isArray(data?.data) ? data.data : []
  const product = products.find((item) => item.id === productId)

  if (!product) {
    throw new Error('No se encontro el producto solicitado.')
  }

  return product
}

export async function createProduct(product) {
  ensureCatalogApiUrl()

  const url = createCatalogUrl('/products')
  const response = await requestCatalog(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizeProductRequest(product)),
    },
    'No se pudo crear el producto.',
  )

  if (!response.ok) {
    throw new Error(`No se pudo crear el producto. Catalog.API respondio con el codigo ${response.status}.`)
  }

  return readJsonResponse(response)
}

export async function updateProduct(productId, product) {
  ensureCatalogApiUrl()

  const url = createCatalogUrl(`/products/${encodeURIComponent(productId)}`)
  const response = await requestCatalog(
    url,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizeProductRequest(product)),
    },
    'No se pudo actualizar el producto.',
  )

  if (!response.ok) {
    throw new Error(`No se pudo actualizar el producto. Catalog.API respondio con el codigo ${response.status}.`)
  }

  return readJsonResponse(response)
}

export async function deleteProduct(productId) {
  ensureCatalogApiUrl()

  const url = createCatalogUrl(`/products/${encodeURIComponent(productId)}`)
  const response = await requestCatalog(
    url,
    {
      method: 'DELETE',
    },
    'No se pudo eliminar el producto.',
  )

  if (!response.ok) {
    throw new Error(`No se pudo eliminar el producto. Catalog.API respondio con el codigo ${response.status}.`)
  }

  return readJsonResponse(response)
}
