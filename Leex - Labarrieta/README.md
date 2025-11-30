# LEX - Gestión de Espacios Cardioseguros

Sistema de gestión para mantenimiento de desfibriladores, ensayos y espacios cardioseguros.

## Tecnologías

- **Frontend**: React + Vite
- **Backend**: Supabase (PostgreSQL + API REST)
- **Estilos**: Tailwind CSS
- **PDFs**: @react-pdf/renderer

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Configuración

1. Crear archivo `.env` en la raíz del proyecto:
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

2. Ejecutar el script SQL en Supabase para crear las tablas (ver `supabase/schema.sql`)

## Build para Producción

```bash
npm run build
```

Esto generará una carpeta `dist` con los archivos optimizados para producción.

## Despliegue

Ver la guía completa en [DEPLOYMENT.md](./DEPLOYMENT.md)

**Opciones recomendadas:**
- **Vercel** (gratis, fácil, recomendado)
- **Netlify** (gratis, fácil)
- **GitHub Pages** (gratis, requiere configuración adicional)

## Estructura del Proyecto

```
src/
  ├── components/     # Componentes reutilizables
  ├── pages/          # Páginas principales
  ├── hooks/          # Custom hooks
  ├── services/       # Servicios de Supabase
  ├── utils/          # Utilidades
  ├── styles/         # Estilos globales
  └── App.jsx         # Componente principal
```

