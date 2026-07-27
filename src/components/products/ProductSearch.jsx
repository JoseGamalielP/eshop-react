function ProductSearch({
  searchText,
  pageSize,
  isLoading,
  hasActiveSearch,
  onSearchTextChange,
  onSearch,
  onClear,
  onPageSizeChange,
}) {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <form className="product-toolbar" onSubmit={handleSubmit}>
      <div className="search-field">
        <label htmlFor="product-search">Buscar producto</label>
        <input
          id="product-search"
          type="search"
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
          placeholder="Buscar productos por nombre"
          disabled={isLoading}
        />
      </div>

      <div className="toolbar-actions">
        <button type="submit" disabled={isLoading}>
          Buscar
        </button>
        <button type="button" className="secondary-button" onClick={onClear} disabled={isLoading || (!searchText && !hasActiveSearch)}>
          Limpiar
        </button>
      </div>

      <div className="page-size-field">
        <label htmlFor="page-size">Productos por pagina</label>
        <select id="page-size" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
      </div>
    </form>
  )
}

export default ProductSearch
