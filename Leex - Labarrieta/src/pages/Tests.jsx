import { useState, useEffect } from 'react'
import { testsService } from '../services/testsService'
import { defibrillatorsService } from '../services/defibrillatorsService'
import { checklistTemplatesService } from '../services/checklistTemplatesService'
import { ClipboardCheck, Plus, Search, Edit, Trash2, Download, FileText } from 'lucide-react'
import TestForm from '../components/Tests/TestForm'
import TestWizard from '../components/Tests/TestWizard'
import ChecklistTemplatesManager from '../components/Tests/ChecklistTemplatesManager'

const Tests = () => {
  const [tests, setTests] = useState([])
  const [defibrillators, setDefibrillators] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [testsData, defibrillatorsData, templatesData] = await Promise.all([
        testsService.getAll(),
        defibrillatorsService.getAll(),
        checklistTemplatesService.getAll()
      ])
      setTests(testsData)
      setDefibrillators(defibrillatorsData)
      setTemplates(templatesData)
    } catch (err) {
      setError('Error al cargar datos: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTest(null)
    setShowForm(true)
  }

  const handleEdit = async (test) => {
    try {
      setLoading(true)
      const fullTest = await testsService.getById(test.id)
      setEditingTest(fullTest)
      setShowForm(true)
    } catch (err) {
      setError('Error al cargar ensayo: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este ensayo?')) {
      return
    }

    try {
      await testsService.delete(id)
      await loadData()
    } catch (err) {
      setError('Error al eliminar ensayo: ' + err.message)
      console.error(err)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTest(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadData()
  }

  const filteredTests = tests.filter(test => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      test.defibrillators?.brand?.toLowerCase().includes(term) ||
      test.defibrillators?.model?.toLowerCase().includes(term) ||
      test.defibrillators?.serial_number?.toLowerCase().includes(term) ||
      test.defibrillators?.clients?.name?.toLowerCase().includes(term) ||
      test.technician_name?.toLowerCase().includes(term)
    )
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ensayos</h1>
          <p className="text-gray-600 mt-1">Gestiona los ensayos y check-lists de los equipos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Plantillas
          </button>
          <button
            onClick={() => setShowWizard(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Ensayo (Paso a Paso)
          </button>
          <button 
            onClick={handleCreate}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Ensayo (Rápido)
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="card mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente, equipo, técnico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="btn-secondary"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de ensayos */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando ensayos...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No se encontraron ensayos' : 'No hay ensayos registrados'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreate}
                className="btn-primary mt-4"
              >
                Crear primer ensayo
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Equipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Técnico</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Resultado</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(test.test_date).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {test.defibrillators?.clients?.name || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900">
                        {test.defibrillators?.brand} {test.defibrillators?.model}
                      </div>
                      {test.defibrillators?.serial_number && (
                        <div className="text-sm text-gray-500">
                          S/N: {test.defibrillators.serial_number}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {test.technician_name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        test.result === 'passed' 
                          ? 'bg-green-100 text-green-800' 
                          : test.result === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {test.result === 'passed' ? 'Aprobado' : 
                         test.result === 'failed' ? 'Rechazado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        {test.pdf_url && (
                          <a
                            href={test.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(test)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredTests.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {filteredTests.length} {filteredTests.length === 1 ? 'ensayo' : 'ensayos'}
          </div>
        )}
      </div>

      {/* Modal de wizard paso a paso */}
      {showWizard && (
        <TestWizard
          defibrillators={defibrillators}
          templates={templates}
          onClose={() => setShowWizard(false)}
          onSuccess={() => {
            setShowWizard(false)
            loadData()
          }}
        />
      )}

      {/* Modal de formulario */}
      {showForm && (
        <TestForm
          test={editingTest}
          defibrillators={defibrillators}
          templates={templates}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal de gestión de plantillas */}
      {showTemplates && (
        <ChecklistTemplatesManager
          onClose={() => {
            setShowTemplates(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

export default Tests

