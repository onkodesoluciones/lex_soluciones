import { useState } from 'react'
import { inventoryService } from '../../services/inventoryService'
import { X, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

const InventoryMovementForm = ({ item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    movement_type: 'entry',
    quantity: '',
    reason: '',
    reference_type: 'manual'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }

    if (formData.movement_type === 'exit' && parseFloat(formData.quantity) > item.current_stock) {
      setError(`No hay suficiente stock. Stock disponible: ${item.current_stock}`)
      return
    }

    try {
      setLoading(true)
      await inventoryService.addMovement({
        inventory_id: item.id,
        movement_type: formData.movement_type,
        quantity: parseFloat(formData.quantity),
        reason: formData.reason,
        reference_type: formData.reference_type
      })
      onSuccess()
    } catch (err) {
      setError('Error al registrar movimiento: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Movimiento de Stock</h2>
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

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Item</p>
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-600 mt-2">
              Stock actual: <span className="font-medium">{item.current_stock} {item.unit}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, movement_type: 'entry' }))}
                  className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                    formData.movement_type === 'entry'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Entrada</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, movement_type: 'exit' }))}
                  className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                    formData.movement_type === 'exit'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">Salida</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, movement_type: 'adjustment' }))}
                  className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                    formData.movement_type === 'adjustment'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Ajuste</span>
                </button>
              </div>
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
              <p className="text-xs text-gray-500 mt-1">Unidad: {item.unit}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo / Razón
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Ej: Compra, Uso en ensayo, Ajuste de inventario..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Referencia
              </label>
              <select
                name="reference_type"
                value={formData.reference_type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="manual">Manual</option>
                <option value="test">Ensayos</option>
                <option value="intervention">Intervención</option>
                <option value="purchase">Compra</option>
              </select>
            </div>
          </div>

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
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InventoryMovementForm

