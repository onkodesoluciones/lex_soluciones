import { useState, useEffect } from 'react'
import { defibrillatorsService } from '../services/defibrillatorsService'
import { clientsService } from '../services/clientsService'
import { Heart, Plus, Search, Edit, Trash2, FileText, Calendar } from 'lucide-react'
import DefibrillatorForm from '../components/Defibrillators/DefibrillatorForm'
import DefibrillatorLifeSheet from '../components/Defibrillators/DefibrillatorLifeSheet'

const Defibrillators = () => {
  const [defibrillators, setDefibrillators] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('new') // 'new' o 'installed'
  const [showForm, setShowForm] = useState(false)
  const [editingDefibrillator, setEditingDefibrillator] = useState(null)
  const [equipmentType, setEquipmentType] = useState('new') // 'new' o 'installed'
  const [viewingLifeSheet, setViewingLifeSheet] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [defibrillatorsData, clientsData] = await Promise.all([
        defibrillatorsService.getAll(),
        clientsService.getAll()
      ])
      setDefibrillators(defibrillatorsData)
      setClients(clientsData)
    } catch (err) {
      setError('Error al cargar datos: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    // Búsqueda local por ahora
    if (!searchTerm.trim()) {
      loadData()
    }
  }

  const handleCreate = (type = 'new') => {
    setEditingDefibrillator(null)
    setEquipmentType(type)
    setShowForm(true)
  }

  const handleEdit = (defibrillator) => {
    setEditingDefibrillator(defibrillator)
    // Determinar tipo basado en los campos existentes
    const isNew = defibrillator.installation_date && defibrillator.periodo_garantia
    const isInstalled = defibrillator.año_fabricacion || defibrillator.primera_intervencion_lex
    setEquipmentType(isInstalled ? 'installed' : (isNew ? 'new' : 'new'))
    setShowForm(true)
  }

  const handleViewLifeSheet = async (id) => {
    try {
      setLoading(true)
      const lifeSheet = await defibrillatorsService.getLifeSheet(id)
      setViewingLifeSheet(lifeSheet)
    } catch (err) {
      setError('Error al cargar hoja de vida: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este desfibrilador?')) {
      return
    }

    try {
      await defibrillatorsService.delete(id)
      await loadData()
    } catch (err) {
      setError('Error al eliminar desfibrilador: ' + err.message)
      console.error(err)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingDefibrillator(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadData()
  }

  // Filtrar por tipo de equipo
  const getEquipmentType = (def) => {
    const hasNewFields = def.installation_date && def.periodo_garantia
    const hasInstalledFields = def.año_fabricacion || def.primera_intervencion_lex
    
    if (hasInstalledFields) return 'installed'
    if (hasNewFields) return 'new'
    // Si no tiene ninguno, lo consideramos "nuevo" por defecto
    return 'new'
  }

  const filteredDefibrillators = defibrillators.filter(def => {
    // Filtrar por tipo de equipo según la pestaña activa
    const type = getEquipmentType(def)
    if (activeTab === 'new' && type !== 'new') return false
    if (activeTab === 'installed' && type !== 'installed') return false
    
    // Filtrar por búsqueda
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      def.brand?.toLowerCase().includes(term) ||
      def.model?.toLowerCase().includes(term) ||
      def.serial_number?.toLowerCase().includes(term) ||
      def.location?.toLowerCase().includes(term) ||
      def.clients?.name?.toLowerCase().includes(term)
    )
  })

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Desfibriladores</h1>
            <p className="text-gray-600 mt-1">Gestiona los equipos de tus clientes</p>
          </div>
          <button 
            onClick={() => handleCreate(activeTab)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'new' ? 'Nuevo Equipo' : 'Equipo Instalado'}
          </button>
        </div>

        {/* Tabs para Equipos Nuevos / Ya Instalados */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'new'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Equipos Nuevos
          </button>
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'installed'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Equipos Ya Instalados
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
              placeholder="Buscar por marca, modelo, serie, ubicación o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                loadData()
              }}
              className="btn-secondary"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de desfibriladores */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando desfibriladores...</p>
          </div>
        ) : filteredDefibrillators.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No se encontraron desfibriladores' : 'No hay desfibriladores registrados'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreate}
                className="btn-primary mt-4"
              >
                Registrar primer desfibrilador
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Marca</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Modelo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">N° Serie</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ubicación</th>
                  {activeTab === 'new' ? (
                    <>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha Instalación</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Garantía</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Año Fabricación</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">1ra Intervención LEX</th>
                    </>
                  )}
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDefibrillators.map((def) => (
                  <tr key={def.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {def.clients?.name || 'Sin cliente'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{def.brand}</td>
                    <td className="py-3 px-4 text-gray-600">{def.model}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {def.serial_number || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {def.location || '-'}
                    </td>
                    {activeTab === 'new' ? (
                      <>
                        <td className="py-3 px-4 text-gray-600">
                          {def.installation_date ? new Date(def.installation_date).toLocaleDateString('es-AR') : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {def.periodo_garantia || '-'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 text-gray-600">
                          {def.año_fabricacion || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {def.primera_intervencion_lex ? new Date(def.primera_intervencion_lex).toLocaleDateString('es-AR') : '-'}
                        </td>
                      </>
                    )}
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        def.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : def.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {def.status === 'active' ? 'Activo' : 
                         def.status === 'maintenance' ? 'Mantenimiento' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewLifeSheet(def.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver hoja de vida"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(def)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(def.id)}
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

        {!loading && filteredDefibrillators.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {filteredDefibrillators.length} {filteredDefibrillators.length === 1 ? 'equipo' : 'equipos'}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <DefibrillatorForm
          defibrillator={editingDefibrillator}
          clients={clients}
          equipmentType={equipmentType}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal de hoja de vida */}
      {viewingLifeSheet && (
        <DefibrillatorLifeSheet
          lifeSheet={viewingLifeSheet}
          onClose={() => setViewingLifeSheet(null)}
        />
      )}
    </div>
  )
}

export default Defibrillators
