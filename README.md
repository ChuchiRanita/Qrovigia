# QRO Sentinel

Base inicial de una plataforma externa para administrar y monitorear la seguridad
de varios sitios institucionales. No es un portal gubernamental.

## Requisitos

- Node.js 20.19+ o 22.12+ (se recomienda una versión LTS compatible).
- npm 10 o superior.

SQLite se ejecuta localmente como una base de datos en archivo; no requiere
instalar ni configurar un servidor de base de datos.

## Ejecutar en Windows

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
npm install
npm run dev
```

La interfaz estará disponible en <http://localhost:5173> y el API en
<http://localhost:3001>. El comando de desarrollo inicia ambos procesos; usa
`Ctrl+C` para detenerlos.

El API abre o crea `data/qro-sentinel.sqlite` al iniciar y crea la tabla `sites`
si aún no existe. Los registros permanecen en ese archivo al reiniciar.

## Comprobar el API

Abre <http://localhost:3001/api/health> en el navegador o ejecuta:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

La respuesta esperada es:

```json
{
  "status": "ok",
  "database": "connected"
}
```

La interfaz también consulta esta ruta y muestra el estado real de conexión al
API y a SQLite.

## Sitios protegidos

La interfaz permite registrar, buscar, filtrar, editar, pausar/reactivar y
eliminar sitios. Todos los registros nuevos quedan pendientes de verificación.
No se hacen solicitudes a los dominios registrados ni se ejecutan análisis.

Rutas disponibles:

- `GET /api/sites?search=texto&status=pending_verification`
- `GET /api/sites/stats`
- `GET /api/sites/:id`
- `POST /api/sites`
- `PUT /api/sites/:id`
- `PATCH /api/sites/:id/status` con `{ "status": "paused" }` o `{ "status": "active" }`
- `DELETE /api/sites/:id`

Para ejecutar las pruebas automatizadas de CRUD y validación:

```powershell
npm test
```

## Estructura

```text
apps/
  backend/
    src/
      config/       # Inicialización y ruta de SQLite
      errors/       # Errores HTTP de la aplicación
      sites/        # Validación, lógica, tipos y persistencia de sitios
      middleware/   # Manejo de errores
      routes/       # Endpoints HTTP
      app.ts        # Configuración de Express
      server.ts     # Inicio y cierre del servidor
  frontend/
    src/
      components/   # Componentes de interfaz
      services/     # Comunicación con el API
      styles/       # Estilos globales y de la aplicación
      App.tsx
      main.tsx
```

## Comandos

- `npm run dev`: inicia frontend y backend en modo desarrollo.
- `npm run build`: compila ambos workspaces.

### Prueba cambio Sebas
hola c: