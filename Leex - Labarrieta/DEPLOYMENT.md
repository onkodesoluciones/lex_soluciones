# Guía de Despliegue - LEX Sistema de Gestión

Esta guía te ayudará a desplegar la aplicación en producción.

## Opciones de Hosting Recomendadas

### 1. **Vercel** (Recomendado - Gratis y fácil)
- ✅ Gratis para proyectos personales
- ✅ Despliegue automático desde GitHub
- ✅ SSL automático
- ✅ Dominio personalizado
- ✅ Variables de entorno fáciles de configurar

### 2. **Netlify** (Alternativa - Gratis)
- ✅ Gratis para proyectos personales
- ✅ Despliegue automático desde GitHub
- ✅ SSL automático
- ✅ Dominio personalizado

### 3. **GitHub Pages** (Gratis pero limitado)
- ✅ Gratis
- ⚠️ No soporta variables de entorno directamente
- ⚠️ Requiere configuración adicional

## Pre-requisitos

1. ✅ Tener una cuenta en Supabase configurada
2. ✅ Tener las variables de entorno de Supabase
3. ✅ Tener el código en un repositorio Git (GitHub, GitLab, etc.)

## Pasos para Desplegar en Vercel (Recomendado)

### Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en GitHub:
```bash
git add .
git commit -m "Preparado para deployment"
git push origin main
```

### Paso 2: Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en "Add New Project"

### Paso 3: Importar el Proyecto

1. Selecciona tu repositorio de GitHub
2. Vercel detectará automáticamente que es un proyecto Vite

### Paso 4: Configurar Variables de Entorno

En la configuración del proyecto, agrega estas variables:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

**Importante:** Usa las mismas credenciales que en tu `.env` local.

### Paso 5: Configurar Build Settings

Vercel debería detectar automáticamente:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Si no lo detecta, configúralo manualmente.

### Paso 6: Desplegar

1. Haz clic en "Deploy"
2. Espera a que termine el build (2-3 minutos)
3. ¡Listo! Tu app estará disponible en una URL como: `tu-proyecto.vercel.app`

### Paso 7: Configurar Dominio Personalizado (Opcional)

1. Ve a Settings → Domains
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar DNS

## Pasos para Desplegar en Netlify

### Paso 1: Crear cuenta en Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Inicia sesión con tu cuenta de GitHub

### Paso 2: Importar Proyecto

1. Haz clic en "Add new site" → "Import an existing project"
2. Selecciona tu repositorio de GitHub

### Paso 3: Configurar Build Settings

- **Build command:** `npm run build`
- **Publish directory:** `dist`

### Paso 4: Configurar Variables de Entorno

Ve a Site settings → Environment variables y agrega:
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### Paso 5: Desplegar

1. Haz clic en "Deploy site"
2. Espera a que termine el build
3. Tu app estará disponible en una URL como: `tu-proyecto.netlify.app`

## Verificar el Build Localmente

Antes de desplegar, verifica que el build funciona:

```bash
# Instalar dependencias
npm install

# Crear build de producción
npm run build

# Probar el build localmente
npm run preview
```

Si el build funciona correctamente, deberías ver la app en `http://localhost:4173`

## Checklist Pre-Deployment

- [ ] El build funciona localmente (`npm run build`)
- [ ] Las variables de entorno están configuradas
- [ ] El logo está en `public/logo.svg` y `public/logo.jpg`
- [ ] La base de datos está configurada en Supabase
- [ ] El bucket `documents` está creado en Supabase Storage
- [ ] Los usuarios de autenticación están creados en Supabase

## Configuración de Supabase para Producción

### 1. Verificar RLS (Row Level Security)

Asegúrate de que las políticas RLS estén configuradas correctamente en Supabase para producción.

### 2. Verificar Storage Policies

El bucket `documents` debe tener políticas que permitan:
- Lectura pública de archivos
- Escritura para usuarios autenticados

### 3. Configurar URLs Permitidas

En Supabase Dashboard → Authentication → URL Configuration:
- Agrega la URL de producción (ej: `https://tu-proyecto.vercel.app`)

## Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que las variables de entorno estén configuradas en la plataforma de hosting
- Asegúrate de que los nombres empiecen con `VITE_`

### Error: "Bucket not found"
- Verifica que el bucket `documents` esté creado en Supabase Storage
- Verifica que el bucket sea público

### Error: "Unauthorized"
- Verifica las políticas RLS en Supabase
- Verifica que las URLs permitidas incluyan tu dominio de producción

## Actualizaciones Futuras

Cada vez que hagas `git push` a la rama principal, la plataforma de hosting desplegará automáticamente los cambios.

## Soporte

Si tienes problemas con el deployment, verifica:
1. Los logs de build en la plataforma de hosting
2. La consola del navegador para errores en runtime
3. Los logs de Supabase para errores de base de datos

