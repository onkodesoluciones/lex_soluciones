import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #0ea5e9',
    paddingBottom: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoImage: {
    width: 160,
    height: 'auto',
    maxHeight: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0ea5e9',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  presupuestoNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
    color: '#333',
  },
  validUntil: {
    fontSize: 10,
    textAlign: 'right',
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  remitenteSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e3f2fd',
    border: '1 solid #2196f3',
  },
  clientSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0ea5e9',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: '25%',
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    width: '75%',
    color: '#666',
  },
  status: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#fff3cd',
    border: '1 solid #ffc107',
    textAlign: 'center',
    fontSize: 9,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0ea5e9',
    color: 'white',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #ddd',
  },
  colDescription: {
    width: '40%',
  },
  colQuantity: {
    width: '15%',
    textAlign: 'right',
  },
  colUnit: {
    width: '15%',
    textAlign: 'center',
  },
  colPrice: {
    width: '15%',
    textAlign: 'right',
  },
  colTotal: {
    width: '15%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  totals: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    border: '1 solid #ddd',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 11,
    color: '#666',
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #0ea5e9',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e3f2fd',
    border: '1 solid #2196f3',
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1 solid #ddd',
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
  },
})

const PresupuestoPDF = ({ presupuesto, client, logoBase64 }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    // Si la fecha viene en formato YYYY-MM-DD, parsearla directamente sin zona horaria
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    // Para otros formatos, usar el método normal pero ajustar a hora local
    const date = new Date(dateString)
    // Ajustar a hora local para evitar problemas de zona horaria
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    return localDate.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0,00'
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'PENDIENTE',
      accepted: 'ACEPTADO',
      rejected: 'RECHAZADO',
      expired: 'VENCIDO'
    }
    return statusMap[status] || status.toUpperCase()
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {logoBase64 ? (
              <Image src={logoBase64} style={styles.logoImage} />
            ) : (
              <>
                <Text style={styles.title}>LEX</Text>
                <Text style={styles.subtitle}>Espacios Cardioseguros</Text>
              </>
            )}
          </View>
          <Text style={styles.presupuestoNumber}>PRESUPUESTO N° {presupuesto.presupuesto_number}</Text>
          {presupuesto.valid_until && (
            <Text style={styles.validUntil}>
              Válido hasta: {formatDate(presupuesto.valid_until)}
            </Text>
          )}
        </View>

        {/* Información del Remitente */}
        <View style={styles.remitenteSection}>
          <Text style={styles.sectionTitle}>DATOS DEL REMITENTE</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Razón Social:</Text>
            <Text style={styles.infoValue}>LEX SERVICIOS INTEGRALES S.R.L</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CUIT:</Text>
            <Text style={styles.infoValue}>30-71919692-2</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dirección:</Text>
            <Text style={styles.infoValue}>Urquiza 3817-Olavarria</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>info@lexserviciosintegrales.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>2284-717419</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Web:</Text>
            <Text style={styles.infoValue}>www.lexserviciosintegrales.com.ar</Text>
          </View>
        </View>

        {/* Información del Cliente */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoValue}>{client?.name || '-'}</Text>
          </View>
          {client?.address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>{client.address}</Text>
            </View>
          )}
          {(client?.city || client?.province) && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Localidad:</Text>
              <Text style={styles.infoValue}>
                {client.city || ''} {client.province ? `, ${client.province}` : ''}
              </Text>
            </View>
          )}
          {client?.tax_id && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CUIT:</Text>
              <Text style={styles.infoValue}>{client.tax_id}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>{formatDate(presupuesto.date)}</Text>
          </View>
          <View style={styles.status}>
            Estado: {getStatusText(presupuesto.status)}
          </View>
        </View>

        {/* Tabla de Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Descripción</Text>
            <Text style={styles.colQuantity}>Cantidad</Text>
            <Text style={styles.colUnit}>Unidad</Text>
            <Text style={styles.colPrice}>Precio Unit.</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {presupuesto.items && presupuesto.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unit_price)}</Text>
              <Text style={styles.colTotal}>
                {formatCurrency(item.quantity * item.unit_price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(presupuesto.subtotal || 0)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              IVA ({presupuesto.tax_rate ? `${presupuesto.tax_rate}%` : '21%'}):
            </Text>
            <Text style={styles.totalValue}>{formatCurrency(presupuesto.tax || 0)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(presupuesto.total || 0)}</Text>
          </View>
        </View>

        {/* Notas */}
        {presupuesto.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>NOTAS Y CONDICIONES:</Text>
            <Text>{presupuesto.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Documento no válido como factura</Text>
          <Text style={{ fontWeight: 'bold' }}>LEX SERVICIOS INTEGRALES S.R.L</Text>
        </View>
      </Page>
    </Document>
  )
}

export default PresupuestoPDF

