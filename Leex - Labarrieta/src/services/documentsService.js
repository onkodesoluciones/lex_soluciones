import { supabase } from '../config/supabase'

export const documentsService = {
  // ========== REMITOS ==========
  
  // Obtener todos los remitos
  async getAllRemitos() {
    const { data, error } = await supabase
      .from('remitos')
      .select(`
        *,
        clients (*)
      `)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener remitos de un cliente
  async getRemitosByClient(clientId) {
    const { data, error } = await supabase
      .from('remitos')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener un remito por ID
  async getRemitoById(id) {
    const { data, error } = await supabase
      .from('remitos')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Generar número de remito
  async generateRemitoNumber() {
    const year = new Date().getFullYear()
    const { data, error } = await supabase
      .from('remitos')
      .select('remito_number')
      .like('remito_number', `REM-${year}-%`)
      .order('remito_number', { ascending: false })
      .limit(1)
    
    if (error) throw error
    
    let nextNumber = 1
    if (data && data.length > 0) {
      const lastNumber = parseInt(data[0].remito_number.split('-')[2]) || 0
      nextNumber = lastNumber + 1
    }
    
    return `REM-${year}-${String(nextNumber).padStart(4, '0')}`
  },

  // Crear un remito
  async createRemito(remitoData) {
    const { data, error } = await supabase
      .from('remitos')
      .insert([remitoData])
      .select(`
        *,
        clients (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar un remito
  async updateRemito(id, remitoData) {
    const { data, error } = await supabase
      .from('remitos')
      .update(remitoData)
      .eq('id', id)
      .select(`
        *,
        clients (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar un remito
  async deleteRemito(id) {
    const { error } = await supabase
      .from('remitos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // ========== PRESUPUESTOS ==========

  // Obtener todos los presupuestos
  async getAllPresupuestos() {
    const { data, error } = await supabase
      .from('presupuestos')
      .select(`
        *,
        clients (*)
      `)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener presupuestos de un cliente
  async getPresupuestosByClient(clientId) {
    const { data, error } = await supabase
      .from('presupuestos')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener un presupuesto por ID
  async getPresupuestoById(id) {
    const { data, error } = await supabase
      .from('presupuestos')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Generar número de presupuesto
  async generatePresupuestoNumber() {
    const year = new Date().getFullYear()
    const { data, error } = await supabase
      .from('presupuestos')
      .select('presupuesto_number')
      .like('presupuesto_number', `PRE-${year}-%`)
      .order('presupuesto_number', { ascending: false })
      .limit(1)
    
    if (error) throw error
    
    let nextNumber = 1
    if (data && data.length > 0) {
      const lastNumber = parseInt(data[0].presupuesto_number.split('-')[2]) || 0
      nextNumber = lastNumber + 1
    }
    
    return `PRE-${year}-${String(nextNumber).padStart(4, '0')}`
  },

  // Crear un presupuesto
  async createPresupuesto(presupuestoData) {
    const { data, error } = await supabase
      .from('presupuestos')
      .insert([presupuestoData])
      .select(`
        *,
        clients (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar un presupuesto
  async updatePresupuesto(id, presupuestoData) {
    const { data, error } = await supabase
      .from('presupuestos')
      .update(presupuestoData)
      .eq('id', id)
      .select(`
        *,
        clients (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar un presupuesto
  async deletePresupuesto(id) {
    const { error } = await supabase
      .from('presupuestos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

