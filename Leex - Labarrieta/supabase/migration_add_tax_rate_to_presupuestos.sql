-- Agregar campo tax_rate a la tabla presupuestos para almacenar el porcentaje de IVA
-- Permite seleccionar entre 21% y 10.5%

ALTER TABLE presupuestos 
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 21;

-- Comentario para documentar el campo
COMMENT ON COLUMN presupuestos.tax_rate IS 'Porcentaje de IVA aplicado (21% o 10.5%)';
