import { useState, useEffect } from 'react'
import { purchasesService } from '../services/purchasesService'
import { ShoppingCart, Plus, Search, Edit, Trash2, DollarSign, Package, Calendar } from 'lucide-react'
import PurchaseForm from '../components/Purchases/PurchaseForm'
import { formatCurrency } from '../utils/formatCurrency'

const Purchases = () => {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState(null)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadPurchases()
    loadStats()
  }, [])

  const loadPurchases = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await purchasesService.getAll()
      setPurchases(data)
    } catch (err) {
      setError('Error al cargar compras: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await purchasesService.getStats()
      setStats(statsData)
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
    }
  }

  const handleCreate = () => {
    setEditingPurchase(null)
    setShowForm(true)
  }

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta compra? El stock se revertirá automáticamente.')) {
      return
    }

    try {
      await purchasesService.delete(id)
      await loadPurchases()
      await loadStats()
    } catch (err) {
      setError('Error al eliminar compra: ' + err.message)
      console.error(err)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPurchase(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadPurchases()
    loadStats()
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const filteredPurchases = purchases.filter(purchase => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const itemName = purchase.inventory?.name?.toLowerCase() || ''
    const supplier = purchase.supplier?.toLowerCase() || ''
    const category = purchase.inventory?.category?.toLowerCase() || ''
    return (
      itemName.includes(term) ||
      supplier.includes(term) ||
      category.includes(term)
    )
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compras Históricas</h1>
          <p className="text-gray-600 mt-1">Registra y gestiona las compras de equipos y repuestos</p>
        </div>
        <button 
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Compra
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Compras</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gastado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cantidad Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="card mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por item, proveedor o categoría..."
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

      {/* Lista de compras */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando compras...</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No se encontraron compras' : 'No hay compras registradas'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreate}
                className="btn-primary mt-4"
              >
                Registrar primera compra
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoría</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Cantidad</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Precio Unit.</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Proveedor</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr 
                    key={purchase.id} 
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{formatDate(purchase.purchase_date)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {purchase.inventory?.name || '-'}
                      </div>
                      {purchase.inventory?.unit && (
                        <div className="text-xs text-gray-500">
                          Unidad: {purchase.inventory.unit}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {purchase.inventory?.category || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {parseFloat(purchase.quantity).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatCurrency(purchase.unit_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {formatCurrency(purchase.total_price)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {purchase.supplier || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(purchase)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(purchase.id)}
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

        {!loading && filteredPurchases.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {filteredPurchases.length} {filteredPurchases.length === 1 ? 'compra' : 'compras'}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <PurchaseForm
          purchase={editingPurchase}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default Purchases

