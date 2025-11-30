import { X } from 'lucide-react'

const ClientModal = ({ client, onClose }) => {
  if (!client) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Detalles del Cliente</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre / Razón Social</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{client.name}</p>
            </div>

            {client.contact_name && (
              <div>
                <label className="text-sm font-medium text-gray-500">Contacto</label>
                <p className="text-gray-900 mt-1">{client.contact_name}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {client.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1">{client.email}</p>
                </div>
              )}

              {client.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-gray-900 mt-1">{client.phone}</p>
                </div>
              )}
            </div>

            {client.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">Dirección</label>
                <p className="text-gray-900 mt-1">{client.address}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              {client.city && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ciudad</label>
                  <p className="text-gray-900 mt-1">{client.city}</p>
                </div>
              )}

              {client.province && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Provincia</label>
                  <p className="text-gray-900 mt-1">{client.province}</p>
                </div>
              )}

              {client.postal_code && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Código Postal</label>
                  <p className="text-gray-900 mt-1">{client.postal_code}</p>
                </div>
              )}
            </div>

            {client.tax_id && (
              <div>
                <label className="text-sm font-medium text-gray-500">CUIT / Tax ID</label>
                <p className="text-gray-900 mt-1">{client.tax_id}</p>
              </div>
            )}

            {client.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notas</label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <label className="font-medium">Creado</label>
                  <p className="mt-1">
                    {new Date(client.created_at).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {client.updated_at !== client.created_at && (
                  <div>
                    <label className="font-medium">Actualizado</label>
                    <p className="mt-1">
                      {new Date(client.updated_at).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientModal

