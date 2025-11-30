import { supabase } from '../config/supabase'

export const inventoryService = {
  // Obtener todo el inventario
  async getAll() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Obtener items con stock bajo
  async getLowStock() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .lte('current_stock', supabase.raw('min_stock'))
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Obtener un item por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Crear un nuevo item
  async create(itemData) {
    const { data, error } = await supabase
      .from('inventory')
      .insert([itemData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar un item
  async update(id, itemData) {
    const { data, error } = await supabase
      .from('inventory')
      .update(itemData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar un item
  async delete(id) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Registrar un movimiento de stock
  async addMovement(movementData) {
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert([movementData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Obtener movimientos de un item
  async getMovements(inventoryId) {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('inventory_id', inventoryId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

