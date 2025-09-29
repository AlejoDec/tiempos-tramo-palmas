import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas específicas que NO deben prerenderizarse
  { path: 'times/:id/edit', renderMode: RenderMode.Client },
  { path: 'times/new', renderMode: RenderMode.Client },
  { path: 'times', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  // Fallback: prerender del resto (p.ej. página inicial)
  { path: '**', renderMode: RenderMode.Prerender }
];
