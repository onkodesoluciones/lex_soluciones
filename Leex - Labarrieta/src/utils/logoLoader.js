/**
 * Carga el logo como base64 para usar en react-pdf
 * @returns {Promise<string>} Base64 string del logo
 */
export const loadLogoAsBase64 = async () => {
  try {
    // Intentar cargar el logo desde la carpeta public
    const response = await fetch('/logo.jpg')
    
    if (!response.ok) {
      throw new Error('Logo no encontrado')
    }
    
    const blob = await response.blob()
    
    // Convertir a base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error al cargar el logo:', error)
    // Retornar null si no se puede cargar
    return null
  }
}

