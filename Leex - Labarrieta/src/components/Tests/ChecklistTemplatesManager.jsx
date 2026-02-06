import { useState, useEffect } from 'react'
import { checklistTemplatesService } from '../../services/checklistTemplatesService'
import { X, Plus, Edit, Trash2, Save } from 'lucide-react'

const ChecklistTemplatesManager = ({ onClose }) => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await checklistTemplatesService.getAll()
      setTemplates(data)
    } catch (err) {
      setError('Error al cargar plantillas: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setShowForm(true)
  }

  const handleEdit = (template) => {
    setEditingTemplate(template)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      return
    }

    try {
      await checklistTemplatesService.delete(id)
      await loadTemplates()
    } catch (err) {
      setError('Error al eliminar plantilla: ' + err.message)
      console.error(err)
    }
  }

  if (showForm) {
    return (
      <TemplateForm
        template={editingTemplate}
        onClose={() => {
          setShowForm(false)
          setEditingTemplate(null)
        }}
        onSuccess={() => {
          setShowForm(false)
          setEditingTemplate(null)
          loadTemplates()
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Plantillas de Check-list</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-end mb-4">
            <button
              onClick={handleCreate}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Plantilla
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay plantillas registradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        {template.is_generic && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Genérica
                          </span>
                        )}
                        {template.brand && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            {template.brand} {template.model}
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {Array.isArray(template.items) ? template.items.length : 0} items
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TemplateForm = ({ template, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    model: '',
    is_generic: false,
    items: [],
    sections: {} // { '5.1': { title: '...' }, '5.2': { title: '...' }, etc. }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newItemLabel, setNewItemLabel] = useState('')
  const [selectedSection, setSelectedSection] = useState('5.1')
  const [newSectionNumber, setNewSectionNumber] = useState('')
  const [editingSectionTitle, setEditingSectionTitle] = useState(null) // { section: '5.1', title: '...' }

  useEffect(() => {
    if (template) {
      // Inicializar secciones desde la plantilla o crear defaults
      const sections = template.sections || {}
      
      // Si no hay secciones definidas pero hay items, crear secciones basadas en los items
      if (Object.keys(sections).length === 0 && template.items) {
        const itemSections = new Set(template.items.map(item => item.section).filter(Boolean))
        itemSections.forEach(section => {
          if (!sections[section]) {
            sections[section] = { title: '' }
          }
        })
      }
      
      setFormData({
        name: template.name || '',
        description: template.description || '',
        brand: template.brand || '',
        model: template.model || '',
        is_generic: template.is_generic || false,
        items: template.items || [],
        sections: sections
      })
      
      // Si hay items, seleccionar la primera sección que tenga items
      if (template.items && template.items.length > 0) {
        const firstSection = template.items.find(item => item.section)?.section || '5.1'
        setSelectedSection(firstSection)
      }
    } else {
      // Plantilla nueva: inicializar con secciones por defecto
      setFormData(prev => ({
        ...prev,
        sections: {
          '5.1': { title: '' },
          '5.2': { title: '' },
          '5.3': { title: '' },
          '5.4': { title: '' }
        }
      }))
    }
  }, [template])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddItem = () => {
    if (!newItemLabel.trim()) return

    const newItem = {
      key: `item_${Date.now()}`,
      label: newItemLabel.trim(),
      type: 'checkbox',
      section: selectedSection // Agregar la sección al item
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
    setNewItemLabel('')
  }

  const handleRemoveItem = (itemKey) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.key !== itemKey)
    }))
  }

  // Obtener todas las secciones (de items y de sections definidas)
  const getAllSections = () => {
    const sectionsFromItems = new Set(formData.items.map(item => item.section).filter(Boolean))
    const sectionsFromData = new Set(Object.keys(formData.sections || {}))
    const allSections = new Set([...sectionsFromItems, ...sectionsFromData])
    
    // Ordenar secciones numéricamente
    return Array.from(allSections).sort((a, b) => {
      // Si ambas son numéricas (5.x), ordenar numéricamente
      if (a.match(/^5\.\d+$/) && b.match(/^5\.\d+$/)) {
        return parseFloat(a) - parseFloat(b)
      }
      // Si solo una es numérica, la numérica va primero
      if (a.match(/^5\.\d+$/)) return -1
      if (b.match(/^5\.\d+$/)) return 1
      // Ambas son no numéricas, orden alfabético
      return a.localeCompare(b)
    })
  }

  const availableSections = getAllSections()

  // Agrupar items por sección para mostrar
  const itemsBySection = formData.items.reduce((acc, item) => {
    const section = item.section || '5.1' // Default a 5.1 si no tiene sección
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(item)
    return acc
  }, {})

  const handleAddSection = () => {
    if (!newSectionNumber.trim()) {
      setError('Debes ingresar un número de sección (ej: 5.5)')
      return
    }
    
    const section = newSectionNumber.trim()
    
    // Validar formato (debe ser algo como 5.5, 5.6, etc.)
    if (!section.match(/^5\.\d+$/)) {
      setError('El formato debe ser 5.X (ej: 5.5, 5.6)')
      return
    }
    
    if (formData.sections[section]) {
      setError('Esta sección ya existe')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: { title: '' }
      }
    }))
    
    setNewSectionNumber('')
    setSelectedSection(section)
    setError(null)
  }

  const handleUpdateSectionTitle = (section, title) => {
    setFormData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: { title: title.trim() }
      }
    }))
  }

  const handleRemoveSection = (section) => {
    // No permitir eliminar secciones que tienen items
    if (itemsBySection[section] && itemsBySection[section].length > 0) {
      setError(`No puedes eliminar la sección ${section} porque tiene items. Elimina primero los items.`)
      return
    }
    
    setFormData(prev => {
      const newSections = { ...prev.sections }
      delete newSections[section]
      return {
        ...prev,
        sections: newSections
      }
    })
    
    // Si la sección eliminada estaba seleccionada, seleccionar otra
    if (selectedSection === section && availableSections.length > 1) {
      const index = availableSections.indexOf(section)
      const newIndex = index > 0 ? index - 1 : 0
      setSelectedSection(availableSections[newIndex] || availableSections[0])
    }
    
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    if (formData.items.length === 0) {
      setError('Debes agregar al menos un item al check-list')
      return
    }

    try {
      setLoading(true)
      const submitData = {
        ...formData,
        brand: formData.is_generic ? null : formData.brand,
        model: formData.is_generic ? null : formData.model
      }

      if (template) {
        await checklistTemplatesService.update(template.id, submitData)
      } else {
        await checklistTemplatesService.create(submitData)
      }
      onSuccess()
    } catch (err) {
      setError('Error al guardar plantilla: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
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

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="input-field"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_generic"
                checked={formData.is_generic}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium text-gray-700">
                Plantilla genérica (para equipos sin plantilla específica)
              </label>
            </div>

            {!formData.is_generic && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Items del Check-list por Sección</h3>
              
              {/* Gestión de secciones */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Gestionar Secciones
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSectionNumber}
                      onChange={(e) => setNewSectionNumber(e.target.value)}
                      placeholder="Ej: 5.5"
                      className="input-field text-sm w-24"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSection())}
                    />
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="btn-secondary text-sm whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Agregar Sección
                    </button>
                  </div>
                </div>
                
                {/* Lista de secciones con títulos editables */}
                <div className="space-y-2">
                  {availableSections.map((section) => {
                    const sectionData = formData.sections[section] || { title: '' }
                    const isEditing = editingSectionTitle?.section === section
                    
                    return (
                      <div key={section} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                        <span className="text-sm font-medium text-gray-700 w-16">Sección {section}:</span>
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={editingSectionTitle.title}
                              onChange={(e) => setEditingSectionTitle({ section, title: e.target.value })}
                              placeholder={`Título para sección ${section} (opcional)`}
                              className="input-field flex-1 text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateSectionTitle(section, editingSectionTitle.title)
                                  setEditingSectionTitle(null)
                                }
                                if (e.key === 'Escape') {
                                  setEditingSectionTitle(null)
                                }
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateSectionTitle(section, editingSectionTitle.title)
                                setEditingSectionTitle(null)
                              }}
                              className="btn-secondary text-xs px-2 py-1"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSectionTitle(null)}
                              className="btn-secondary text-xs px-2 py-1"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm text-gray-600">
                              {sectionData.title || `(Sin título - se mostrará como "Sección ${section}")`}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingSectionTitle({ section, title: sectionData.title || '' })}
                              className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title="Editar título"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {itemsBySection[section]?.length === 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSection(section)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar sección"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Selector de sección para agregar items */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sección para agregar items
                </label>
                <div className="flex gap-2 flex-wrap">
                  {availableSections.map((section) => {
                    const sectionData = formData.sections[section] || { title: '' }
                    const sectionLabel = sectionData.title || `Sección ${section}`
                    
                    return (
                      <button
                        key={section}
                        type="button"
                        onClick={() => setSelectedSection(section)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedSection === section
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={sectionData.title ? sectionData.title : undefined}
                      >
                        {sectionLabel}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Formulario para agregar items */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newItemLabel}
                    onChange={(e) => setNewItemLabel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                    placeholder={`Agregar item a Sección ${selectedSection}...`}
                    className="input-field w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn-secondary whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Agregar a {selectedSection}
                </button>
              </div>

              {/* Mostrar items agrupados por sección */}
              <div className="space-y-6">
                {availableSections.map((section) => {
                  const sectionItems = itemsBySection[section] || []
                  const sectionData = formData.sections[section] || { title: '' }
                  const sectionTitle = sectionData.title || `Sección ${section}`
                  
                  if (sectionItems.length === 0 && formData.items.length > 0) {
                    // Solo mostrar secciones vacías si hay items en otras secciones
                    return null
                  }
                  
                  return (
                    <div key={section} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-semibold text-gray-900">
                          {sectionTitle}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {sectionItems.length} {sectionItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      
                      {sectionItems.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">
                          No hay items en esta sección
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {sectionItems.map((item) => (
                            <div
                              key={item.key}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <span className="text-sm text-gray-900">{item.label}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.key)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar item"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {/* Mostrar mensaje si no hay items */}
                {formData.items.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No hay items agregados. Selecciona una sección y agrega items.</p>
                  </div>
                )}
              </div>
            </div>
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
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : template ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChecklistTemplatesManager

