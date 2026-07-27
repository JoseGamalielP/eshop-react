import { useEffect, useState } from 'react'

function getInitialFormState(product) {
  return {
    name: product?.name ?? '',
    description: product?.description ?? product?.descripcion ?? '',
    categories: Array.isArray(product?.category) ? product.category.join(', ') : '',
    imageFiles: product?.imageFiles ?? '',
    price: product?.price?.toString() ?? '',
  }
}

function parseCategories(value) {
  const categories = value
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean)

  return [...new Set(categories)]
}

function ProductForm({ product, isSubmitting, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(() => getInitialFormState(product))
  const [errors, setErrors] = useState({})
  const isEditing = Boolean(product)

  useEffect(() => {
    setFormData(getInitialFormState(product))
    setErrors({})
  }, [product])

  const updateField = (field, value) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  const validate = () => {
    const nextErrors = {}
    const categories = parseCategories(formData.categories)
    const price = Number(formData.price)

    if (!formData.name.trim()) {
      nextErrors.name = 'El nombre es obligatorio.'
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'La descripcion es obligatoria.'
    }

    if (categories.length === 0) {
      nextErrors.categories = 'Agrega al menos una categoria.'
    }

    if (!Number.isFinite(price)) {
      nextErrors.price = 'El precio debe ser numerico.'
    } else if (price <= 0) {
      nextErrors.price = 'El precio debe ser mayor que cero.'
    }

    setErrors(nextErrors)
    return { isValid: Object.keys(nextErrors).length === 0, categories, price }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const { isValid, categories, price } = validate()

    if (!isValid) {
      return
    }

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: categories,
      imageFiles: formData.imageFiles.trim(),
      price,
    })
  }

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading-row">
        <div>
          <h2>{isEditing ? 'Editar producto' : 'Nuevo producto'}</h2>
          <p>{isEditing ? 'Actualiza los datos del producto seleccionado.' : 'Completa los datos para crear un producto.'}</p>
        </div>
        <button type="button" className="secondary-button" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="product-name">Nombre</label>
          <input
            id="product-name"
            value={formData.name}
            onChange={(event) => updateField('name', event.target.value)}
            disabled={isSubmitting}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="product-price">Precio</label>
          <input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(event) => updateField('price', event.target.value)}
            disabled={isSubmitting}
          />
          {errors.price && <span className="field-error">{errors.price}</span>}
        </div>

        <div className="form-field form-field-wide">
          <label htmlFor="product-description">Descripcion</label>
          <textarea
            id="product-description"
            value={formData.description}
            onChange={(event) => updateField('description', event.target.value)}
            disabled={isSubmitting}
            rows="3"
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="product-categories">Categorias</label>
          <input
            id="product-categories"
            value={formData.categories}
            onChange={(event) => updateField('categories', event.target.value)}
            placeholder="Computadoras, Laptop, Tecnologia"
            disabled={isSubmitting}
          />
          {errors.categories && <span className="field-error">{errors.categories}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="product-image">URL o ruta de imagen</label>
          <input
            id="product-image"
            value={formData.imageFiles}
            onChange={(event) => updateField('imageFiles', event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar producto'}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
