// Vercel Serverless Function for PUT/DELETE race times by id (folder route version)
import { getCollection, mapDoc } from '../_mongo.js';

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) { res.status(400).json({ message: 'Falta id' }); return; }
    const col = await getCollection();
    if (req.method === 'PUT') {
      const body = req.body || {};
      const { matchedCount } = await col.updateOne({ _id: id }, { $set: body }, { upsert: false });
      if (matchedCount === 0) { res.status(404).json({ message: 'No encontrado' }); return; }
      const updated = await col.findOne({ _id: id });
      res.status(200).json(mapDoc(updated));
      return;
    }
    if (req.method === 'DELETE') {
      const { deletedCount } = await col.deleteOne({ _id: id });
      if (deletedCount === 0) {
        res.status(200).json({ message: 'Ya no existía (idempotente)' });
      } else {
        res.status(200).json({ message: 'Eliminado' });
      }
      return;
    }
    res.setHeader('Allow', 'PUT,DELETE');
    res.status(405).json({ message: 'Método no permitido' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
