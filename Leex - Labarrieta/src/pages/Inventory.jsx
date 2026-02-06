import { useState, useEffect } from 'react'
import { inventoryService } from '../services/inventoryService'
import { Package, Plus, Search, Edit, Trash2, AlertTriangle, TrendingUp, TrendingDown, Minus, Download, X, FileText } from 'lucide-react'
import InventoryForm from '../components/Inventory/InventoryForm'
import InventoryMovementForm from '../components/Inventory/InventoryMovementForm'
import InventoryPDF from '../components/PDFs/InventoryPDF'
import { loadLogoAsBase64 } from '../utils/logoLoader'
import { generateAndDownloadPDF } from '../utils/pdfGenerator'

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showMovementForm, setShowMovementForm] = useState(false)
  const [showQuickAdjustModal, setShowQuickAdjustModal] = useState(false)
  const [quickAdjustData, setQuickAdjustData] = useState({ item: null, adjustment: 0, quantity: 1, reason: '' })
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

  const handleQuickAdjustClick = (item, adjustment) => {
    // Abrir modal para ingresar cantidad y motivo
    setQuickAdjustData({
      item: item,
      adjustment: adjustment,
      quantity: 1,
      reason: ''
    })
    setShowQuickAdjustModal(true)
  }

  const handleQuickAdjustConfirm = async () => {
    if (!quickAdjustData.quantity || parseFloat(quickAdjustData.quantity) <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }

    if (!quickAdjustData.reason.trim()) {
      setError('Debes ingresar un motivo para el movimiento')
      return
    }

    // Validar que no se intente disminuir más stock del disponible
    if (quickAdjustData.adjustment < 0) {
      const quantity = parseFloat(quickAdjustData.quantity)
      if (quantity > quickAdjustData.item.current_stock) {
        setError(`No hay suficiente stock. Stock disponible: ${quickAdjustData.item.current_stock} ${quickAdjustData.item.unit}`)
        return
      }
    }

    try {
      setError(null)
      await inventoryService.addMovement({
        inventory_id: quickAdjustData.item.id,
        movement_type: quickAdjustData.adjustment > 0 ? 'entry' : 'exit',
        quantity: parseFloat(quickAdjustData.quantity),
        reason: quickAdjustData.reason.trim(),
        reference_type: 'manual'
      })
      await loadInventory()
      setShowQuickAdjustModal(false)
      setQuickAdjustData({ item: null, adjustment: 0, quantity: 1, reason: '' })
    } catch (err) {
      setError('Error al ajustar stock: ' + err.message)
      console.error(err)
    }
  }

  const handleQuickAdjustCancel = () => {
    setShowQuickAdjustModal(false)
    setQuickAdjustData({ item: null, adjustment: 0, quantity: 1, reason: '' })
    setError(null)
  }

  const handleDownloadInventoryPDF = async () => {
    try {
      setError(null)
      const logoBase64 = await loadLogoAsBase64()
      
      // Generar y descargar PDF
      await generateAndDownloadPDF(
        <InventoryPDF inventory={inventory} logoBase64={logoBase64} />,
        `inventario_${new Date().toISOString().split('T')[0]}.pdf`
      )
    } catch (err) {
      setError('Error al generar PDF: ' + err.message)
      console.error(err)
    }
  }

  const handleDownloadMovements = async (item) => {
    try {
      setError(null)
      // Obtener todos los movimientos del item
      const movements = await inventoryService.getMovements(item.id)
      
      if (movements.length === 0) {
        setError('No hay movimientos registrados para este item')
        return
      }

      // Preparar datos para CSV
      // Usar punto y coma (;) como separador para Excel en español
      const csvHeaders = ['Fecha', 'Hora', 'Tipo', 'Cantidad', 'Motivo', 'Referencia', 'Creado por']
      
      const csvRows = movements.map(movement => {
        const dateObj = new Date(movement.created_at)
        // Separar fecha y hora para evitar comas
        const date = dateObj.toLocaleDateString('es-AR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        const time = dateObj.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit'
        })
        
        const type = movement.movement_type === 'entry' ? 'Entrada' :
                     movement.movement_type === 'exit' ? 'Salida' :
                     movement.movement_type === 'adjustment' ? 'Ajuste' : movement.movement_type
        
        const quantity = movement.movement_type === 'entry' ? `+${movement.quantity}` :
                        movement.movement_type === 'exit' ? `-${movement.quantity}` :
                        movement.quantity
        
        return [
          date,
          time,
          type,
          quantity,
          movement.reason || '-',
          movement.reference_type || '-',
          movement.created_by || '-'
        ]
      })

      // Función para escapar valores CSV correctamente
      const escapeCSV = (value) => {
        const stringValue = String(value || '')
        // Si contiene punto y coma, comillas o saltos de línea, envolver en comillas
        if (stringValue.includes(';') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }

      // Crear contenido CSV con punto y coma como separador
      const csvContent = [
        csvHeaders.join(';'),
        ...csvRows.map(row => row.map(escapeCSV).join(';'))
      ].join('\n')

      // Crear blob y descargar
      // Usar encoding UTF-8 con BOM para Excel
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `movimientos_${item.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Error al descargar movimientos: ' + err.message)
      console.error(err)
    }
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
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadInventoryPDF}
            className="btn-secondary flex items-center gap-2"
            disabled={loading || inventory.length === 0}
          >
            <FileText className="w-5 h-5" />
            Descargar PDF
          </button>
          <button 
            onClick={handleCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Item
          </button>
        </div>
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
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuickAdjustClick(item, -1)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Disminuir stock"
                              disabled={item.current_stock <= 0}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className={`font-medium min-w-[3rem] text-right ${
                              isLowStock ? 'text-yellow-600' : 'text-gray-900'
                            }`}>
                              {item.current_stock}
                            </span>
                            <button
                              onClick={() => handleQuickAdjustClick(item, 1)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Aumentar stock"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {item.min_stock}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {item.unit}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDownloadMovements(item)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Descargar movimientos de stock"
                          >
                            <Download className="w-4 h-4" />
                          </button>
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

      {/* Modal de ajuste rápido */}
      {showQuickAdjustModal && quickAdjustData.item && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {quickAdjustData.adjustment > 0 ? 'Aumentar Stock' : 'Disminuir Stock'}
              </h2>
              <button
                onClick={handleQuickAdjustCancel}
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

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Item</p>
                <p className="font-semibold text-gray-900">{quickAdjustData.item.name}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Stock actual: <span className="font-medium">{quickAdjustData.item.current_stock} {quickAdjustData.item.unit}</span>
                </p>
                {quickAdjustData.adjustment < 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Stock disponible: {quickAdjustData.item.current_stock} {quickAdjustData.item.unit}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quickAdjustData.quantity}
                    onChange={(e) => setQuickAdjustData(prev => ({ ...prev, quantity: e.target.value }))}
                    min="0.01"
                    step="0.01"
                    className="input-field flex-1"
                    placeholder="0.00"
                    autoFocus
                  />
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {quickAdjustData.item.unit}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {quickAdjustData.adjustment > 0 
                    ? 'Cantidad a agregar al stock' 
                    : 'Cantidad a descontar del stock'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo / Razón <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={quickAdjustData.reason}
                  onChange={(e) => setQuickAdjustData(prev => ({ ...prev, reason: e.target.value }))}
                  rows="4"
                  className="input-field"
                  placeholder={quickAdjustData.adjustment > 0 
                    ? "Ej: Compra de proveedor, Recepción de material, Ajuste de inventario..." 
                    : "Ej: Uso en ensayo, Reparación, Venta, Pérdida, Ajuste de inventario..."}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe para qué se utilizó o por qué se adquirió este {quickAdjustData.adjustment > 0 ? 'aumento' : 'disminución'} de stock
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleQuickAdjustCancel}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleQuickAdjustConfirm}
                  className="btn-primary"
                >
                  {quickAdjustData.adjustment > 0 ? 'Aumentar Stock' : 'Disminuir Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
