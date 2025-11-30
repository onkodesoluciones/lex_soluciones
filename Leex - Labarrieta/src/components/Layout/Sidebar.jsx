import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Heart, 
  ClipboardCheck, 
  Package, 
  FileText,
  Menu
} from 'lucide-react'

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/clients', icon: Users, label: 'Clientes' },
    { path: '/defibrillators', icon: Heart, label: 'Desfibriladores' },
    { path: '/tests', icon: ClipboardCheck, label: 'Ensayos' },
    { path: '/inventory', icon: Package, label: 'Inventario' },
    { path: '/documents', icon: FileText, label: 'Documentos' },
  ]

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isOpen ? 'w-64' : 'w-0 lg:w-20'}
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="min-h-28 py-4 flex items-center justify-between px-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
            {isOpen && (
              <div className="flex items-center flex-1">
                <img 
                  src="/logo.svg" 
                  alt="LEX Logo" 
                  className="h-24 w-auto drop-shadow-sm"
                />
              </div>
            )}
            {!isOpen && (
              <div className="flex items-center justify-center w-full">
                <img 
                  src="/logo.svg" 
                  alt="LEX" 
                  className="h-20 w-auto drop-shadow-sm"
                />
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-2"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 mx-2 mb-1
                    rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-50 text-primary-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

