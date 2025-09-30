// Vercel Serverless Function for GET/POST race times
import { getCollection, mapDoc } from './_mongo.js';

export default async function handler(req, res) {
  try {
    const col = await getCollection();
    if (req.method === 'GET') {
      const docs = await col.find({}).sort({ marca: 1 }).toArray();
      res.status(200).json(docs.map(mapDoc));
      console.log("docs:", docs);
      return;
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.id) body.id = crypto.randomUUID();
      const { id, ...rest } = body;
      const insertDoc = { _id: id, ...rest };
      await col.insertOne(insertDoc);
      res.status(201).json(body);
      return;
    }
    res.setHeader('Allow', 'GET,POST');
    res.status(405).json({ message: 'Método no permitido' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
