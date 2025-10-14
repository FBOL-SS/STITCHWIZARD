# StitchWizard

StitchWizard es una calculadora full-stack para costos de mano de obra en confección.

## Características

- API REST en Node.js + Express con SQLite.
- Autenticación básica por token (placeholder) para mostrar middleware.
- CRUD completo de operaciones y tipos de trabajador.
- Definición de estilos/prendas con secuencia y cantidad por unidad.
- Cálculo de costos con ajustes de overhead y margen, y reducción por lotes.
- Exportación de resultados a CSV y XLSX.
- SPA en React (Vite) que consume la API.
- Pruebas unitarias para la lógica de cálculo.

## Requisitos

- Node.js 18+
- npm

## Instalación local

```bash
npm install
npm run db:setup
(cd client && npm install)
```

### Desarrollo

En una terminal inicia la API:

```bash
npm run dev
```

En otra terminal levanta el frontend:

```bash
cd client
npm run dev
```

El frontend estará en `http://localhost:5173` y la API en `http://localhost:4000`.

> **Auth:** todas las llamadas API requieren el header `Authorization: Bearer demo-token`.

### Producción local (build)

```bash
cd client
npm run build
cd ..
npm start
```

El servidor Express servirá los archivos construidos en `client/dist`.

## Despliegue

### Backend en Railway o Render

1. Crea un nuevo servicio Node.js y sube este repositorio.
2. Configura el comando de build `npm install && npm run db:setup && cd client && npm install && npm run build`.
3. Configura el comando de start `npm start`.
4. Asegura que el archivo `db/stitchwizard.sqlite` tenga persistencia (volumen o variable `DATABASE_URL` si migras a Postgres).

### Frontend en Vercel

1. Importa el repositorio.
2. En **Build Command** usa `cd client && npm install && npm run build`.
3. En **Output Directory** define `client/dist`.
4. Configura la variable de entorno `VITE_API_BASE=https://tu-backend` si necesitas apuntar a una URL distinta (ajusta `client/src/api.js` en despliegues avanzados).
5. Recuerda habilitar CORS en el backend para el dominio de Vercel.

## Base de datos

- Esquema en `db/schema.sql`.
- Datos de ejemplo en `db/seed.sql` (3 operaciones, 2 tipos de trabajador, 1 estilo con 3 operaciones).
- Script `npm run db:setup` crea `db/stitchwizard.sqlite` y aplica seed si no existe.

## Pruebas

```bash
npm test
```

## Árbol del proyecto

```text
  .gitignore
  README.md
  package.json
  server.js
  tests/
    costCalculator.test.js
  db/
    schema.sql
    seed.sql
  middleware/
    auth.js
  scripts/
    setupDb.js
  services/
    costCalculator.js
    database.js
  client/
    index.html
    package.json
    vite.config.js
    src/
      App.jsx
      api.js
      main.jsx
      styles.css
```

## Fórmulas

Documentadas en `services/costCalculator.js`.

## Notas

- Usa el token `demo-token` para llamadas API.
- El cálculo aplica reducción de tiempo cuando `batchSize >= batch_threshold` usando `time_min * (1 - batch_reduction_pct)`.

## Autoevaluación

**Escalabilidad:** El diseño desacopla la lógica de cálculo en `services/costCalculator.js`, lo que facilita moverla a microservicios o workers. Para escalar se puede migrar SQLite a Postgres y usar un ORM.

**Seguridad:** Actualmente solo hay un middleware de autenticación dummy. Para producción deben implementarse JWT/OAuth, HTTPS y controles de acceso por rol. Validaciones adicionales (p. ej. JOI) serían recomendables.

**Mejoras futuras:**

- Multi-usuario con roles y permisos.
- Auditoría de cambios en operaciones y estilos.
- Versionado histórico de tiempos y tarifas.
- Internacionalización (i18n) para UI y reportes.
