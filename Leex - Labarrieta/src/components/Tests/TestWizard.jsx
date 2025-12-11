import { useState, useEffect } from 'react'
import { testsService } from '../../services/testsService'
import { defibrillatorsService } from '../../services/defibrillatorsService'
import { checklistTemplatesService } from '../../services/checklistTemplatesService'
import { generateAndSavePDF } from '../../utils/pdfGenerator'
import { loadLogoAsBase64 } from '../../utils/logoLoader'
import TestPDF from '../PDFs/TestPDF'
import { defaultInspectionItems, defaultSafetyItems, defaultPerformanceItems } from '../../utils/defaultTestItems'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'

const TestWizard = ({ defibrillators, templates, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Paso 1: Datos básicos
    defibrillator_id: '',
    institution: '',
    sector: '',
    technician_name: '',
    test_date: new Date().toISOString().split('T')[0],
    next_test_date: '', // Fecha del próximo ensayo
    template_id: '',
    
    // Paso 2: Instrumental
    instruments: [
      { name: 'Analizador de Seguridad Eléctrica', brand: '', model: '', serial_number: '', calibrated: false },
      { name: 'Analizador de Desfibriladores', brand: '', model: '', serial_number: '', calibrated: false },
      { name: 'Multímetro Digital', brand: '', model: '', serial_number: '', calibrated: false }
    ],
    
    // Paso 3: Motivo
    maintenance_type: '', // 'preventive', 'corrective' o 'annual'
    
    // Paso 4-6: Resultados de ensayos (items predefinidos IRAM 62353)
    inspection_items: [...defaultInspectionItems],
    safety_items: [...defaultSafetyItems],
    performance_items: [...defaultPerformanceItems],
    
    // Paso 7: Repuestos
    spare_parts: '',
    
    // Paso 8: Observaciones
    observations: '',
    
    // Paso 9: Resultado final
    result: 'pending'
  })
  
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const steps = [
    'Datos del Equipo',
    'Instrumental',
    'Motivo',
    'Inspección (5.2)',
    'Seguridad Eléctrica (5.3)',
    'Performance (5.4)',
    'Repuestos',
    'Observaciones',
    'Finalizar'
  ]

  useEffect(() => {
    if (formData.defibrillator_id) {
      loadDefibrillatorData()
    }
  }, [formData.defibrillator_id])

  useEffect(() => {
    // Los items predefinidos ya están cargados por defecto
    // Si se selecciona una plantilla, se pueden agregar items adicionales o personalizar
    if (formData.template_id) {
      loadTemplate()
    }
  }, [formData.template_id])

  const loadDefibrillatorData = async () => {
    try {
      const def = await defibrillatorsService.getById(formData.defibrillator_id)
      setFormData(prev => ({
        ...prev,
        institution: def.clients?.name || '',
        sector: def.location || ''
      }))
    } catch (err) {
      console.error('Error al cargar datos del equipo:', err)
    }
  }

  const loadTemplate = async () => {
    try {
      const template = await checklistTemplatesService.getById(formData.template_id)
      setSelectedTemplate(template)
      
      // Si hay una plantilla personalizada, se pueden agregar items adicionales
      // Por ahora mantenemos los items predefinidos como base
      // En el futuro se pueden fusionar o reemplazar según necesidad
    } catch (err) {
      console.error('Error al cargar plantilla:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleInstrumentChange = (index, field, value) => {
    const updated = [...formData.instruments]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      instruments: updated
    }))
  }

  const handleItemChange = (section, index, field, value) => {
    const sectionKey = `${section}_items`
    const updated = [...formData[sectionKey]]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      [sectionKey]: updated
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setError(null)
    
    if (!formData.defibrillator_id) {
      setError('Debes seleccionar un desfibrilador')
      setCurrentStep(0)
      return
    }

    try {
      setLoading(true)
      
      // Combinar todos los items
      const allItems = [
        ...formData.inspection_items,
        ...formData.safety_items,
        ...formData.performance_items
      ]

      // Crear el ensayo
      const testData = {
        defibrillator_id: formData.defibrillator_id,
        template_id: formData.template_id || null,
        test_date: formData.test_date,
        next_test_date: formData.next_test_date || null,
        technician_name: formData.technician_name,
        observations: formData.observations,
        result: formData.result,
        institution: formData.institution,
        sector: formData.sector,
        instruments: formData.instruments,
        maintenance_type: formData.maintenance_type,
        spare_parts: formData.spare_parts
      }

      const savedTest = await testsService.create(testData)
      
      // Agregar items del check-list
      if (allItems.length > 0) {
        await testsService.addItems(savedTest.id, allItems.map(item => ({
          item_key: item.item_key,
          item_label: item.item_label,
          section: item.section || null, // Guardar la sección: 'inspection', 'safety', 'performance'
          checked: item.result === 'pass',
          result: item.result || null, // Guardar el resultado: 'pass', 'fail', 'na'
          value: item.value || '',
          notes: item.notes || '',
          criteria: item.criteria || ''
        })))
      }

      // Generar PDF
      try {
        const defibrillatorData = await defibrillatorsService.getById(formData.defibrillator_id)
        const clientData = defibrillatorData.clients
        
        const fullTest = await testsService.getById(savedTest.id)
        
        // Asegurar que los datos se pasen correctamente al PDF
        // Usar formData directamente para evitar problemas con conversiones de JSONB
        const testDataForPDF = {
          ...fullTest,
          institution: formData.institution,
          sector: formData.sector,
          // Usar formData.instruments directamente (viene del formulario con valores correctos)
          // Asegurar que se use formData primero, luego fullTest como fallback
          instruments: formData.instruments && formData.instruments.length > 0 ? formData.instruments : (fullTest.instruments || []),
          maintenance_type: formData.maintenance_type || fullTest.maintenance_type || '',
          spare_parts: formData.spare_parts || fullTest.spare_parts
        }
        
        // Debug: verificar datos
        console.log('Datos para PDF:', {
          instruments: testDataForPDF.instruments,
          maintenance_type: testDataForPDF.maintenance_type,
          'instrumentos calibrados': testDataForPDF.instruments?.map(i => ({ name: i.name, calibrated: i.calibrated, type: typeof i.calibrated }))
        })
        
        const logoBase64 = await loadLogoAsBase64()
        const pdfUrl = await generateAndSavePDF(
          <TestPDF
            test={testDataForPDF}
            defibrillator={defibrillatorData}
            client={clientData}
            template={selectedTemplate}
            items={fullTest.items || allItems}
            logoBase64={logoBase64}
          />,
          `ensayo-${savedTest.id}-${Date.now()}.pdf`
        )
        
        await testsService.update(savedTest.id, { pdf_url: pdfUrl })
      } catch (pdfError) {
        console.error('Error al generar PDF:', pdfError)
      }
      
      onSuccess()
    } catch (err) {
      setError('Error al guardar ensayo: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Datos del Equipo
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Datos del Equipo y Técnico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
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
                  Institución
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <input
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="input-field"
                />
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
                  Realizó <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="technician_name"
                  value={formData.technician_name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="md:col-span-2">
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
            </div>
          </div>
        )

      case 1: // Instrumental
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Instrumental Utilizado</h3>
            {formData.instruments.map((instrument, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instrumento
                    </label>
                    <input
                      type="text"
                      value={instrument.name}
                      onChange={(e) => handleInstrumentChange(index, 'name', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={instrument.brand}
                      onChange={(e) => handleInstrumentChange(index, 'brand', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={instrument.model}
                      onChange={(e) => handleInstrumentChange(index, 'model', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      N° Serie del Equipo
                    </label>
                    <input
                      type="text"
                      value={instrument.serial_number || ''}
                      onChange={(e) => handleInstrumentChange(index, 'serial_number', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={instrument.calibrated}
                        onChange={(e) => handleInstrumentChange(index, 'calibrated', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">Calibrado</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                instruments: [...prev.instruments, { name: '', brand: '', model: '', serial_number: '', calibrated: false }]
              }))}
              className="btn-secondary text-sm"
            >
              + Agregar Instrumento
            </button>
          </div>
        )

      case 2: // Motivo
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Motivo de Solicitud</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                <input
                  type="radio"
                  name="maintenance_type"
                  value="preventive"
                  checked={formData.maintenance_type === 'preventive'}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="text-lg">Ensayos Post Mantenimiento Preventivo</span>
              </label>
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                <input
                  type="radio"
                  name="maintenance_type"
                  value="corrective"
                  checked={formData.maintenance_type === 'corrective'}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="text-lg">Ensayos Post Mantenimiento Correctivo</span>
              </label>
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                <input
                  type="radio"
                  name="maintenance_type"
                  value="annual"
                  checked={formData.maintenance_type === 'annual'}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="text-lg">Verificación Técnica de Desfibrilador Anual</span>
              </label>
            </div>
          </div>
        )

      case 3: // Inspección
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">ENSAYO DE INSPECCION - IRAM 62353 - 5.2</h3>
            {formData.inspection_items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay items de inspección disponibles.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.inspection_items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{item.item_label}</p>
                        {item.criteria && (
                          <p className="text-sm text-gray-600 mb-2">Criterio: {item.criteria}</p>
                        )}
                        {item.result === 'pass' && item.value && (
                          <p className="text-sm text-gray-600">Valor medido: {item.value}</p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-gray-500 italic mt-2">Nota: {item.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleItemChange('inspection', index, 'result', 'pass')}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            item.result === 'pass'
                              ? 'bg-green-50 border-green-500 text-green-700'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          PASO
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange('inspection', index, 'result', 'fail')}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            item.result === 'fail'
                              ? 'bg-red-50 border-red-500 text-red-700'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                        >
                          FALLO
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange('inspection', index, 'result', 'na')}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            item.result === 'na'
                              ? 'bg-gray-50 border-gray-500 text-gray-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                    {(item.result === 'pass' || item.result === 'fail') && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <input
                          type="text"
                          placeholder="Valor medido (opcional)"
                          value={item.value}
                          onChange={(e) => handleItemChange('inspection', index, 'value', e.target.value)}
                          className="input-field mb-2"
                        />
                        <textarea
                          placeholder="Notas (opcional)"
                          value={item.notes}
                          onChange={(e) => handleItemChange('inspection', index, 'notes', e.target.value)}
                          rows="2"
                          className="input-field"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 4: // Seguridad Eléctrica
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">TEST DE SEGURIDAD ELECTRICA - IRAM 62353 - 5.3</h3>
            {formData.safety_items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay items de seguridad eléctrica disponibles.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.safety_items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{item.item_label}</p>
                        {item.criteria && (
                          <p className="text-sm text-gray-600 mb-2 font-semibold">Criterio: {item.criteria}</p>
                        )}
                        {item.result === 'pass' && item.value && (
                          <p className="text-sm text-gray-600">Valor medido: {item.value}</p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-gray-500 italic mt-2">Nota: {item.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleItemChange('safety', index, 'result', 'pass')}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            item.result === 'pass'
                              ? 'bg-green-50 border-green-500 text-green-700'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          PASO
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange('safety', index, 'result', 'fail')}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            item.result === 'fail'
                              ? 'bg-red-50 border-red-500 text-red-700'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                        >
                          FALLO
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange('safety', index, 'result', 'na')}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            item.result === 'na'
                              ? 'bg-gray-50 border-gray-500 text-gray-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                    {(item.result === 'pass' || item.result === 'fail') && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <input
                          type="text"
                          placeholder="Valor medido (ej: 0.25Ω, 50μA)"
                          value={item.value}
                          onChange={(e) => handleItemChange('safety', index, 'value', e.target.value)}
                          className="input-field mb-2"
                        />
                        <textarea
                          placeholder="Notas (opcional)"
                          value={item.notes}
                          onChange={(e) => handleItemChange('safety', index, 'notes', e.target.value)}
                          rows="2"
                          className="input-field"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 5: // Performance
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">ENSAYO DE PERFORMANCE - IRAM 62353 - 5.4</h3>
            {formData.performance_items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay items de performance disponibles.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.performance_items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{item.item_label}</p>
                        {item.criteria && (
                          <p className="text-sm text-gray-600 mb-2">Criterio: {item.criteria}</p>
                        )}
                        {item.result === 'pass' && item.value && (
                          <p className="text-sm text-gray-600">Valor medido: {item.value}</p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-gray-500 italic mt-2">Nota: {item.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleItemChange('performance', index, 'result', 'pass')}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            item.result === 'pass'
                              ? 'bg-green-50 border-green-500 text-green-700'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          PASO
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange('performance', index, 'result', 'fail')}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            item.result === 'fail'
                              ? 'bg-red-50 border-red-500 text-red-700'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                        >
                          FALLO
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemChange('performance', index, 'result', 'na')}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            item.result === 'na'
                              ? 'bg-gray-50 border-gray-500 text-gray-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                    {(item.result === 'pass' || item.result === 'fail') && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <input
                          type="text"
                          placeholder="Valor medido (opcional)"
                          value={item.value}
                          onChange={(e) => handleItemChange('performance', index, 'value', e.target.value)}
                          className="input-field mb-2"
                        />
                        <textarea
                          placeholder="Notas (opcional)"
                          value={item.notes}
                          onChange={(e) => handleItemChange('performance', index, 'notes', e.target.value)}
                          rows="2"
                          className="input-field"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 6: // Repuestos
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">REPUESTOS</h3>
            <textarea
              name="spare_parts"
              value={formData.spare_parts}
              onChange={handleChange}
              rows="6"
              className="input-field"
              placeholder="Listar repuestos utilizados (ej: Batería 12V 4.5Ah, etc.)"
            />
          </div>
        )

      case 7: // Observaciones
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">OBSERVACIONES</h3>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              rows="8"
              className="input-field"
              placeholder="Observaciones generales del ensayo..."
            />
          </div>
        )

      case 8: // Finalizar
        const totalItems = formData.inspection_items.length + formData.safety_items.length + formData.performance_items.length
        const passedItems = [
          ...formData.inspection_items,
          ...formData.safety_items,
          ...formData.performance_items
        ].filter(item => item.result === 'pass').length
        const failedItems = [
          ...formData.inspection_items,
          ...formData.safety_items,
          ...formData.performance_items
        ].filter(item => item.result === 'fail').length

        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Resumen del Ensayo</h3>
            <div className="card">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{passedItems}</p>
                  <p className="text-sm text-gray-600">Aprobados</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-700">{failedItems}</p>
                  <p className="text-sm text-gray-600">Fallidos</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resultado Final
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

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Al finalizar, se generará automáticamente el PDF con todos los datos del ensayo.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nuevo Ensayo - Paso a Paso</h2>
            <p className="text-sm text-gray-600 mt-1">
              Paso {currentStep + 1} de {steps.length}: {steps[currentStep]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  index < currentStep
                    ? 'bg-primary-600'
                    : index === currentStep
                    ? 'bg-primary-400'
                    : 'bg-gray-200'
                }`}
                title={step}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Finalizar y Generar PDF
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestWizard

