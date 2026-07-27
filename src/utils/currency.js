export const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0)
}
