import { MongoClient } from 'mongodb';

let clientPromise;
let indexesEnsured = false;

function resolveMongoUrl() {
  // Prioridad: MONGODB_URL (lo que pidió el usuario) luego MONGODB_URI luego MONGO_URL
  return process.env.MONGODB_URL || process.env.MONGODB_URI || process.env.MONGO_URL;
}

export function getMongoClient() {
  if (!clientPromise) {
    const uri = resolveMongoUrl();
    if (!uri) throw new Error('MONGODB_URL no definido (define MONGODB_URL o MONGODB_URI o MONGO_URL)');
    clientPromise = MongoClient.connect(uri, { maxPoolSize: 5 });
  }
  return clientPromise;
}

async function ensureIndexes(col) {
  if (indexesEnsured) return;
  // Índices útiles para consultas / orden: marca, corredor
  try {
    await col.createIndexes([
      { key: { marca: 1 }, name: 'idx_marca' },
      { key: { corredor: 1 }, name: 'idx_corredor' },
      { key: { tramo: 1 }, name: 'idx_tramo' }
    ]);
  } catch (e) {
    console.warn('[mongo] No se pudieron crear índices:', e.message);
  }
  indexesEnsured = true;
}

export async function getCollection() {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || 'palmas';
  const db = client.db(dbName);
  const col = db.collection('race_times');
  ensureIndexes(col).catch(() => {});
  return col;
}

export function mapDoc(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest };
}
