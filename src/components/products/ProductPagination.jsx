function ProductPagination({ pageIndex, canGoPrevious, canGoNext, isLoading, onPrevious, onNext }) {
  return (
    <nav className="pagination-controls" aria-label="Paginacion de productos">
      <button type="button" className="secondary-button" onClick={onPrevious} disabled={!canGoPrevious || isLoading}>
        Anterior
      </button>
      <span aria-live="polite">Pagina {pageIndex}</span>
      <button type="button" className="secondary-button" onClick={onNext} disabled={!canGoNext || isLoading}>
        Siguiente
      </button>
    </nav>
  )
}

export default ProductPagination
