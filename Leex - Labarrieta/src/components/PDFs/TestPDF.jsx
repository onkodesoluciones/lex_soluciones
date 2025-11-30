import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 30,
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
    fontSize: 14,
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
    paddingVertical: 4,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableCell: {
    paddingHorizontal: 4,
    fontSize: 8,
  },
  col1: { width: '25%' },
  col2: { width: '20%' },
  col3: { width: '20%' },
  col4: { width: '15%' },
  col5: { width: '20%' },
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
    width: '30%',
  },
  infoValue: {
    width: '70%',
  },
  checkboxSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  checkboxHeader: {
    flexDirection: 'row',
    backgroundColor: '#0ea5e9',
    color: 'white',
    padding: 5,
    fontSize: 9,
    fontWeight: 'bold',
  },
  checkboxCol: {
    width: '10%',
    textAlign: 'center',
  },
  checkboxColLabel: {
    width: '70%',
  },
  checkboxItem: {
    flexDirection: 'row',
    borderBottom: '1 solid #eee',
    paddingVertical: 4,
    paddingHorizontal: 5,
    fontSize: 8,
  },
  checkbox: {
    width: 8,
    height: 8,
    border: '1 solid #333',
    marginHorizontal: 'auto',
  },
  checkboxChecked: {
    backgroundColor: '#333',
  },
  criteriaText: {
    fontSize: 7,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  valueText: {
    fontSize: 7,
    color: '#333',
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: '#fff3cd',
    border: '1 solid #ffc107',
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  notesTitle: {
    fontWeight: 'bold',
    fontSize: 9,
    marginBottom: 4,
  },
  sparePartsBox: {
    backgroundColor: '#e3f2fd',
    border: '1 solid #2196f3',
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1 solid #ddd',
    fontSize: 7,
    color: '#999',
    textAlign: 'center',
  },
})

const TestPDF = ({ test, defibrillator, client, template, items, logoBase64 }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Organizar items por sección
  const inspectionItems = items?.filter(item => 
    item.section === 'inspection' || 
    (!item.section && !item.item_label?.toLowerCase().includes('seguridad') && !item.item_label?.toLowerCase().includes('performance'))
  ) || []
  
  const safetyItems = items?.filter(item => 
    item.section === 'safety' || 
    item.item_label?.toLowerCase().includes('seguridad')
  ) || []
  
  const performanceItems = items?.filter(item => 
    item.section === 'performance' || 
    item.item_label?.toLowerCase().includes('performance')
  ) || []

  // Determinar resultado del item
  const getItemResult = (item) => {
    if (item.checked === true || item.result === 'pass') return 'pass'
    if (item.result === 'fail') return 'fail'
    if (item.result === 'na') return 'na'
    return null
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
          INFORME DE RESULTADO DE PRUEBAS NORMA IRAM 62353 - CARDIOVERSOR
        </Text>

        {/* Datos del Equipo */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>EQUIPO:</Text>
            <Text style={styles.infoValue}>Cardioversor {defibrillator?.brand} {defibrillator?.model}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MARCA:</Text>
            <Text style={styles.infoValue}>{defibrillator?.brand || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nº DE SERIE:</Text>
            <Text style={styles.infoValue}>{defibrillator?.serial_number || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MODELO:</Text>
            <Text style={styles.infoValue}>{defibrillator?.model || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Institución:</Text>
            <Text style={styles.infoValue}>{test.institution || client?.name || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sector:</Text>
            <Text style={styles.infoValue}>{test.sector || defibrillator?.location || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>{formatDate(test.test_date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Realizó:</Text>
            <Text style={styles.infoValue}>{test.technician_name || '-'}</Text>
          </View>
        </View>

        {/* Instrumental Utilizado */}
        {test.instruments && test.instruments.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>INSTRUMENTAL UTILIZADO</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.col1]}>INSTRUMENTAL UTILIZADO</Text>
                <Text style={[styles.tableCell, styles.col2]}>MARCA</Text>
                <Text style={[styles.tableCell, styles.col3]}>MODELO</Text>
                <Text style={[styles.tableCell, styles.col4]}>CALIBRACION</Text>
              </View>
              {test.instruments.map((instrument, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.col1]}>{instrument.name || '-'}</Text>
                  <Text style={[styles.tableCell, styles.col2]}>{instrument.brand || '-'}</Text>
                  <Text style={[styles.tableCell, styles.col3]}>{instrument.model || '-'}</Text>
                  <Text style={[styles.tableCell, styles.col4]}>
                    {instrument.calibrated ? '✓' : ''}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Motivo de Solicitud */}
        {test.maintenance_type && (
          <>
            <Text style={styles.sectionHeader}>MOTIVO DE SOLICITUD</Text>
            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {test.maintenance_type === 'preventive' ? '✓' : '☐'} Ensayos Post Mantenimiento Preventivo
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {test.maintenance_type === 'corrective' ? '✓' : '☐'} Ensayos Post Mantenimiento Correctivo
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Ensayo de Inspección - IRAM 62353 - 5.2 */}
        {inspectionItems.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>ENSAYO DE INSPECCION - IRAM 62353 - 5.2</Text>
            <View style={styles.checkboxSection}>
              <View style={styles.checkboxHeader}>
                <Text style={styles.checkboxCol}>PASO</Text>
                <Text style={styles.checkboxCol}>FALLO</Text>
                <Text style={styles.checkboxCol}>N/A</Text>
                <Text style={styles.checkboxColLabel}>ITEM</Text>
              </View>
              {inspectionItems.map((item, index) => {
                const result = getItemResult(item)
                return (
                  <View key={index} style={styles.checkboxItem}>
                    <View style={styles.checkboxCol}>
                      <View style={[styles.checkbox, result === 'pass' && styles.checkboxChecked]} />
                    </View>
                    <View style={styles.checkboxCol}>
                      <View style={[styles.checkbox, result === 'fail' && styles.checkboxChecked]} />
                    </View>
                    <View style={styles.checkboxCol}>
                      <View style={[styles.checkbox, result === 'na' && styles.checkboxChecked]} />
                    </View>
                    <View style={styles.checkboxColLabel}>
                      <Text>{item.item_label}</Text>
                      {item.value && (
                        <Text style={styles.valueText}>Valor: {item.value}</Text>
                      )}
                      {item.notes && (
                        <Text style={styles.criteriaText}>Nota: {item.notes}</Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          </>
        )}

        {/* Test de Seguridad Eléctrica - IRAM 62353 - 5.3 */}
        {safetyItems.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>TEST DE SEGURIDAD ELECTRICA - IRAM 62353 - 5.3</Text>
            <View style={styles.checkboxSection}>
              <View style={styles.checkboxHeader}>
                <Text style={styles.checkboxCol}>PASO</Text>
                <Text style={styles.checkboxCol}>FALLO</Text>
                <Text style={styles.checkboxCol}>N/A</Text>
                <Text style={styles.checkboxColLabel}>ITEM / CRITERIO</Text>
              </View>
              {safetyItems.map((item, index) => {
                const result = getItemResult(item)
                return (
                  <View key={index} style={styles.checkboxItem}>
                    <View style={styles.checkboxCol}>
                      <View style={[styles.checkbox, result === 'pass' && styles.checkboxChecked]} />
                    </View>
                    <View style={styles.checkboxCol}>
                      <View style={[styles.checkbox, result === 'fail' && styles.checkboxChecked]} />
                    </View>
                    <View style={styles.checkboxCol}>
                      <View style={[styles.checkbox, result === 'na' && styles.checkboxChecked]} />
                    </View>
                    <View style={styles.checkboxColLabel}>
                      <Text>{item.item_label}</Text>
                      {item.criteria && (
                        <Text style={styles.criteriaText}>Criterio: {item.criteria}</Text>
                      )}
                      {item.value && (
                        <Text style={styles.valueText}>Valor medido: {item.value}</Text>
                      )}
                      {item.notes && (
                        <Text style={styles.criteriaText}>Nota: {item.notes}</Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          </>
        )}

        {/* Ensayo de Performance - IRAM 62353 - 5.4 */}
        {performanceItems.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>ENSAYO DE PERFORMANCE - IRAM 62353 - 5.4</Text>
            <View style={styles.checkboxSection}>
              <View style={styles.checkboxHeader}>
                <Text style={styles.checkboxCol}>PASO</Text>
                <Text style={styles.checkboxCol}>FALLO</Text>
                <Text style={styles.checkboxCol}>N/A</Text>
                <Text style={styles.checkboxColLabel}>ITEM</Text>
              </View>
              {performanceItems.map((item, index) => {
                const result = getItemResult(item)
                return (
                  <View key={index} style={styles.checkboxItem}>
                    <View style={styles.checkboxCol}>
                      <View style={[styles.checkbox, result === 'pass' && styles.checkboxChecked]} />
                    </View>
                    <View style={styles.checkboxCol}>
                      <View style={[styles.checkbox, result === 'fail' && styles.checkboxChecked]} />
                    </View>
                    <View style={styles.checkboxCol}>
                      <View style={[styles.checkbox, result === 'na' && styles.checkboxChecked]} />
                    </View>
                    <View style={styles.checkboxColLabel}>
                      <Text>{item.item_label}</Text>
                      {item.criteria && (
                        <Text style={styles.criteriaText}>Criterio: {item.criteria}</Text>
                      )}
                      {item.value && (
                        <Text style={styles.valueText}>Valor: {item.value}</Text>
                      )}
                      {item.notes && (
                        <Text style={styles.criteriaText}>Nota: {item.notes}</Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          </>
        )}

        {/* Repuestos */}
        {test.spare_parts && (
          <>
            <Text style={styles.sectionHeader}>REPUESTOS</Text>
            <View style={styles.sparePartsBox}>
              <Text style={{ fontSize: 8 }}>{test.spare_parts}</Text>
            </View>
          </>
        )}

        {/* Observaciones */}
        {test.observations && (
          <>
            <Text style={styles.sectionHeader}>OBSERVACIONES</Text>
            <View style={styles.notesBox}>
              <Text style={{ fontSize: 8 }}>{test.observations}</Text>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Documento generado el {new Date().toLocaleDateString('es-AR')}</Text>
          <Text>LEX - Espacios Cardioseguros | Sistema de Gestión</Text>
        </View>
      </Page>
    </Document>
  )
}

export default TestPDF
