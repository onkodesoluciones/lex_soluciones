import { useState, useEffect } from 'react'
import { inventoryService } from '../services/inventoryService'
import { Package, Plus, Search, Edit, Trash2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import InventoryForm from '../components/Inventory/InventoryForm'
import InventoryMovementForm from '../components/Inventory/InventoryMovementForm'

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showMovementForm, setShowMovementForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await inventoryService.getAll()
      setInventory(data)
    } catch (err) {
      setError('Error al cargar inventario: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleMovement = (item) => {
    setSelectedItem(item)
    setShowMovementForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este item del inventario?')) {
      return
    }

    try {
      await inventoryService.delete(id)
      await loadInventory()
    } catch (err) {
      setError('Error al eliminar item: ' + err.message)
      console.error(err)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const handleMovementFormClose = () => {
    setShowMovementForm(false)
    setSelectedItem(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadInventory()
  }

  const handleMovementSuccess = () => {
    handleMovementFormClose()
    loadInventory()
  }

  const filteredInventory = inventory.filter(item => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      item.name?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.supplier?.toLowerCase().includes(term)
    )
  })

  const lowStockItems = filteredInventory.filter(item => 
    item.current_stock <= item.min_stock
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-1">Gestiona el stock de insumos y materiales</p>
        </div>
        <button 
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Item
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Alertas de stock bajo */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>
            <strong>{lowStockItems.length}</strong> {lowStockItems.length === 1 ? 'item' : 'items'} con stock bajo
          </span>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="card mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción, categoría o proveedor..."
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

      {/* Lista de inventario */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando inventario...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No se encontraron items' : 'No hay items en el inventario'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreate}
                className="btn-primary mt-4"
              >
                Agregar primer item
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoría</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Stock Actual</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Stock Mín.</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Unidad</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Costo Unit.</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const isLowStock = item.current_stock <= item.min_stock
                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        isLowStock ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500">{item.description}</div>
                        )}
                        {isLowStock && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 text-yellow-600" />
                            <span className="text-xs text-yellow-600">Stock bajo</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {item.category || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${
                          isLowStock ? 'text-yellow-600' : 'text-gray-900'
                        }`}>
                          {item.current_stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {item.min_stock}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {item.unit_cost ? `$${item.unit_cost.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleMovement(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Movimiento de stock"
                          >
                            {item.current_stock > 0 ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : (
                              <TrendingUp className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredInventory.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total: {filteredInventory.length} {filteredInventory.length === 1 ? 'item' : 'items'}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <InventoryForm
          item={editingItem}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal de movimiento */}
      {showMovementForm && selectedItem && (
        <InventoryMovementForm
          item={selectedItem}
          onClose={handleMovementFormClose}
          onSuccess={handleMovementSuccess}
        />
      )}
    </div>
  )
}

export default Inventory
