import { useState, useEffect } from 'react'
import { documentsService } from '../../services/documentsService'
import { clientsService } from '../../services/clientsService'
import { generateAndSavePDF } from '../../utils/pdfGenerator'
import { loadLogoAsBase64 } from '../../utils/logoLoader'
import PresupuestoPDF from '../PDFs/PresupuestoPDF'
import { formatCurrency } from '../../utils/formatCurrency'
import { X, Plus, Trash2 } from 'lucide-react'

const PresupuestoForm = ({ presupuesto, onClose, onSuccess }) => {
  const [clients, setClients] = useState([])
  // Función helper para obtener la fecha local en formato YYYY-MM-DD
  const getLocalDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState({
    client_id: '',
    presupuesto_number: '',
    date: getLocalDateString(),
    valid_until: '',
    items: [],
    notes: '',
    status: 'pending',
    tax_rate: 21 // Porcentaje de IVA: 21% o 10.5%
  })
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: '',
    unit: 'unidad',
    unit_price: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadClients()
    if (!presupuesto) {
      generatePresupuestoNumber()
    } else {
      // Si presupuesto.date viene como string, asegurarse de que esté en formato YYYY-MM-DD
      let dateValue = presupuesto.date
      if (dateValue && typeof dateValue === 'string') {
        // Si viene como fecha completa con hora, extraer solo la fecha
        if (dateValue.includes('T')) {
          dateValue = dateValue.split('T')[0]
        }
      } else if (!dateValue) {
        dateValue = getLocalDateString()
      }

      setFormData({
        client_id: presupuesto.client_id || '',
        presupuesto_number: presupuesto.presupuesto_number || '',
        date: dateValue,
        valid_until: presupuesto.valid_until || '',
        items: presupuesto.items || [],
        notes: presupuesto.notes || '',
        status: presupuesto.status || 'pending',
        tax_rate: presupuesto.tax_rate || 21
      })
    }
  }, [])

  const loadClients = async () => {
    try {
      const data = await clientsService.getAll()
      setClients(data)
    } catch (err) {
      setError('Error al cargar clientes: ' + err.message)
    }
  }

  const generatePresupuestoNumber = async () => {
    try {
      const number = await documentsService.generatePresupuestoNumber()
      setFormData(prev => ({ ...prev, presupuesto_number: number }))
    } catch (err) {
      console.error('Error al generar número:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddItem = () => {
    if (!newItem.description.trim()) return

    const item = {
      description: newItem.description,
      quantity: parseFloat(newItem.quantity) || 1,
      unit: newItem.unit,
      unit_price: parseFloat(newItem.unit_price) || 0
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }))

    setNewItem({
      description: '',
      quantity: '',
      unit: 'unidad',
      unit_price: ''
    })
  }

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    )
    const taxRate = formData.tax_rate / 100 // Convertir porcentaje a decimal
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return { subtotal, tax, total }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.client_id) {
      setError('Debes seleccionar un cliente')
      return
    }

    if (formData.items.length === 0) {
      setError('Debes agregar al menos un item')
      return
    }

    try {
      setLoading(true)
      const { subtotal, tax, total } = calculateTotals()

      // Asegurarse de que la fecha se envíe como string YYYY-MM-DD sin conversiones
      let dateToSend = formData.date
      if (dateToSend && typeof dateToSend === 'string') {
        // Si viene como fecha completa con hora, extraer solo la fecha
        if (dateToSend.includes('T')) {
          dateToSend = dateToSend.split('T')[0]
        }
        // Asegurarse de que esté en formato YYYY-MM-DD
        if (!dateToSend.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Si viene en otro formato, intentar parsearlo
          const dateObj = new Date(dateToSend)
          if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear()
            const month = String(dateObj.getMonth() + 1).padStart(2, '0')
            const day = String(dateObj.getDate()).padStart(2, '0')
            dateToSend = `${year}-${month}-${day}`
          }
        }
      }

      // Hacer lo mismo para valid_until
      let validUntilToSend = formData.valid_until
      if (validUntilToSend && typeof validUntilToSend === 'string') {
        if (validUntilToSend.includes('T')) {
          validUntilToSend = validUntilToSend.split('T')[0]
        }
        if (!validUntilToSend.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const dateObj = new Date(validUntilToSend)
          if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear()
            const month = String(dateObj.getMonth() + 1).padStart(2, '0')
            const day = String(dateObj.getDate()).padStart(2, '0')
            validUntilToSend = `${year}-${month}-${day}`
          }
        }
      }

      const submitData = {
        ...formData,
        date: dateToSend,
        valid_until: validUntilToSend || null,
        items: formData.items,
        subtotal,
        tax,
        total,
        tax_rate: formData.tax_rate
      }

      // Debug: verificar la fecha que se envía
      console.log('Fecha original:', formData.date)
      console.log('Fecha a enviar:', dateToSend)

      let savedPresupuesto
      if (presupuesto) {
        savedPresupuesto = await documentsService.updatePresupuesto(presupuesto.id, submitData)
      } else {
        savedPresupuesto = await documentsService.createPresupuesto(submitData)
      }

      // Generar PDF
      try {
        const clientData = clients.find(c => c.id === formData.client_id)
        const logoBase64 = await loadLogoAsBase64()
        const pdfUrl = await generateAndSavePDF(
          <PresupuestoPDF
            presupuesto={savedPresupuesto}
            client={clientData}
            logoBase64={logoBase64}
          />,
          `presupuesto-${savedPresupuesto.presupuesto_number}-${Date.now()}.pdf`
        )
        
        // Actualizar el presupuesto con la URL del PDF
        await documentsService.updatePresupuesto(savedPresupuesto.id, { pdf_url: pdfUrl })
      } catch (pdfError) {
        console.error('Error al generar PDF:', pdfError)
        // No bloqueamos el guardado si falla el PDF
      }
      
      onSuccess()
    } catch (err) {
      setError('Error al guardar presupuesto: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, tax, total } = calculateTotals()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {presupuesto ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Presupuesto
              </label>
              <input
                type="text"
                name="presupuesto_number"
                value={formData.presupuesto_number}
                onChange={handleChange}
                className="input-field"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Válido hasta
              </label>
              <input
                type="date"
                name="valid_until"
                value={formData.valid_until}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="pending">Pendiente</option>
                <option value="accepted">Aceptado</option>
                <option value="rejected">Rechazado</option>
                <option value="expired">Vencido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IVA
              </label>
              <select
                name="tax_rate"
                value={formData.tax_rate}
                onChange={handleChange}
                className="input-field"
              >
                <option value={21}>21%</option>
                <option value={10.5}>10.5%</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items - Mismo código que RemitoForm */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
            
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                    min="0"
                    step="0.01"
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                    className="input-field"
                  >
                    <option value="unidad">Unidad</option>
                    <option value="kg">Kg</option>
                    <option value="litro">Litro</option>
                    <option value="hora">Hora</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Precio unit."
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unit_price: e.target.value }))}
                    min="0"
                    step="0.01"
                    className="input-field"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="btn-primary w-full h-full flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {formData.items.length > 0 && (
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unit} × {formatCurrency(item.unit_price)} = 
                        {formatCurrency(item.quantity * item.unit_price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totales */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">IVA ({formData.tax_rate}%):</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-lg text-gray-900">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
              {loading ? 'Guardando...' : presupuesto ? 'Actualizar' : 'Guardar Presupuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PresupuestoForm

