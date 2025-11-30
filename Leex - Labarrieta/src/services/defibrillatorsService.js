import { supabase } from '../config/supabase'

export const defibrillatorsService = {
  // Obtener todos los desfibriladores
  async getAll() {
    const { data, error } = await supabase
      .from('defibrillators')
      .select(`
        *,
        clients (*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener desfibriladores de un cliente
  async getByClientId(clientId) {
    const { data, error } = await supabase
      .from('defibrillators')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener un desfibrilador por ID con toda su información
  async getById(id) {
    const { data, error } = await supabase
      .from('defibrillators')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Obtener hoja de vida completa de un desfibrilador
  async getLifeSheet(id) {
    // Obtener el desfibrilador
    const { data: defibrillator, error: defError } = await supabase
      .from('defibrillators')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', id)
      .single()

    if (defError) throw defError

    // Obtener última intervención
    const { data: lastIntervention } = await supabase
      .from('interventions')
      .select('*')
      .eq('defibrillator_id', id)
      .order('intervention_date', { ascending: false })
      .limit(1)
      .single()

    // Obtener próxima intervención
    const { data: nextIntervention } = await supabase
      .from('interventions')
      .select('*')
      .eq('defibrillator_id', id)
      .gte('next_intervention_date', new Date().toISOString().split('T')[0])
      .order('next_intervention_date', { ascending: true })
      .limit(1)
      .single()

    // Obtener todos los ensayos
    const { data: tests } = await supabase
      .from('tests')
      .select('*')
      .eq('defibrillator_id', id)
      .order('test_date', { ascending: false })

    return {
      defibrillator,
      lastIntervention: lastIntervention || null,
      nextIntervention: nextIntervention || null,
      tests: tests || []
    }
  },

  // Crear un nuevo desfibrilador
  async create(defibrillatorData) {
    const { data, error } = await supabase
      .from('defibrillators')
      .insert([defibrillatorData])
      .select(`
        *,
        clients (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar un desfibrilador
  async update(id, defibrillatorData) {
    const { data, error } = await supabase
      .from('defibrillators')
      .update(defibrillatorData)
      .eq('id', id)
      .select(`
        *,
        clients (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar un desfibrilador
  async delete(id) {
    const { error } = await supabase
      .from('defibrillators')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

