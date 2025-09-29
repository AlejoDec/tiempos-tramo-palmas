import { Injectable, signal } from '@angular/core';
import { RaceTime } from './race-time.model';

// Pequeña función local para evitar añadir una dependencia si no existe uuid.
function simpleUUID(): string {
  // fallback simple - no criptográficamente seguro
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

@Injectable({ providedIn: 'root' })
export class RaceTimesService {
  private _items = signal<RaceTime[]>([]);
  readonly items = this._items.asReadonly();
  private syncing = false;
  private serverBase = '/api';

  list() { return this.items(); }

  get(id: string) { return this._items().find(i => i.id === id); }

  async add(data: Omit<RaceTime, 'id'>) {
    const item: RaceTime = { id: simpleUUID(), ...data };
    // Optimistic update
    this._items.update(arr => [...arr, item]);
    try {
      const res = await fetch(`${this.serverBase}/race-times`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
      if (res.ok) {
        const saved = await res.json() as RaceTime;
        // Replace temp item with server item (in case server generated id or modified)
        this._items.update(arr => arr.map(a => a.id === item.id ? saved : a));
        return saved;
      } else {
        throw new Error('HTTP '+res.status);
      }
    } catch {
      // rollback
      this._items.update(arr => arr.filter(a => a.id !== item.id));
      throw new Error('No se pudo guardar en el servidor');
    }
  }

  async update(id: string, data: Omit<RaceTime, 'id'>) {
    const before = this._items();
    this._items.update(arr => arr.map(i => i.id === id ? { id, ...data } : i));
    try {
      const res = await fetch(`${this.serverBase}/race-times/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) });
      if (!res.ok) throw new Error('HTTP '+res.status);
    } catch {
      this._items.set(before); // rollback
      throw new Error('No se pudo actualizar en el servidor');
    }
  }

  async remove(id: string) {
    const before = this._items();
    this._items.update(arr => arr.filter(i => i.id !== id));
    try {
      const res = await fetch(`${this.serverBase}/race-times/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 404) throw new Error('HTTP '+res.status);
    } catch {
      this._items.set(before); // rollback
      throw new Error('No se pudo eliminar en el servidor');
    }
  }

  formatTiempo(segundos: number): string {
    if (isNaN(segundos) || segundos < 0) return '-';
    const whole = Math.floor(segundos);
    const ms = Math.round((segundos - whole) * 1000);
    const m = Math.floor(whole / 60);
    const s = whole % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${ms.toString().padStart(3,'0')}`;
  }

  // Attempt to pull latest list from server (one-way sync on app start)
  async syncFromServerOnce() {
    if (this.syncing) return;
    this.syncing = true;
    try {
      const res = await fetch(`${this.serverBase}/race-times`);
      if (!res.ok) return;
      const list = await res.json() as RaceTime[];
      this._items.set(Array.isArray(list) ? list : []);
    } catch { /* ignore offline */ } finally { this.syncing = false; }
  }
}
