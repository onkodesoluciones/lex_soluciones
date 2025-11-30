import { supabase } from '../config/supabase'

export const clientsService = {
  // Obtener todos los clientes
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Obtener un cliente por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Crear un nuevo cliente
  async create(clientData) {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar un cliente
  async update(id, clientData) {
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar un cliente
  async delete(id) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Buscar clientes
  async search(searchTerm) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  }
}

