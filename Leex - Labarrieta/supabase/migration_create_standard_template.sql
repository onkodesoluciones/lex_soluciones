-- Crear plantilla "estándar" con los items predefinidos IRAM 62353
-- Esta plantilla reemplaza los items hardcodeados en el código

INSERT INTO checklist_templates (name, description, is_generic, items, sections)
VALUES (
  'Estándar',
  'Plantilla estándar IRAM 62353 con todos los items predefinidos organizados por secciones',
  true,
  '[
    {"key": "inspection_1", "label": "Equipo limpio y descontaminado", "type": "checkbox", "section": "5.2"},
    {"key": "inspection_2", "label": "Presentes y Legibles los números de control, etiquetas y advertencias", "type": "checkbox", "section": "5.2"},
    {"key": "inspection_3", "label": "Gabinete", "type": "checkbox", "section": "5.2"},
    {"key": "inspection_4", "label": "Daños físicos en paletas, conector y traba paletas.", "type": "checkbox", "section": "5.2"},
    {"key": "inspection_5", "label": "Entrada de alimentación eléctrica.", "type": "checkbox", "section": "5.2"},
    {"key": "inspection_6", "label": "Cable de red", "type": "checkbox", "section": "5.2"},
    {"key": "inspection_7", "label": "Conectores externos pacientes (ECG, SPO2,NBP,EtCO2)", "type": "checkbox", "section": "5.2"},
    {"key": "inspection_8", "label": "Interruptores y fusibles", "type": "checkbox", "section": "5.2"},
    {"key": "inspection_9", "label": "Cables pacientes", "type": "checkbox", "section": "5.2"},
    {"key": "inspection_10", "label": "Indicadores y display - Pantalla", "type": "checkbox", "section": "5.2"},
    {"key": "inspection_11", "label": "Teclas y mando de control", "type": "checkbox", "section": "5.2"},
    {"key": "safety_1", "label": "Resistencia del conductor a tierra", "type": "checkbox", "section": "5.3", "criteria": "< 0,3Ω"},
    {"key": "safety_2", "label": "Corriente de Fuga de Chasis", "type": "checkbox", "section": "5.3", "criteria": "< 100μA NC / < 500μA NC"},
    {"key": "safety_3", "label": "Corriente de Fuga del Paciente", "type": "checkbox", "section": "5.3", "criteria": "< 100μA B & BF < 10µA C"},
    {"key": "safety_4", "label": "Corriente de Fuga Terminales Paciente - Prueba de Aislamiento (energía Parte Aplicada al Paciente)", "type": "checkbox", "section": "5.3", "criteria": "< 100μA BF < 10µA CF"},
    {"key": "safety_5", "label": "Prueba del Aislamiento (Opcional) 500V", "type": "checkbox", "section": "5.3", "criteria": "> 2MΩ"},
    {"key": "performance_1", "label": "Conmutación de fuentes de energía", "type": "checkbox", "section": "5.4"},
    {"key": "performance_2", "label": "Registro de ECG desde paletas y electrodos", "type": "checkbox", "section": "5.4"},
    {"key": "performance_3", "label": "Exactitud de F.C y amplitud desde paletas y electrodos", "type": "checkbox", "section": "5.4"},
    {"key": "performance_4", "label": "Verificación de sistemas de alarmas", "type": "checkbox", "section": "5.4"},
    {"key": "performance_5", "label": "Congelamiento de imagen", "type": "checkbox", "section": "5.4"},
    {"key": "performance_6", "label": "Verificar ausencia de ruido en el trazado de ECG", "type": "checkbox", "section": "5.4"},
    {"key": "performance_7", "label": "Indicador y volumen BIP de QRS", "type": "checkbox", "section": "5.4"},
    {"key": "performance_8", "label": "Verificación de registro de SPO2", "type": "checkbox", "section": "5.4"},
    {"key": "performance_9", "label": "Impresora, fecha y hora", "type": "checkbox", "section": "5.4"},
    {"key": "performance_10", "label": "Test interno del equipo", "type": "checkbox", "section": "5.4"},
    {"key": "performance_11", "label": "Descarga de 200J ± 10J conectado a red eléctrica", "type": "checkbox", "section": "5.4"},
    {"key": "performance_12", "label": "Tiempo de carga de a 360J conectado a red eléctrica", "type": "checkbox", "section": "5.4"},
    {"key": "performance_13", "label": "Descarga de 360J ± 18J a batería (repetir 5 veces)", "type": "checkbox", "section": "5.4"},
    {"key": "performance_14", "label": "Descarga de 300J ± 15J a batería", "type": "checkbox", "section": "5.4"},
    {"key": "performance_15", "label": "Descarga de 200J ± 10J a batería", "type": "checkbox", "section": "5.4"},
    {"key": "performance_16", "label": "Descarga de 100 J ± 5J a batería", "type": "checkbox", "section": "5.4"},
    {"key": "performance_17", "label": "Descarga de 50J ± 3J a batería", "type": "checkbox", "section": "5.4"},
    {"key": "performance_18", "label": "Descarga de 10J ± 1J", "type": "checkbox", "section": "5.4"},
    {"key": "performance_19", "label": "Autonomía y tiempo de carga a 360J a batería", "type": "checkbox", "section": "5.4"},
    {"key": "performance_20", "label": "Descarga interna automática", "type": "checkbox", "section": "5.4"},
    {"key": "performance_21", "label": "Modo sincronizado (entrega de energía y demora)", "type": "checkbox", "section": "5.4"},
    {"key": "performance_22", "label": "Sumario de eventos (modelos \"R\")", "type": "checkbox", "section": "5.4"},
    {"key": "performance_23", "label": "Reporte de desfibrilación (modelos \"R\")", "type": "checkbox", "section": "5.4"}
  ]'::jsonb,
  '{
    "5.2": {"title": "ENSAYO DE INSPECCION - IRAM 62353 - 5.2"},
    "5.3": {"title": "TEST DE SEGURIDAD ELECTRICA - IRAM 62353 - 5.3"},
    "5.4": {"title": "ENSAYO DE PERFORMANCE - IRAM 62353 - 5.4"}
  }'::jsonb
)
ON CONFLICT DO NOTHING;
