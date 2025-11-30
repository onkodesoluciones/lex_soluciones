import { pdf } from '@react-pdf/renderer'
import { storageService } from '../services/storageService'

/**
 * Genera un PDF y lo guarda en Supabase Storage
 * @param {React Component} DocumentComponent - Componente del documento PDF
 * @param {string} fileName - Nombre del archivo
 * @param {string} folder - Carpeta en storage (default: 'pdfs')
 * @returns {Promise<string>} URL del PDF guardado
 */
export const generateAndSavePDF = async (DocumentComponent, fileName, folder = 'pdfs') => {
  try {
    // Generar el blob del PDF
    const blob = await pdf(DocumentComponent).toBlob()
    
    // Crear un archivo desde el blob
    const file = new File([blob], fileName, { type: 'application/pdf' })
    
    // Subir a Supabase Storage
    const { url } = await storageService.uploadPDF(file, folder)
    
    return url
  } catch (error) {
    console.error('Error al generar PDF:', error)
    throw error
  }
}

/**
 * Genera un PDF y lo descarga directamente en el navegador
 * @param {React Component} DocumentComponent - Componente del documento PDF
 * @param {string} fileName - Nombre del archivo para descargar
 */
export const generateAndDownloadPDF = async (DocumentComponent, fileName) => {
  try {
    const blob = await pdf(DocumentComponent).toBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al descargar PDF:', error)
    throw error
  }
}

