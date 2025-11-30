import { supabase } from '../config/supabase'

export const interventionsService = {
  // Obtener todas las intervenciones
  async getAll() {
    const { data, error } = await supabase
      .from('interventions')
      .select(`
        *,
        defibrillators (
          *,
          clients (*)
        )
      `)
      .order('intervention_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener intervenciones de un desfibrilador
  async getByDefibrillatorId(defibrillatorId) {
    const { data, error } = await supabase
      .from('interventions')
      .select('*')
      .eq('defibrillator_id', defibrillatorId)
      .order('intervention_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener intervenciones próximas (próximas a vencer)
  async getUpcoming(days = 30) {
    const today = new Date().toISOString().split('T')[0]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    const futureDateStr = futureDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('interventions')
      .select(`
        *,
        defibrillators (
          *,
          clients (*)
        )
      `)
      .gte('next_intervention_date', today)
      .lte('next_intervention_date', futureDateStr)
      .order('next_intervention_date', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Obtener una intervención por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('interventions')
      .select(`
        *,
        defibrillators (
          *,
          clients (*)
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Crear una nueva intervención
  async create(interventionData) {
    const { data, error } = await supabase
      .from('interventions')
      .insert([interventionData])
      .select(`
        *,
        defibrillators (
          *,
          clients (*)
        )
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar una intervención
  async update(id, interventionData) {
    const { data, error } = await supabase
      .from('interventions')
      .update(interventionData)
      .eq('id', id)
      .select(`
        *,
        defibrillators (
          *,
          clients (*)
        )
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar una intervención
  async delete(id) {
    const { error } = await supabase
      .from('interventions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

