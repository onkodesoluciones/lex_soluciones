-- Agregar campo section a test_items para identificar la sección del ensayo
ALTER TABLE test_items 
ADD COLUMN IF NOT EXISTS section VARCHAR(50);

-- Agregar campo criteria si no existe
ALTER TABLE test_items 
ADD COLUMN IF NOT EXISTS criteria TEXT;

-- Crear índice para búsquedas por sección
CREATE INDEX IF NOT EXISTS idx_test_items_section ON test_items(section);

