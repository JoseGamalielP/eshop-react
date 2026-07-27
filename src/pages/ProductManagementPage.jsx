import { useEffect, useState } from 'react'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingMessage from '../components/common/LoadingMessage'
import ProductForm from '../components/products/ProductForm'
import ProductPagination from '../components/products/ProductPagination'
import ProductSearch from '../components/products/ProductSearch'
import { createProduct, deleteProduct, getProducts, updateProduct } from '../services/catalogService'
import { formatCurrency } from '../utils/currency'

function ProductManagementPage() {
  const [products, setProducts] = useState([])
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        setIsLoading(true)
        setError('')

        const data = await getProducts(
          {
            pageIndex,
            pageSize,
            name: appliedSearch,
          },
          controller.signal,
        )

        setProducts(Array.isArray(data?.data) ? data.data : [])
        setTotalCount(Number(data?.count ?? 0))
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      controller.abort()
    }
  }, [pageIndex, pageSize, appliedSearch, reloadKey])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const canGoPrevious = pageIndex > 1
  const canGoNext = pageIndex < totalPages && products.length === pageSize

  const showNotice = (message, type = 'success') => {
    setNotice({ message, type })
  }

  const reloadProducts = () => {
    setReloadKey((currentReloadKey) => currentReloadKey + 1)
  }

  const handleSearch = () => {
    setAppliedSearch(searchText.trim())
    setPageIndex(1)
  }

  const handleClearSearch = () => {
    setSearchText('')
    setAppliedSearch('')
    setPageIndex(1)
  }

  const handlePageSizeChange = (nextPageSize) => {
    setPageSize(nextPageSize)
    setPageIndex(1)
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setIsFormVisible(true)
    setNotice(null)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setIsFormVisible(true)
    setNotice(null)
  }

  const handleCancelForm = () => {
    setEditingProduct(null)
    setIsFormVisible(false)
  }

  const handleSubmitProduct = async (product) => {
    setIsSubmitting(true)
    setNotice(null)

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.name, product)
        showNotice('Producto actualizado correctamente.')
      } else {
        await createProduct(product)
        showNotice('Producto creado correctamente.')
      }

      setEditingProduct(null)
      setIsFormVisible(false)
      reloadProducts()
    } catch (err) {
      showNotice(editingProduct ? 'No se pudo actualizar el producto.' : 'No se pudo crear el producto.', 'error')
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(`Deseas eliminar "${product.name}"?`)

    if (!confirmed) {
      return
    }

    setIsSubmitting(true)
    setNotice(null)

    try {
      await deleteProduct(product.name)
      showNotice('Producto eliminado correctamente.')

      if (products.length === 1 && pageIndex > 1) {
        setPageIndex((currentPageIndex) => Math.max(1, currentPageIndex - 1))
      } else {
        reloadProducts()
      }
    } catch (err) {
      showNotice('No se pudo eliminar el producto.', 'error')
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section product-management-page">
      <div className="page-heading management-heading">
        <div>
          <p className="eyebrow">Catalog.API</p>
          <h1>Administrar productos</h1>
          <p>Crea, edita y elimina productos sin recargar el navegador.</p>
        </div>
        <button type="button" className="new-product-button" onClick={handleNewProduct} disabled={isSubmitting}>
          Nuevo producto
        </button>
      </div>

      {notice && <div className={`management-notice management-notice-${notice.type}`}>{notice.message}</div>}

      {isFormVisible && (
        <ProductForm
          product={editingProduct}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitProduct}
          onCancel={handleCancelForm}
        />
      )}

      <ProductSearch
        searchText={searchText}
        pageSize={pageSize}
        isLoading={isLoading}
        hasActiveSearch={Boolean(appliedSearch)}
        onSearchTextChange={setSearchText}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        onPageSizeChange={handlePageSizeChange}
      />

      {appliedSearch && <p className="results-search-label">Resultados para "{appliedSearch}"</p>}

      {isLoading && <LoadingMessage message="Consultando productos..." />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && products.length === 0 && (
        <div className="empty-message empty-results">
          <p>{appliedSearch ? `No se encontraron productos para "${appliedSearch}".` : 'No hay productos disponibles.'}</p>
        </div>
      )}

      {!error && products.length > 0 && (
        <div className="management-table-wrap">
          <table className="management-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categorias</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <span>{product.descripcion || 'Sin descripcion.'}</span>
                  </td>
                  <td>{Array.isArray(product.category) && product.category.length ? product.category.join(', ') : 'Sin categoria'}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>
                    <div className="record-actions">
                      <button type="button" className="secondary-button" onClick={() => handleEditProduct(product)} disabled={isSubmitting}>
                        Editar
                      </button>
                      <button type="button" className="danger-button" onClick={() => handleDeleteProduct(product)} disabled={isSubmitting}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductPagination
        pageIndex={pageIndex}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isLoading={isLoading}
        onPrevious={() => setPageIndex((currentPageIndex) => Math.max(1, currentPageIndex - 1))}
        onNext={() => setPageIndex((currentPageIndex) => currentPageIndex + 1)}
      />
    </section>
  )
}

export default ProductManagementPage
