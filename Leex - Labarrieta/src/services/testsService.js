import { supabase } from '../config/supabase'

export const testsService = {
  // Obtener todos los ensayos
  async getAll() {
    const { data, error } = await supabase
      .from('tests')
      .select(`
        *,
        defibrillators (
          id,
          brand,
          model,
          serial_number,
          clients (*)
        ),
        checklist_templates (*)
      `)
      .order('test_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener ensayos de un desfibrilador
  async getByDefibrillatorId(defibrillatorId) {
    const { data, error } = await supabase
      .from('tests')
      .select(`
        *,
        checklist_templates (*)
      `)
      .eq('defibrillator_id', defibrillatorId)
      .order('test_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener ensayos por año
  async getByYear(defibrillatorId, year) {
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`
    
    const { data, error } = await supabase
      .from('tests')
      .select(`
        *,
        checklist_templates (*)
      `)
      .eq('defibrillator_id', defibrillatorId)
      .gte('test_date', startDate)
      .lte('test_date', endDate)
      .order('test_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener un ensayo por ID con sus items
  async getById(id) {
    // Obtener el ensayo
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select(`
        *,
        defibrillators (
          *,
          clients (*)
        ),
        checklist_templates (*)
      `)
      .eq('id', id)
      .single()

    if (testError) throw testError

    // Obtener los items del ensayo
    const { data: items, error: itemsError } = await supabase
      .from('test_items')
      .select('*')
      .eq('test_id', id)
      .order('created_at', { ascending: true })

    if (itemsError) throw itemsError

    return {
      ...test,
      items: items || []
    }
  },

  // Crear un nuevo ensayo
  async create(testData) {
    const { data, error } = await supabase
      .from('tests')
      .insert([testData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Agregar items a un ensayo
  async addItems(testId, items) {
    const itemsWithTestId = items.map(item => ({
      ...item,
      test_id: testId
    }))

    const { data, error } = await supabase
      .from('test_items')
      .insert(itemsWithTestId)
      .select()
    
    if (error) throw error
    return data
  },

  // Actualizar un ensayo
  async update(id, testData) {
    const { data, error } = await supabase
      .from('tests')
      .update(testData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Actualizar un item del ensayo
  async updateItem(itemId, itemData) {
    const { data, error } = await supabase
      .from('test_items')
      .update(itemData)
      .eq('id', itemId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Eliminar un ensayo
  async delete(id) {
    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Obtener ensayos próximos (basado en next_test_date)
  async getUpcomingTests(days = 30) {
    const today = new Date().toISOString().split('T')[0]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    const futureDateStr = futureDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('tests')
      .select(`
        *,
        defibrillators (
          id,
          brand,
          model,
          serial_number,
          clients (*)
        )
      `)
      .not('next_test_date', 'is', null)
      .gte('next_test_date', today)
      .lte('next_test_date', futureDateStr)
      .order('next_test_date', { ascending: true })
    
    if (error) throw error
    return data
  }
}

