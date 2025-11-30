import { useState, useEffect } from 'react'
import { testsService } from '../../services/testsService'
import { format } from 'date-fns'
import { X, Download, Calendar, Wrench, FileText } from 'lucide-react'

const DefibrillatorLifeSheet = ({ lifeSheet, onClose }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [testsByYear, setTestsByYear] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lifeSheet?.defibrillator?.id) {
      loadTestsByYear()
    }
  }, [selectedYear, lifeSheet])

  const loadTestsByYear = async () => {
    if (!lifeSheet?.defibrillator?.id) return

    try {
      setLoading(true)
      const tests = await testsService.getByYear(lifeSheet.defibrillator.id, selectedYear)
      setTestsByYear(tests)
    } catch (err) {
      console.error('Error al cargar ensayos:', err)
    } finally {
      setLoading(false)
    }
  }

  const getAvailableYears = () => {
    if (!lifeSheet?.tests || lifeSheet.tests.length === 0) {
      return [new Date().getFullYear()]
    }
    const years = [...new Set(lifeSheet.tests.map(test => 
      new Date(test.test_date).getFullYear()
    ))]
    return years.sort((a, b) => b - a)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'dd/MM/yyyy')
  }

  const def = lifeSheet?.defibrillator
  const client = def?.clients

  if (!lifeSheet || !def) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Hoja de Vida del Equipo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Información del Equipo */}
          <div className="card mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Datos del Equipo</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Cliente</label>
                <p className="text-gray-900 font-medium mt-1">{client?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Marca</label>
                <p className="text-gray-900 mt-1">{def.brand}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Modelo</label>
                <p className="text-gray-900 mt-1">{def.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">N° Serie</label>
                <p className="text-gray-900 mt-1">{def.serial_number || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ubicación</label>
                <p className="text-gray-900 mt-1">{def.location || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <p className="mt-1">
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
                </p>
              </div>
              {def.installation_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Instalación</label>
                  <p className="text-gray-900 mt-1">{formatDate(def.installation_date)}</p>
                </div>
              )}
              {def.warranty_until && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Garantía hasta</label>
                  <p className="text-gray-900 mt-1">{formatDate(def.warranty_until)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Última y Próxima Intervención */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Última Intervención</h3>
              </div>
              {lifeSheet.lastIntervention ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Fecha:</span> {formatDate(lifeSheet.lastIntervention.intervention_date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tipo:</span> {lifeSheet.lastIntervention.type}
                  </p>
                  {lifeSheet.lastIntervention.technician_name && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Técnico:</span> {lifeSheet.lastIntervention.technician_name}
                    </p>
                  )}
                  {lifeSheet.lastIntervention.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {lifeSheet.lastIntervention.description}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No hay intervenciones registradas</p>
              )}
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Próxima Intervención</h3>
              </div>
              {lifeSheet.nextIntervention ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Fecha:</span> {formatDate(lifeSheet.nextIntervention.next_intervention_date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tipo:</span> {lifeSheet.nextIntervention.type}
                  </p>
                  {lifeSheet.nextIntervention.technician_name && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Técnico:</span> {lifeSheet.nextIntervention.technician_name}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No hay intervenciones programadas</p>
              )}
            </div>
          </div>

          {/* Historial de Ensayos */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Historial de Ensayos</h3>
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input-field w-auto"
              >
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : testsByYear.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay ensayos registrados para el año {selectedYear}
              </p>
            ) : (
              <div className="space-y-3">
                {testsByYear.map((test) => (
                  <div
                    key={test.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          Ensayo del {formatDate(test.test_date)}
                        </p>
                        {test.technician_name && (
                          <p className="text-sm text-gray-600 mt-1">
                            Técnico: {test.technician_name}
                          </p>
                        )}
                        {test.observations && (
                          <p className="text-sm text-gray-600 mt-2">
                            {test.observations}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.result === 'passed' 
                            ? 'bg-green-100 text-green-800' 
                            : test.result === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {test.result === 'passed' ? 'Aprobado' : 
                           test.result === 'failed' ? 'Rechazado' : 'Pendiente'}
                        </span>
                        {test.pdf_url && (
                          <a
                            href={test.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default DefibrillatorLifeSheet

