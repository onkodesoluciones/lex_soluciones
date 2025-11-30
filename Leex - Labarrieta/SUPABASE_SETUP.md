# Configuración de Supabase Storage

Para que la generación de PDFs funcione correctamente, necesitas configurar el Storage en Supabase.

## Pasos para configurar Storage

1. **Ir a Storage en Supabase Dashboard**
   - Ve a tu proyecto en https://supabase.com/dashboard
   - En el menú lateral, selecciona **Storage**

2. **Crear un Bucket llamado "documents"**
   - Haz clic en "New bucket"
   - Nombre: `documents`
   - Marca como **Público** (Public bucket)
   - Haz clic en "Create bucket"

3. **Configurar Políticas de Seguridad (Opcional pero recomendado)**
   - Ve a "Policies" del bucket `documents`
   - Puedes crear políticas para controlar quién puede subir/leer archivos
   - Para desarrollo, puedes permitir todo temporalmente

## Estructura de Carpetas en Storage

El sistema creará automáticamente estas carpetas dentro del bucket `documents`:
- `pdfs/` - Para PDFs de ensayos, remitos y presupuestos
- `logos/` - Para logos (si quieres subir el logo de LEX más adelante)

## Nota sobre el Logo

Actualmente los PDFs muestran el texto "LEX" como logo. Si quieres agregar un logo real:

1. Sube tu logo a `documents/logos/logo-lex.png` (o el formato que prefieras)
2. Actualiza los componentes PDF en `src/components/PDFs/` para usar el logo desde Storage

## Verificación

Una vez configurado, cuando generes un ensayo, remito o presupuesto, el PDF se guardará automáticamente en Supabase Storage y la URL se guardará en la base de datos.

