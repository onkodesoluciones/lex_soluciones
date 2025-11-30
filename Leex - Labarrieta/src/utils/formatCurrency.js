/**
 * Formatea un número como moneda argentina
 * Ejemplo: 100000.50 -> "$100.000,50"
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - String formateado con símbolo de peso
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0,00'
  }

  // Formatear con separadores de miles (punto) y decimales (coma)
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

  return formatted
}

/**
 * Formatea un número sin el símbolo de moneda
 * Ejemplo: 100000.50 -> "100.000,50"
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - String formateado sin símbolo
 */
export const formatNumber = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0,00'
  }

  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

