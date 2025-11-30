-- Agregar campo next_test_date a la tabla tests
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS next_test_date DATE;

-- Crear índice para mejorar las consultas de ensayos próximos
CREATE INDEX IF NOT EXISTS idx_tests_next_test_date ON tests(next_test_date);

-- Comentario
COMMENT ON COLUMN tests.next_test_date IS 'Fecha del próximo ensayo programado para este equipo';

