import { supabase } from '../config/supabase'
import { inventoryService } from './inventoryService'

export const purchasesService = {
  // Obtener todas las compras
  async getAll() {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        inventory (
          id,
          name,
          unit,
          category
        )
      `)
      .order('purchase_date', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener compras de un item específico
  async getByInventoryId(inventoryId) {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('inventory_id', inventoryId)
      .order('purchase_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener compras por rango de fechas
  async getByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        inventory (
          id,
          name,
          unit,
          category
        )
      `)
      .gte('purchase_date', startDate)
      .lte('purchase_date', endDate)
      .order('purchase_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Crear una nueva compra y actualizar stock automáticamente
  async create(purchaseData) {
    // Calcular precio total si no viene
    const totalPrice = purchaseData.total_price || 
      (parseFloat(purchaseData.quantity) * parseFloat(purchaseData.unit_price))

    const purchaseToInsert = {
      ...purchaseData,
      total_price: totalPrice
    }

    // Insertar la compra
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert([purchaseToInsert])
      .select(`
        *,
        inventory (
          id,
          name,
          unit,
          category
        )
      `)
      .single()

    if (purchaseError) throw purchaseError

    // Obtener el item actual del inventario
    const currentItem = await inventoryService.getById(purchaseData.inventory_id)
    
    // Actualizar el stock (sumar la cantidad comprada)
    const newStock = (currentItem.current_stock || 0) + parseFloat(purchaseData.quantity)
    
    await inventoryService.update(purchaseData.inventory_id, {
      current_stock: newStock
    })

    // Registrar el movimiento de stock automáticamente
    await inventoryService.addMovement({
      inventory_id: purchaseData.inventory_id,
      movement_type: 'entry',
      quantity: parseFloat(purchaseData.quantity),
      reason: `Compra registrada - ${purchaseData.supplier || 'Sin proveedor'}`,
      reference_type: 'purchase',
      reference_id: purchase.id
    })

    return purchase
  },

  // Actualizar una compra
  async update(id, purchaseData) {
    // Si se cambia la cantidad o precio, recalcular total
    if (purchaseData.quantity || purchaseData.unit_price) {
      const { data: currentPurchase } = await supabase
        .from('purchases')
        .select('quantity, unit_price')
        .eq('id', id)
        .single()

      const quantity = purchaseData.quantity || currentPurchase.quantity
      const unitPrice = purchaseData.unit_price || currentPurchase.unit_price
      purchaseData.total_price = parseFloat(quantity) * parseFloat(unitPrice)
    }

    const { data, error } = await supabase
      .from('purchases')
      .update(purchaseData)
      .eq('id', id)
      .select(`
        *,
        inventory (
          id,
          name,
          unit,
          category
        )
      `)
      .single()

    if (error) throw error
    return data
  },

  // Eliminar una compra y revertir el stock
  async delete(id) {
    // Obtener la compra antes de eliminarla
    const { data: purchase, error: fetchError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Obtener el item actual del inventario
    const currentItem = await inventoryService.getById(purchase.inventory_id)
    
    // Revertir el stock (restar la cantidad comprada)
    const newStock = Math.max(0, (currentItem.current_stock || 0) - parseFloat(purchase.quantity))
    
    await inventoryService.update(purchase.inventory_id, {
      current_stock: newStock
    })

    // Eliminar la compra
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Obtener estadísticas de compras
  async getStats(startDate, endDate) {
    let query = supabase
      .from('purchases')
      .select('quantity, unit_price, total_price')

    if (startDate) {
      query = query.gte('purchase_date', startDate)
    }
    if (endDate) {
      query = query.lte('purchase_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    const totalPurchases = data.length
    const totalAmount = data.reduce((sum, p) => sum + parseFloat(p.total_price || 0), 0)
    const totalQuantity = data.reduce((sum, p) => sum + parseFloat(p.quantity || 0), 0)

    return {
      totalPurchases,
      totalAmount,
      totalQuantity
    }
  }
}

