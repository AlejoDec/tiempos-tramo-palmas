# MiAppAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Edge Store / Redis (Upstash o Vercel KV)

La aplicación incluye un pequeño backend Express (en `src/server.ts`) que expone endpoints REST bajo `/api` y persiste los tiempos en Redis.

### Variables de entorno soportadas

Prioridad (se usa la primera pareja encontrada):

1. `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
2. `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel KV)

Si no se define ninguna, se usa un mock en memoria SOLO para desarrollo (no persistente).

### Archivo de ejemplo

Revisa `.env.sample` y crea tu `.env` local:

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
# o bien
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

### Ejecución local con SSR / API

```bash
npm run build
PORT=4000 node dist/mi-app-angular/server/server.mjs
```
Luego visitar `http://localhost:4000/api/race-times`.

### Endpoints disponibles

- GET `/api/race-times`
- POST `/api/race-times`
- PUT `/api/race-times/:id`
- DELETE `/api/race-times/:id`
- POST `/api/import-backup` (acepta el JSON exportado desde el front)

### Sincronización en el cliente

El servicio `RaceTimesService` intenta sincronizar (push) al crear/editar/eliminar. Puedes invocar `syncFromServerOnce()` en el arranque si quieres forzar la lectura inicial del backend.
