-- Agregar campo result a la tabla test_items si no existe
ALTER TABLE test_items 
ADD COLUMN IF NOT EXISTS result VARCHAR(20); -- 'pass', 'fail', 'na', o NULL

-- Comentario
COMMENT ON COLUMN test_items.result IS 'Resultado del item: pass, fail, o na';

