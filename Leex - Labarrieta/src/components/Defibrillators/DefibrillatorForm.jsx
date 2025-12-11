import { useState, useEffect } from 'react'
import { defibrillatorsService } from '../../services/defibrillatorsService'
import { X } from 'lucide-react'

const DefibrillatorForm = ({ defibrillator, clients, equipmentType = 'new', onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    brand: '',
    model: '',
    serial_number: '',
    location: '',
    installation_date: '',
    purchase_date: '',
    warranty_until: '',
    periodo_garantia: '',
    año_fabricacion: '',
    primera_intervencion_lex: '',
    status: 'active',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentEquipmentType, setCurrentEquipmentType] = useState(equipmentType)

  useEffect(() => {
    if (defibrillator) {
      // Determinar tipo basado en los campos existentes
      const isInstalled = defibrillator.año_fabricacion || defibrillator.primera_intervencion_lex
      const isNew = defibrillator.installation_date && defibrillator.periodo_garantia
      if (isInstalled) setCurrentEquipmentType('installed')
      else if (isNew) setCurrentEquipmentType('new')
      
      setFormData({
        client_id: defibrillator.client_id || '',
        brand: defibrillator.brand || '',
        model: defibrillator.model || '',
        serial_number: defibrillator.serial_number || '',
        location: defibrillator.location || '',
        installation_date: defibrillator.installation_date || '',
        purchase_date: defibrillator.purchase_date || '',
        warranty_until: defibrillator.warranty_until || '',
        periodo_garantia: defibrillator.periodo_garantia || '',
        año_fabricacion: defibrillator.año_fabricacion || '',
        primera_intervencion_lex: defibrillator.primera_intervencion_lex || '',
        status: defibrillator.status || 'active',
        notes: defibrillator.notes || ''
      })
    } else {
      setCurrentEquipmentType(equipmentType)
    }
  }, [defibrillator, equipmentType])

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

    if (!formData.client_id) {
      setError('Debes seleccionar un cliente')
      return
    }

    if (!formData.brand.trim() || !formData.model.trim()) {
      setError('La marca y el modelo son obligatorios')
      return
    }

    try {
      setLoading(true)
      const submitData = {
        ...formData,
        installation_date: currentEquipmentType === 'new' ? (formData.installation_date || null) : null,
        purchase_date: formData.purchase_date || null,
        warranty_until: formData.warranty_until || null,
        periodo_garantia: currentEquipmentType === 'new' ? (formData.periodo_garantia || null) : null,
        año_fabricacion: currentEquipmentType === 'installed' ? (formData.año_fabricacion ? parseInt(formData.año_fabricacion) : null) : null,
        primera_intervencion_lex: currentEquipmentType === 'installed' ? (formData.primera_intervencion_lex || null) : null
      }

      if (defibrillator) {
        await defibrillatorsService.update(defibrillator.id, submitData)
      } else {
        await defibrillatorsService.create(submitData)
      }
      onSuccess()
    } catch (err) {
      setError('Error al guardar desfibrilador: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {defibrillator ? 'Editar Desfibrilador' : 'Nuevo Desfibrilador'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Selector de tipo de equipo (solo si es nuevo) */}
          {!defibrillator && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentEquipmentType('new')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentEquipmentType === 'new'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Equipo Nuevo
              </button>
              <button
                type="button"
                onClick={() => setCurrentEquipmentType('installed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentEquipmentType === 'installed'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Equipo Ya Instalado
              </button>
            </div>
          )}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Serie
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="Ej: Recepción, Planta Baja, etc."
              />
            </div>

            {/* Campos para EQUIPOS NUEVOS */}
            {currentEquipmentType === 'new' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Instalación <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="installation_date"
                    value={formData.installation_date}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período de Garantía <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="periodo_garantia"
                    value={formData.periodo_garantia}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ej: 12 meses, 24 meses"
                    required
                  />
                </div>
              </>
            )}

            {/* Campos para EQUIPOS YA INSTALADOS */}
            {currentEquipmentType === 'installed' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año de Fabricación <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="año_fabricacion"
                    value={formData.año_fabricacion}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ej: 2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primera Intervención LEX <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="primera_intervencion_lex"
                    value={formData.primera_intervencion_lex}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Compra
              </label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Garantía hasta
              </label>
              <input
                type="date"
                name="warranty_until"
                value={formData.warranty_until}
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
                <option value="active">Activo</option>
                <option value="maintenance">En Mantenimiento</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="input-field"
                placeholder="Notas adicionales sobre el equipo..."
              />
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
              {loading ? 'Guardando...' : defibrillator ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DefibrillatorForm

