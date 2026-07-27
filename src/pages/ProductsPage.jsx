import { useEffect, useState } from 'react'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingMessage from '../components/common/LoadingMessage'
import ProductList from '../components/products/ProductList'
import ProductPagination from '../components/products/ProductPagination'
import ProductSearch from '../components/products/ProductSearch'
import { getProducts } from '../services/catalogService'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
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
  const firstVisibleProduct = totalCount === 0 ? 0 : (pageIndex - 1) * pageSize + 1
  const lastVisibleProduct = Math.min(pageIndex * pageSize, totalCount)
  const canGoPrevious = pageIndex > 1
  const canGoNext = pageIndex < totalPages && products.length === pageSize

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

  const handleRetry = () => {
    setReloadKey((currentReloadKey) => currentReloadKey + 1)
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="eyebrow">Catalog.API</p>
        <h1>Productos</h1>
        <p>Busca productos por nombre y navega por los resultados del catalogo.</p>
      </div>

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

      <div className="results-info">
        {totalCount > 0 ? (
          <span>
            Mostrando {firstVisibleProduct}-{lastVisibleProduct} de {totalCount} productos
          </span>
        ) : (
          <span>{appliedSearch ? `No se encontraron productos para "${appliedSearch}".` : 'No hay productos disponibles.'}</span>
        )}
      </div>

      {isLoading && <LoadingMessage message="Consultando productos..." />}
      {error && (
        <div className="error-panel">
          <ErrorMessage message={error} />
          <button type="button" className="secondary-button" onClick={handleRetry}>
            Reintentar
          </button>
        </div>
      )}

      {!error && products.length > 0 && <ProductList products={products} />}

      {!isLoading && !error && products.length === 0 && (
        <div className="empty-message empty-results">
          <p>{appliedSearch ? `No se encontraron productos para "${appliedSearch}".` : 'No hay productos disponibles.'}</p>
          {appliedSearch && (
            <button type="button" className="secondary-button" onClick={handleClearSearch}>
              Limpiar busqueda
            </button>
          )}
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

export default ProductsPage
