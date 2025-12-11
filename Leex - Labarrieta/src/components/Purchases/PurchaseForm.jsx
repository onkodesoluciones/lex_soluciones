import { useState, useEffect } from 'react'
import { purchasesService } from '../../services/purchasesService'
import { inventoryService } from '../../services/inventoryService'
import { X } from 'lucide-react'

const PurchaseForm = ({ purchase, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    inventory_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit_price: '',
    supplier: '',
    notes: ''
  })
  const [inventoryItems, setInventoryItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingItems, setLoadingItems] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadInventoryItems()
    if (purchase) {
      setFormData({
        inventory_id: purchase.inventory_id || '',
        purchase_date: purchase.purchase_date || new Date().toISOString().split('T')[0],
        quantity: purchase.quantity || '',
        unit_price: purchase.unit_price || '',
        supplier: purchase.supplier || '',
        notes: purchase.notes || ''
      })
    }
  }, [purchase])

  const loadInventoryItems = async () => {
    try {
      setLoadingItems(true)
      const items = await inventoryService.getAll()
      setInventoryItems(items)
    } catch (err) {
      setError('Error al cargar items del inventario: ' + err.message)
    } finally {
      setLoadingItems(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0
    const unitPrice = parseFloat(formData.unit_price) || 0
    return (quantity * unitPrice).toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.inventory_id) {
      setError('Debes seleccionar un item del inventario')
      return
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }

    if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
      setError('El precio unitario debe ser mayor a 0')
      return
    }

    if (!formData.purchase_date) {
      setError('La fecha de compra es obligatoria')
      return
    }

    try {
      setLoading(true)
      const submitData = {
        inventory_id: formData.inventory_id,
        purchase_date: formData.purchase_date,
        quantity: parseFloat(formData.quantity),
        unit_price: parseFloat(formData.unit_price),
        total_price: parseFloat(calculateTotal()),
        supplier: formData.supplier || null,
        notes: formData.notes || null
      }

      if (purchase) {
        await purchasesService.update(purchase.id, submitData)
      } else {
        await purchasesService.create(submitData)
      }
      onSuccess()
    } catch (err) {
      setError('Error al guardar compra: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectedItem = inventoryItems.find(item => item.id === formData.inventory_id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {purchase ? 'Editar Compra' : 'Nueva Compra'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item del Inventario <span className="text-red-500">*</span>
              </label>
              {loadingItems ? (
                <div className="input-field text-gray-500">Cargando items...</div>
              ) : (
                <select
                  name="inventory_id"
                  value={formData.inventory_id}
                  onChange={handleChange}
                  className="input-field"
                  required
                  disabled={!!purchase}
                >
                  <option value="">Seleccionar item...</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} {item.category ? `(${item.category})` : ''}
                    </option>
                  ))}
                </select>
              )}
              {selectedItem && (
                <p className="text-xs text-gray-500 mt-1">
                  Stock actual: {selectedItem.current_stock} {selectedItem.unit}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Compra <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="input-field"
                required
                placeholder="0.00"
              />
              {selectedItem && (
                <p className="text-xs text-gray-500 mt-1">Unidad: {selectedItem.unit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="input-field"
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Total
              </label>
              <div className="input-field bg-gray-50 font-semibold">
                ${calculateTotal()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="input-field"
                placeholder="Nombre del proveedor"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>

          {!purchase && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Al guardar esta compra, el stock del item se actualizará automáticamente.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : purchase ? 'Actualizar' : 'Registrar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PurchaseForm

