// Items predefinidos para ensayos IRAM 62353
// Estos items aparecen automáticamente en el wizard

export const defaultInspectionItems = [
  { item_key: 'inspection_1', item_label: 'Equipo limpio y descontaminado', section: 'inspection', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'inspection_2', item_label: 'Presentes y Legibles los números de control, etiquetas y advertencias', section: 'inspection', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'inspection_3', item_label: 'Gabinete', section: 'inspection', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'inspection_4', item_label: 'Daños físicos en paletas, conector y traba paletas.', section: 'inspection', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'inspection_5', item_label: 'Entrada de alimentación eléctrica.', section: 'inspection', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'inspection_6', item_label: 'Cable de red', section: 'inspection', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'inspection_7', item_label: 'Conectores externos pacientes (ECG, SPO2,NBP,EtCO2)', section: 'inspection', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'inspection_8', item_label: 'Interruptores y fusibles', section: 'inspection', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'inspection_9', item_label: 'Cables pacientes', section: 'inspection', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'inspection_10', item_label: 'Indicadores y display - Pantalla', section: 'inspection', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'inspection_11', item_label: 'Teclas y mando de control', section: 'inspection', criteria: '', result: null, value: '', notes: '' }
]

export const defaultSafetyItems = [
  { item_key: 'safety_1', item_label: 'Resistencia del conductor a tierra', section: 'safety', criteria: '< 0,3Ω', result: null, value: '', notes: '' },
  { item_key: 'safety_2', item_label: 'Corriente de Fuga de Chasis', section: 'safety', criteria: '< 100μA NC / < 500μA NC', result: null, value: '', notes: '' },
  { item_key: 'safety_3', item_label: 'Corriente de Fuga del Paciente', section: 'safety', criteria: '< 100μA B & BF < 10µA C', result: null, value: '', notes: '' },
  { item_key: 'safety_4', item_label: 'Corriente de Fuga Terminales Paciente - Prueba de Aislamiento (energía Parte Aplicada al Paciente)', section: 'safety', criteria: '< 100μA BF < 10µA CF', result: null, value: '', notes: '' },
  { item_key: 'safety_5', item_label: 'Prueba del Aislamiento (Opcional) 500V', section: 'safety', criteria: '> 2MΩ', result: null, value: '', notes: '' }
]

export const defaultPerformanceItems = [
  { item_key: 'performance_1', item_label: 'Conmutación de fuentes de energía', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_2', item_label: 'Registro de ECG desde paletas y electrodos', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_3', item_label: 'Exactitud de F.C y amplitud desde paletas y electrodos', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_4', item_label: 'Verificación de sistemas de alarmas', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_5', item_label: 'Congelamiento de imagen', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_6', item_label: 'Verificar ausencia de ruido en el trazado de ECG', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_7', item_label: 'Indicador y volumen BIP de QRS', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_8', item_label: 'Verificación de registro de SPO2', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_9', item_label: 'Impresora, fecha y hora', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_10', item_label: 'Test interno del equipo', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_11', item_label: 'Descarga de 200J ± 10J conectado a red eléctrica', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_12', item_label: 'Tiempo de carga de a 360J conectado a red eléctrica', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_13', item_label: 'Descarga de 360J ± 18J a batería (repetir 5 veces)', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_14', item_label: 'Descarga de 300J ± 15J a batería', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_15', item_label: 'Descarga de 200J ± 10J a batería', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_16', item_label: 'Descarga de 100 J ± 5J a batería', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_17', item_label: 'Descarga de 50J ± 3J a batería', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_18', item_label: 'Descarga de 10J ± 1J', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_19', item_label: 'Autonomía y tiempo de carga a 360J a batería', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_20', item_label: 'Descarga interna automática', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_21', item_label: 'Modo sincronizado (entrega de energía y demora)', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_22', item_label: 'Sumario de eventos (modelos "R")', section: 'performance', criteria: '', result: null, value: '', notes: '' },
  { item_key: 'performance_23', item_label: 'Reporte de desfibrilación (modelos "R")', section: 'performance', criteria: '', result: null, value: '', notes: '' }
]

