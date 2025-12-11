-- Migración: Agregar campos para equipos nuevos y ya instalados
-- Para EQUIPOS NUEVOS: fecha_instalacion, periodo_garantia
-- Para EQUIPOS YA INSTALADOS: año_fabricacion, primera_intervencion_lex

ALTER TABLE defibrillators
ADD COLUMN IF NOT EXISTS periodo_garantia VARCHAR(50),
ADD COLUMN IF NOT EXISTS año_fabricacion INTEGER,
ADD COLUMN IF NOT EXISTS primera_intervencion_lex DATE;

COMMENT ON COLUMN defibrillators.periodo_garantia IS 'Período de garantía para equipos nuevos (ej: "12 meses", "24 meses")';
COMMENT ON COLUMN defibrillators.año_fabricacion IS 'Año de fabricación para equipos ya instalados';
COMMENT ON COLUMN defibrillators.primera_intervencion_lex IS 'Fecha de la primera intervención realizada por LEX para equipos ya instalados';

