import { useState, useEffect } from 'react'
import { clientsService } from '../services/clientsService'
import { Users, Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import ClientForm from '../components/Clients/ClientForm'
import ClientModal from '../components/Clients/ClientModal'

const Clients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [viewingClient, setViewingClient] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await clientsService.getAll()
      setClients(data)
    } catch (err) {
      setError('Error al cargar clientes: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadClients()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await clientsService.search(searchTerm)
      setClients(data)
    } catch (err) {
      setError('Error al buscar clientes: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingClient(null)
    setShowForm(true)
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) {
      return
    }

    try {
      await clientsService.delete(id)
      await loadClients()
    } catch (err) {
      setError('Error al eliminar cliente: ' + err.message)
      console.error(err)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingClient(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadClients()
  }

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      client.name?.toLowerCase().includes(term) ||
      client.contact_name?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.includes(term)
    )
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestiona tu base de datos de clientes</p>
        </div>
        <button 
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
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
              placeholder="Buscar por nombre, contacto, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={handleSearch}
            className="btn-secondary"
          >
            Buscar
          </button>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                loadClients()
              }}
              className="btn-secondary"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreate}
                className="btn-primary mt-4"
              >
                Crear primer cliente
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contacto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Teléfono</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ciudad</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{client.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {client.contact_name || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {client.email || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {client.phone || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {client.city || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setViewingClient(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
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

        {!loading && filteredClients.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {filteredClients.length} {filteredClients.length === 1 ? 'cliente' : 'clientes'}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <ClientForm
          client={editingClient}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal de visualización */}
      {viewingClient && (
        <ClientModal
          client={viewingClient}
          onClose={() => setViewingClient(null)}
        />
      )}
    </div>
  )
}

export default Clients
