import { useState, useEffect } from 'react'
import { clientsService } from '../services/clientsService'
import { defibrillatorsService } from '../services/defibrillatorsService'
import { testsService } from '../services/testsService'
import { inventoryService } from '../services/inventoryService'
import { interventionsService } from '../services/interventionsService'
import { Heart, Users, ClipboardCheck, Package, Calendar } from 'lucide-react'
import { format } from 'date-fns'

const Dashboard = () => {
  const [stats, setStats] = useState({
    clients: 0,
    defibrillators: 0,
    pendingTests: 0,
    inventoryItems: 0
  })
  const [upcomingInterventions, setUpcomingInterventions] = useState([])
  const [upcomingTests, setUpcomingTests] = useState([])
  const [recentTests, setRecentTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const [clients, defibrillators, tests, inventory, interventions, upcomingTestsData] = await Promise.all([
        clientsService.getAll(),
        defibrillatorsService.getAll(),
        testsService.getAll(),
        inventoryService.getAll(),
        interventionsService.getUpcoming(30),
        testsService.getUpcomingTests(30)
      ])

      const pendingTests = tests.filter(t => t.result === 'pending')

      setStats({
        clients: clients.length,
        defibrillators: defibrillators.length,
        pendingTests: pendingTests.length,
        inventoryItems: inventory.length
      })

      setUpcomingInterventions(interventions.slice(0, 5))
      setUpcomingTests(upcomingTestsData.slice(0, 5))
      setRecentTests(tests.slice(0, 5))
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.clients}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Desfibriladores</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.defibrillators}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ensayos Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.pendingTests}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Insumos en Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.inventoryItems}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de Ensayos Próximos */}
      {upcomingTests.length > 0 && (
        <div className="card bg-yellow-50 border-yellow-200 border-2 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-semibold text-yellow-900">⚠️ Ensayos Próximos</h2>
          </div>
          <div className="space-y-3">
            {upcomingTests.map((test) => {
              const testDate = new Date(test.next_test_date)
              const today = new Date()
              const daysUntil = Math.ceil((testDate - today) / (1000 * 60 * 60 * 24))
              const isUrgent = daysUntil <= 7
              
              return (
                <div
                  key={test.id}
                  className={`p-3 rounded-lg border ${
                    isUrgent 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-white border-yellow-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${isUrgent ? 'text-red-900' : 'text-yellow-900'}`}>
                        {test.defibrillators?.clients?.name || 'Sin cliente'}
                      </p>
                      <p className={`text-sm ${isUrgent ? 'text-red-700' : 'text-yellow-700'}`}>
                        {test.defibrillators?.brand} {test.defibrillators?.model}
                        {test.defibrillators?.serial_number && ` (S/N: ${test.defibrillators.serial_number})`}
                      </p>
                      <p className={`text-xs mt-1 ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
                        Último ensayo: {format(new Date(test.test_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
                        {format(new Date(test.next_test_date), 'dd/MM/yyyy')}
                      </p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        isUrgent 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {daysUntil === 0 ? 'Hoy' : 
                         daysUntil === 1 ? 'Mañana' : 
                         daysUntil <= 7 ? `En ${daysUntil} días` : 
                         `En ${daysUntil} días`}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Intervenciones próximas y Ensayos recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intervenciones Próximas */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Intervenciones Próximas</h2>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : upcomingInterventions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay intervenciones programadas</p>
          ) : (
            <div className="space-y-3">
              {upcomingInterventions.map((intervention) => (
                <div
                  key={intervention.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {intervention.defibrillators?.clients?.name || 'Sin cliente'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {intervention.defibrillators?.brand} {intervention.defibrillators?.model}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {intervention.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary-600">
                        {format(new Date(intervention.next_intervention_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ensayos Recientes */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Ensayos Recientes</h2>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : recentTests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay ensayos registrados</p>
          ) : (
            <div className="space-y-3">
              {recentTests.map((test) => (
                <div
                  key={test.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {test.defibrillators?.clients?.name || 'Sin cliente'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {test.defibrillators?.brand} {test.defibrillators?.model}
                      </p>
                      {test.technician_name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Técnico: {test.technician_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {format(new Date(test.test_date), 'dd/MM/yyyy')}
                      </p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        test.result === 'passed' 
                          ? 'bg-green-100 text-green-800' 
                          : test.result === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {test.result === 'passed' ? 'Aprobado' : 
                         test.result === 'failed' ? 'Rechazado' : 'Pendiente'}
                      </span>
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

export default Dashboard
