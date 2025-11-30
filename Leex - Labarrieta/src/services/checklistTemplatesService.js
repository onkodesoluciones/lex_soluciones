import { supabase } from '../config/supabase'

export const checklistTemplatesService = {
  // Obtener todas las plantillas
  async getAll() {
    const { data, error } = await supabase
      .from('checklist_templates')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Obtener plantilla genérica
  async getGeneric() {
    const { data, error } = await supabase
      .from('checklist_templates')
      .select('*')
      .eq('is_generic', true)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data
  },

  // Obtener plantillas por marca/modelo
  async getByBrand(brand, model = null) {
    let query = supabase
      .from('checklist_templates')
      .select('*')
      .eq('brand', brand)
    
    if (model) {
      query = query.eq('model', model)
    }
    
    const { data, error } = await query.order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Obtener una plantilla por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('checklist_templates')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Crear una nueva plantilla
  async create(templateData) {
    const { data, error } = await supabase
      .from('checklist_templates')
      .insert([templateData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar una plantilla
  async update(id, templateData) {
    const { data, error } = await supabase
      .from('checklist_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar una plantilla
  async delete(id) {
    const { error } = await supabase
      .from('checklist_templates')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

