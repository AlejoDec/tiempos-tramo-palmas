import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import type { Request, Response } from 'express';
import { join } from 'node:path';
import { Redis } from '@upstash/redis';

// --- Edge Store (Upstash Redis) Setup ---
// Expect environment variables: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
// Fallback: creates a mock in-memory store (not for production)
let redis: Redis | { hgetall: (key: string) => Promise<any>; hset: (key: string, data: Record<string, unknown>) => Promise<void>; del: (key:string)=>Promise<void>; get: (k:string)=>Promise<any>; set:(k:string,v:any)=>Promise<void>; scan:(cursor:number)=>Promise<[number,string[]]> };
if (process.env['UPSTASH_REDIS_REST_URL'] && process.env['UPSTASH_REDIS_REST_TOKEN']) {
  redis = new Redis({
    url: process.env['UPSTASH_REDIS_REST_URL']!,
    token: process.env['UPSTASH_REDIS_REST_TOKEN']!,
  });
  console.log('[EdgeStore] Upstash Redis inicializado');
} else {
  console.warn('[EdgeStore] Variables de entorno de Upstash no definidas. Usando mock en memoria (SOLO DESARROLLO).');
  const mem = new Map<string, any>();
  redis = {
    async hgetall(key: string) { return mem.get(key) || {}; },
    async hset(key: string, data: Record<string, unknown>) {
      const current = mem.get(key) || {};
      mem.set(key, { ...current, ...data });
    },
    async del(key: string) { mem.delete(key); },
    async get(k: string) { return mem.get(k); },
    async set(k: string, v: any) { mem.set(k, v); },
    async scan(cursor: number) { return [0, Array.from(mem.keys())]; },
  };
}

// Keys & helpers
const KEY_RACE_TIMES = 'app.race.times';
interface RaceTime { id: string; corredor: string; carro: string; marca?: string; tiempoSegundos: number; tramo: string; fecha?: string; nota?: string; }

async function loadRaceTimes(): Promise<RaceTime[]> {
  const raw = await (redis as any).get(KEY_RACE_TIMES);
  if (!raw) return [];
  try { return JSON.parse(raw) as RaceTime[]; } catch { return []; }
}

async function saveRaceTimes(list: RaceTime[]): Promise<void> {
  await (redis as any).set(KEY_RACE_TIMES, JSON.stringify(list));
}

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json({ limit: '1mb' }));

// --- API: List race times ---
app.get('/api/race-times', async (_req: Request, res: Response) => {
  const list = await loadRaceTimes();
  res.json(list);
});

// --- API: Create race time ---
app.post('/api/race-times', async (req: Request, res: Response): Promise<void> => {
  const body = req.body as Omit<RaceTime, 'id'> & { id?: string };
  if (!body || typeof body !== 'object') { res.status(400).json({ message: 'Body inválido' }); return; }
  const required = ['corredor','carro','tiempoSegundos','tramo'];
  for (const f of required) if ((body as any)[f] == null) { res.status(400).json({ message: `Falta campo ${f}` }); return; }
  const list = await loadRaceTimes();
  const id = body.id || crypto.randomUUID();
  const item: RaceTime = { id, corredor: body.corredor, carro: body.carro, marca: body.marca, tiempoSegundos: Number(body.tiempoSegundos), tramo: body.tramo, fecha: body.fecha, nota: body.nota };
  list.push(item);
  await saveRaceTimes(list);
  res.status(201).json(item); return;
});

// --- API: Update race time ---
app.put('/api/race-times/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const body = req.body as Omit<RaceTime, 'id'>;
  const list = await loadRaceTimes();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) { res.status(404).json({ message: 'No encontrado' }); return; }
  list[idx] = { ...list[idx], ...body, id };
  await saveRaceTimes(list);
  res.json(list[idx]); return;
});

// --- API: Delete race time ---
app.delete('/api/race-times/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const list = await loadRaceTimes();
  const filtered = list.filter(r => r.id !== id);
  if (filtered.length === list.length) { res.status(404).json({ message: 'No encontrado' }); return; }
  await saveRaceTimes(filtered);
  res.json({ message: 'Eliminado' }); return;
});

// --- API: Import backup ---
app.post('/api/import-backup', async (req: Request, res: Response): Promise<void> => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object' || !payload.data) {
    res.status(400).json({ message: 'Payload inválido' }); return;
  }
  try {
    if (payload.data[KEY_RACE_TIMES]) {
      // validate array
      const arr = Array.isArray(payload.data[KEY_RACE_TIMES]) ? payload.data[KEY_RACE_TIMES] : [];
      await saveRaceTimes(arr);
    }
    res.json({ message: 'Backup importado' }); return;
  } catch (e: any) {
    res.status(500).json({ message: e.message || 'Error importando respaldo' }); return;
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
