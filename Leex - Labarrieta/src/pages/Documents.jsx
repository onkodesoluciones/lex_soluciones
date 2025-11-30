import { useState, useEffect } from 'react'
import { documentsService } from '../services/documentsService'
import { formatCurrency } from '../utils/formatCurrency'
import { FileText, Plus, Download, Edit, Trash2 } from 'lucide-react'
import RemitoForm from '../components/Documents/RemitoForm'
import PresupuestoForm from '../components/Documents/PresupuestoForm'

const Documents = () => {
  const [showRemitoForm, setShowRemitoForm] = useState(false)
  const [showPresupuestoForm, setShowPresupuestoForm] = useState(false)
  const [remitos, setRemitos] = useState([])
  const [presupuestos, setPresupuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('remitos') // 'remitos' o 'presupuestos'
  const [editingRemito, setEditingRemito] = useState(null)
  const [editingPresupuesto, setEditingPresupuesto] = useState(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const [remitosData, presupuestosData] = await Promise.all([
        documentsService.getAllRemitos(),
        documentsService.getAllPresupuestos()
      ])
      setRemitos(remitosData)
      setPresupuestos(presupuestosData)
    } catch (err) {
      console.error('Error al cargar documentos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRemito = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este remito?')) {
      return
    }

    try {
      await documentsService.deleteRemito(id)
      await loadDocuments()
    } catch (err) {
      console.error('Error al eliminar remito:', err)
    }
  }

  const handleDeletePresupuesto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
      return
    }

    try {
      await documentsService.deletePresupuesto(id)
      await loadDocuments()
    } catch (err) {
      console.error('Error al eliminar presupuesto:', err)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600 mt-1">Genera remitos y presupuestos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRemitoForm(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Remito
          </button>
          <button
            onClick={() => setShowPresupuestoForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Presupuesto
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('remitos')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'remitos'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Remitos ({remitos.length})
          </button>
          <button
            onClick={() => setActiveTab('presupuestos')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'presupuestos'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Presupuestos ({presupuestos.length})
          </button>
        </div>
      </div>

      {/* Lista de Remitos */}
      {activeTab === 'remitos' && (
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Cargando remitos...</p>
            </div>
          ) : remitos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">No hay remitos registrados</p>
              <button
                onClick={() => setShowRemitoForm(true)}
                className="btn-primary"
              >
                Crear primer remito
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Número</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {remitos.map((remito) => (
                    <tr key={remito.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{remito.remito_number}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(remito.date).toLocaleDateString('es-AR')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {remito.clients?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(remito.total || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          {remito.pdf_url && (
                            <a
                              href={remito.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Descargar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setEditingRemito(remito)
                              setShowRemitoForm(true)
                            }}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRemito(remito.id)}
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
        </div>
      )}

      {/* Lista de Presupuestos */}
      {activeTab === 'presupuestos' && (
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Cargando presupuestos...</p>
            </div>
          ) : presupuestos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">No hay presupuestos registrados</p>
              <button
                onClick={() => setShowPresupuestoForm(true)}
                className="btn-primary"
              >
                Crear primer presupuesto
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Número</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {presupuestos.map((presupuesto) => (
                    <tr key={presupuesto.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{presupuesto.presupuesto_number}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(presupuesto.date).toLocaleDateString('es-AR')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {presupuesto.clients?.name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          presupuesto.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : presupuesto.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : presupuesto.status === 'expired'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {presupuesto.status === 'accepted' ? 'Aceptado' :
                           presupuesto.status === 'rejected' ? 'Rechazado' :
                           presupuesto.status === 'expired' ? 'Vencido' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(presupuesto.total || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          {presupuesto.pdf_url && (
                            <a
                              href={presupuesto.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Descargar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setEditingPresupuesto(presupuesto)
                              setShowPresupuestoForm(true)
                            }}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePresupuesto(presupuesto.id)}
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
        </div>
      )}

      {/* Modales */}
      {showRemitoForm && (
        <RemitoForm
          remito={editingRemito}
          onClose={() => {
            setShowRemitoForm(false)
            setEditingRemito(null)
          }}
          onSuccess={() => {
            setShowRemitoForm(false)
            setEditingRemito(null)
            loadDocuments()
          }}
        />
      )}

      {showPresupuestoForm && (
        <PresupuestoForm
          presupuesto={editingPresupuesto}
          onClose={() => {
            setShowPresupuestoForm(false)
            setEditingPresupuesto(null)
          }}
          onSuccess={() => {
            setShowPresupuestoForm(false)
            setEditingPresupuesto(null)
            loadDocuments()
          }}
        />
      )}
    </div>
  )
}

export default Documents
