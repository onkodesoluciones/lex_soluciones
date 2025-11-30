import { Check, X } from 'lucide-react'

const DynamicChecklist = ({ items, onChange }) => {
  const handleCheck = (index, checked) => {
    onChange(index, 'checked', checked)
  }

  const handleValueChange = (index, value) => {
    onChange(index, 'value', value)
  }

  const handleNotesChange = (index, notes) => {
    onChange(index, 'notes', notes)
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
        >
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => handleCheck(index, !item.checked)}
              className={`mt-1 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                item.checked
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              {item.checked && <Check className="w-4 h-4" />}
            </button>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {item.item_label}
              </label>
              
              {/* Campo de valor si es necesario */}
              {item.value !== undefined && (
                <input
                  type="text"
                  value={item.value || ''}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  placeholder="Valor (opcional)"
                  className="input-field mb-2"
                />
              )}
              
              {/* Campo de notas */}
              <textarea
                value={item.notes || ''}
                onChange={(e) => handleNotesChange(index, e.target.value)}
                placeholder="Anotaciones (opcional)"
                rows="2"
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DynamicChecklist

