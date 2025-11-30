import { supabase } from '../config/supabase'

export const storageService = {
  // Subir un PDF
  async uploadPDF(file, folder = 'pdfs') {
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    return {
      path: filePath,
      url: urlData.publicUrl
    }
  },

  // Subir logo
  async uploadLogo(file) {
    const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`
    const filePath = `logos/${fileName}`

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    return {
      path: filePath,
      url: urlData.publicUrl
    }
  },

  // Eliminar un archivo
  async deleteFile(filePath) {
    const { error } = await supabase.storage
      .from('documents')
      .remove([filePath])

    if (error) throw error
  },

  // Obtener URL pública de un archivo
  getPublicUrl(filePath) {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    return data.publicUrl
  }
}

