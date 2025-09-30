// Vercel Serverless Function to import backup
import { getCollection } from './_mongo.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); res.status(405).json({ message: 'Método no permitido' }); return; }
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object' || !payload.data) {
      res.status(400).json({ message: 'Payload inválido' }); return;
    }
    const col = await getCollection();
    const KEY = 'app.race.times';
    if (payload.data[KEY]) {
      const arr = Array.isArray(payload.data[KEY]) ? payload.data[KEY] : [];
      // Reemplazar colección completa
      await col.deleteMany({});
      if (arr.length) {
        // Insertar usando _id = id si existe
        const docs = arr.map(r => ({ _id: r.id || r._id || crypto.randomUUID(), ...r, id: undefined }));
        await col.insertMany(docs, { ordered: false });
      }
    }
    res.status(200).json({ message: 'Backup importado' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
