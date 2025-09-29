// Vercel Serverless Function for PUT/DELETE race times by id
import { createClient } from 'redis';

const KEY = 'app.race.times';

async function getRedis() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('REDIS_URL no definido');
  const client = createClient({ url });
  client.on('error', err => console.error('[redis] error', err));
  if (!client.isOpen) await client.connect();
  return client;
}

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) { res.status(400).json({ message: 'Falta id' }); return; }
    const redis = await getRedis();
    const raw = await redis.get(KEY);
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) { res.status(404).json({ message: 'No encontrado' }); return; }

    if (req.method === 'PUT') {
      const body = req.body || {};
      list[idx] = { ...list[idx], ...body, id };
      await redis.set(KEY, JSON.stringify(list));
      res.status(200).json(list[idx]);
      return;
    }
    if (req.method === 'DELETE') {
      const filtered = list.filter(r => r.id !== id);
      await redis.set(KEY, JSON.stringify(filtered));
      res.status(200).json({ message: 'Eliminado' });
      return;
    }
    res.setHeader('Allow', 'PUT,DELETE');
    res.status(405).json({ message: 'Método no permitido' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
