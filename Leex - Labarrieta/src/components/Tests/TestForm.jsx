import { useState, useEffect } from 'react'
import { testsService } from '../../services/testsService'
import { checklistTemplatesService } from '../../services/checklistTemplatesService'
import { defibrillatorsService } from '../../services/defibrillatorsService'
import { generateAndSavePDF } from '../../utils/pdfGenerator'
import TestPDF from '../PDFs/TestPDF'
import { X, Save } from 'lucide-react'
import DynamicChecklist from './DynamicChecklist'

const TestForm = ({ test, defibrillators, templates, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    defibrillator_id: '',
    template_id: '',
    test_date: new Date().toISOString().split('T')[0],
    next_test_date: '',
    technician_name: '',
    observations: '',
    result: 'pending'
  })
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [checklistItems, setChecklistItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (test) {
      setFormData({
        defibrillator_id: test.defibrillator_id || '',
        template_id: test.template_id || '',
        test_date: test.test_date || new Date().toISOString().split('T')[0],
        next_test_date: test.next_test_date || '',
        technician_name: test.technician_name || '',
        observations: test.observations || '',
        result: test.result || 'pending'
      })
      setChecklistItems(test.items || [])
      if (test.template_id) {
        loadTemplate(test.template_id)
      }
    }
  }, [test])

  useEffect(() => {
    if (formData.template_id && !test) {
      loadTemplate(formData.template_id)
    }
  }, [formData.template_id])

  const loadTemplate = async (templateId) => {
    try {
      const template = await checklistTemplatesService.getById(templateId)
      setSelectedTemplate(template)
      
      if (!test) {
        // Inicializar items desde el template
        const items = template.items.map(item => ({
          item_key: item.key || item.label,
          item_label: item.label,
          checked: false,
          value: '',
          notes: ''
        }))
        setChecklistItems(items)
      }
    } catch (err) {
      console.error('Error al cargar plantilla:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleChecklistChange = (index, field, value) => {
    const updated = [...checklistItems]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setChecklistItems(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.defibrillator_id) {
      setError('Debes seleccionar un desfibrilador')
      return
    }

    try {
      setLoading(true)

      // Crear o actualizar el ensayo
      let testData = {
        defibrillator_id: formData.defibrillator_id,
        template_id: formData.template_id || null,
        test_date: formData.test_date,
        next_test_date: formData.next_test_date || null,
        technician_name: formData.technician_name,
        observations: formData.observations,
        result: formData.result
      }

      let savedTest
      if (test) {
        savedTest = await testsService.update(test.id, testData)
        // Actualizar items existentes o crear nuevos
        for (const item of checklistItems) {
          if (item.id) {
            await testsService.updateItem(item.id, {
              checked: item.checked,
              value: item.value,
              notes: item.notes
            })
          } else {
            await testsService.addItems(savedTest.id, [{
              item_key: item.item_key,
              item_label: item.item_label,
              checked: item.checked,
              value: item.value,
              notes: item.notes
            }])
          }
        }
      } else {
        savedTest = await testsService.create(testData)
        // Agregar items del check-list
        if (checklistItems.length > 0) {
          await testsService.addItems(savedTest.id, checklistItems.map(item => ({
            item_key: item.item_key,
            item_label: item.item_label,
            checked: item.checked,
            value: item.value,
            notes: item.notes
          })))
        }
      }

      // Generar PDF
      try {
        const defibrillatorData = await defibrillatorsService.getById(formData.defibrillator_id)
        const clientData = defibrillatorData.clients
        
        // Obtener items actualizados del ensayo
        const fullTest = await testsService.getById(savedTest.id)
        
        const pdfUrl = await generateAndSavePDF(
          <TestPDF
            test={fullTest}
            defibrillator={defibrillatorData}
            client={clientData}
            template={selectedTemplate}
            items={fullTest.items || checklistItems}
          />,
          `ensayo-${savedTest.id}-${Date.now()}.pdf`
        )
        
        // Actualizar el ensayo con la URL del PDF
        await testsService.update(savedTest.id, { pdf_url: pdfUrl })
      } catch (pdfError) {
        console.error('Error al generar PDF:', pdfError)
        // No bloqueamos el guardado si falla el PDF
      }
      
      onSuccess()
    } catch (err) {
      setError('Error al guardar ensayo: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectedDefibrillator = defibrillators.find(d => d.id === formData.defibrillator_id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {test ? 'Editar Ensayo' : 'Nuevo Ensayo'}
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

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desfibrilador <span className="text-red-500">*</span>
              </label>
              <select
                name="defibrillator_id"
                value={formData.defibrillator_id}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Seleccionar equipo...</option>
                {defibrillators.map(def => (
                  <option key={def.id} value={def.id}>
                    {def.clients?.name} - {def.brand} {def.model} {def.serial_number ? `(${def.serial_number})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plantilla de Check-list
              </label>
              <select
                name="template_id"
                value={formData.template_id}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Seleccionar plantilla...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.is_generic ? '(Genérica)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del Ensayo <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="test_date"
                value={formData.test_date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Próximo Ensayo
              </label>
              <input
                type="date"
                name="next_test_date"
                value={formData.next_test_date}
                onChange={handleChange}
                className="input-field"
                title="Fecha programada para el próximo ensayo de este equipo"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fecha en la que se debe realizar el próximo ensayo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Técnico
              </label>
              <input
                type="text"
                name="technician_name"
                value={formData.technician_name}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resultado
              </label>
              <select
                name="result"
                value={formData.result}
                onChange={handleChange}
                className="input-field"
              >
                <option value="pending">Pendiente</option>
                <option value="passed">Aprobado</option>
                <option value="failed">Rechazado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones Generales
              </label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Observaciones y anotaciones generales del ensayo..."
              />
            </div>
          </div>

          {/* Check-list dinámico */}
          {selectedTemplate && checklistItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Check-list: {selectedTemplate.name}
              </h3>
              <DynamicChecklist
                items={checklistItems}
                onChange={handleChecklistChange}
              />
            </div>
          )}

          {formData.template_id && !selectedTemplate && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">Cargando plantilla...</p>
            </div>
          )}

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
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : test ? 'Actualizar' : 'Guardar Ensayo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TestForm

