import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 15,
  },
  logoContainer: {
    alignItems: 'flex-start',
    marginBottom: 10,
    flexDirection: 'row',
    gap: 10,
  },
  logoImage: {
    width: 160,
    height: 'auto',
    maxHeight: 100,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 2,
  },
  logoSubtitle: {
    fontSize: 8,
    color: '#333',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
    color: '#333',
  },
  sectionHeader: {
    backgroundColor: '#0ea5e9',
    color: 'white',
    padding: 6,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  table: {
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #ddd',
    paddingVertical: 5,
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    fontSize: 8,
    paddingVertical: 6,
  },
  tableCell: {
    paddingHorizontal: 4,
    fontSize: 8,
    paddingVertical: 2,
  },
  colName: { width: '30%' },
  colCategory: { width: '15%' },
  colStock: { width: '12%' },
  colMinStock: { width: '12%' },
  colUnit: { width: '10%' },
  colSupplier: { width: '21%' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 25,
    right: 25,
    textAlign: 'center',
    fontSize: 7,
    color: '#666',
    borderTop: '1 solid #ddd',
    paddingTop: 5,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    marginBottom: 10,
    border: '1 solid #ddd',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: '40%',
  },
  infoValue: {
    width: '60%',
  },
  lowStockIndicator: {
    color: '#d97706',
    fontWeight: 'bold',
  },
})

const InventoryPDF = ({ inventory, logoBase64 }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    // Si la fecha viene en formato YYYY-MM-DD, parsearla directamente sin zona horaria
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
    // Para otros formatos, usar el método normal pero ajustar a hora local
    const date = new Date(dateString)
    // Ajustar a hora local para evitar problemas de zona horaria
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    return localDate.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Agrupar por categoría
  const groupedByCategory = inventory.reduce((acc, item) => {
    const category = item.category || 'Sin categoría'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {})

  const categories = Object.keys(groupedByCategory).sort()

  // Calcular estadísticas
  const totalItems = inventory.length
  const lowStockItems = inventory.filter(item => item.current_stock <= item.min_stock).length
  const totalStock = inventory.reduce((sum, item) => sum + parseFloat(item.current_stock || 0), 0)

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header con Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {logoBase64 ? (
              <Image src={logoBase64} style={styles.logoImage} />
            ) : (
              <>
                <Text style={styles.logoText}>LEX</Text>
                <Text style={styles.logoSubtitle}>Servicios integrales para instituciones sanitarias</Text>
              </>
            )}
          </View>
        </View>

        {/* Título Principal */}
        <Text style={styles.mainTitle}>
          INVENTARIO DE EQUIPOS Y REPUESTOS
        </Text>

        {/* Información General */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de generación:</Text>
            <Text style={styles.infoValue}>{new Date().toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total de items:</Text>
            <Text style={styles.infoValue}>{totalItems}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Items con stock bajo:</Text>
            <Text style={styles.infoValue}>{lowStockItems}</Text>
          </View>
        </View>

        {/* Tabla de Inventario por Categoría */}
        {categories.map((category, catIndex) => (
          <View key={catIndex} style={{ marginBottom: 15, break: false }}>
            <Text style={styles.sectionHeader}>{category.toUpperCase()}</Text>
            
            <View style={styles.table}>
              {/* Encabezados de tabla */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.colName]}>Item</Text>
                <Text style={[styles.tableCell, styles.colStock]}>Stock Actual</Text>
                <Text style={[styles.tableCell, styles.colMinStock]}>Stock Mín.</Text>
                <Text style={[styles.tableCell, styles.colUnit]}>Unidad</Text>
                <Text style={[styles.tableCell, styles.colSupplier]}>Proveedor</Text>
              </View>

              {/* Filas de datos */}
              {groupedByCategory[category].map((item, index) => {
                const isLowStock = item.current_stock <= item.min_stock
                return (
                  <View key={index} style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.colName]}>
                      <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                      {item.description && (
                        <Text style={{ fontSize: 7, color: '#666', marginTop: 2 }}>
                          {item.description}
                        </Text>
                      )}
                      {isLowStock && (
                        <Text style={[styles.lowStockIndicator, { fontSize: 7, marginTop: 2 }]}>
                          ⚠ Stock bajo
                        </Text>
                      )}
                    </View>
                    <Text style={[
                      styles.tableCell,
                      styles.colStock,
                      isLowStock && styles.lowStockIndicator
                    ]}>
                      {item.current_stock}
                    </Text>
                    <Text style={[styles.tableCell, styles.colMinStock]}>
                      {item.min_stock}
                    </Text>
                    <Text style={[styles.tableCell, styles.colUnit]}>
                      {item.unit || 'unidad'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colSupplier]}>
                      {item.supplier || '-'}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Documento generado el {new Date().toLocaleDateString('es-AR')}</Text>
          <Text>LEX SERVICIOS INTEGRALES S.R.L. | Sistema de Gestión</Text>
        </View>
      </Page>
    </Document>
  )
}

export default InventoryPDF
