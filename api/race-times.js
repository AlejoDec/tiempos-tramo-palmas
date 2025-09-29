// Vercel Serverless Function for GET/POST race times
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
    const redis = await getRedis();
    if (req.method === 'GET') {
      const raw = await redis.get(KEY);
      const list = raw ? JSON.parse(raw) : [];
      res.status(200).json(list);
      return;
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.id) body.id = crypto.randomUUID();
      const raw = await redis.get(KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push(body);
      await redis.set(KEY, JSON.stringify(list));
      res.status(201).json(body);
      return;
    }
    res.setHeader('Allow', 'GET,POST');
    res.status(405).json({ message: 'Método no permitido' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
