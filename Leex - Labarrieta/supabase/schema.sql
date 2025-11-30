-- ============================================
-- LEX - Sistema de Gestión Cardioseguros
-- Esquema de Base de Datos
-- ============================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: clients (Clientes)
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  tax_id VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: defibrillators (Desfibriladores)
-- ============================================
CREATE TABLE defibrillators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) UNIQUE,
  location VARCHAR(255),
  installation_date DATE,
  purchase_date DATE,
  warranty_until DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, maintenance, inactive
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: checklist_templates (Plantillas de Check-list)
-- ============================================
CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  brand VARCHAR(100), -- NULL para plantilla genérica
  model VARCHAR(100),
  is_generic BOOLEAN DEFAULT false,
  items JSONB NOT NULL, -- Array de items del check-list
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: tests (Ensayos)
-- ============================================
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  defibrillator_id UUID NOT NULL REFERENCES defibrillators(id) ON DELETE CASCADE,
  template_id UUID REFERENCES checklist_templates(id),
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  technician_name VARCHAR(255),
  observations TEXT,
  result VARCHAR(50) DEFAULT 'pending', -- pending, passed, failed
  pdf_url TEXT, -- URL del PDF generado en Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: test_items (Items completados del Check-list)
-- ============================================
CREATE TABLE test_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  item_key VARCHAR(100) NOT NULL, -- Key del item en el template
  item_label TEXT NOT NULL,
  checked BOOLEAN DEFAULT false,
  value TEXT, -- Valor si es un campo de texto/número
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: interventions (Intervenciones/Mantenimientos)
-- ============================================
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  defibrillator_id UUID NOT NULL REFERENCES defibrillators(id) ON DELETE CASCADE,
  intervention_date DATE NOT NULL,
  next_intervention_date DATE,
  type VARCHAR(100) NOT NULL, -- maintenance, repair, calibration, etc.
  description TEXT,
  technician_name VARCHAR(255),
  cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: inventory (Inventario/Stock)
-- ============================================
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  unit VARCHAR(50) DEFAULT 'unidad', -- unidad, kg, litro, etc.
  current_stock DECIMAL(10, 2) DEFAULT 0,
  min_stock DECIMAL(10, 2) DEFAULT 0,
  max_stock DECIMAL(10, 2),
  unit_cost DECIMAL(10, 2),
  supplier VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: inventory_movements (Movimientos de Stock)
-- ============================================
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL, -- entry, exit, adjustment
  quantity DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  reference_id UUID, -- ID de test, intervention, etc. si aplica
  reference_type VARCHAR(50), -- test, intervention, manual, etc.
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: remitos (Remitos)
-- ============================================
CREATE TABLE remitos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  remito_number VARCHAR(50) UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  items JSONB NOT NULL, -- Array de items del remito
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: presupuestos (Presupuestos)
-- ============================================
CREATE TABLE presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  presupuesto_number VARCHAR(50) UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  items JSONB NOT NULL, -- Array de items del presupuesto
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, expired
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para mejorar performance
-- ============================================
CREATE INDEX idx_defibrillators_client_id ON defibrillators(client_id);
CREATE INDEX idx_tests_defibrillator_id ON tests(defibrillator_id);
CREATE INDEX idx_tests_test_date ON tests(test_date);
CREATE INDEX idx_test_items_test_id ON test_items(test_id);
CREATE INDEX idx_interventions_defibrillator_id ON interventions(defibrillator_id);
CREATE INDEX idx_interventions_next_date ON interventions(next_intervention_date);
CREATE INDEX idx_inventory_movements_inventory_id ON inventory_movements(inventory_id);
CREATE INDEX idx_remitos_client_id ON remitos(client_id);
CREATE INDEX idx_presupuestos_client_id ON presupuestos(client_id);

-- ============================================
-- FUNCIONES para actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_defibrillators_updated_at BEFORE UPDATE ON defibrillators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_templates_updated_at BEFORE UPDATE ON checklist_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interventions_updated_at BEFORE UPDATE ON interventions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remitos_updated_at BEFORE UPDATE ON remitos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presupuestos_updated_at BEFORE UPDATE ON presupuestos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN para actualizar stock automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type = 'entry' THEN
    UPDATE inventory 
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.inventory_id;
  ELSIF NEW.movement_type = 'exit' THEN
    UPDATE inventory 
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.inventory_id;
  ELSIF NEW.movement_type = 'adjustment' THEN
    UPDATE inventory 
    SET current_stock = NEW.quantity
    WHERE id = NEW.inventory_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stock_on_movement AFTER INSERT ON inventory_movements
  FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

