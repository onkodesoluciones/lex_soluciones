-- Migración: Agregar campos adicionales a la tabla tests
-- Para soportar el wizard paso a paso con toda la información de la planilla

ALTER TABLE tests
ADD COLUMN IF NOT EXISTS institution VARCHAR(255),
ADD COLUMN IF NOT EXISTS sector VARCHAR(255),
ADD COLUMN IF NOT EXISTS instruments JSONB,
ADD COLUMN IF NOT EXISTS maintenance_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS spare_parts TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN tests.institution IS 'Institución donde se realizó el ensayo';
COMMENT ON COLUMN tests.sector IS 'Sector/ubicación dentro de la institución';
COMMENT ON COLUMN tests.instruments IS 'JSON con lista de instrumentos utilizados';
COMMENT ON COLUMN tests.maintenance_type IS 'Tipo de mantenimiento: preventive o corrective';
COMMENT ON COLUMN tests.spare_parts IS 'Repuestos utilizados durante el ensayo';

