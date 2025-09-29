// Vercel Serverless Function to import backup
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
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); res.status(405).json({ message: 'Método no permitido' }); return; }
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object' || !payload.data) {
      res.status(400).json({ message: 'Payload inválido' }); return;
    }
    const redis = await getRedis();
    if (payload.data[KEY]) {
      const arr = Array.isArray(payload.data[KEY]) ? payload.data[KEY] : [];
      await redis.set(KEY, JSON.stringify(arr));
    }
    res.status(200).json({ message: 'Backup importado' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
