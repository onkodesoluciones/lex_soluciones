-- Agregar campo sections a checklist_templates para almacenar títulos de secciones
-- Este campo es opcional (puede ser NULL) para mantener compatibilidad con plantillas existentes

ALTER TABLE checklist_templates 
ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '{}'::jsonb;

-- Comentario para documentar el campo
COMMENT ON COLUMN checklist_templates.sections IS 'Objeto JSON que almacena información de secciones: {"5.1": {"title": "..."}, "5.2": {"title": "..."}, etc.}';
