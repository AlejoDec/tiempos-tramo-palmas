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
  private storageKey = 'app.race.times';
  private _items = signal<RaceTime[]>(this.load());
  readonly items = this._items.asReadonly();
  private syncing = false;
  private serverBase = '/api';

  private load(): RaceTime[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      return JSON.parse(raw) as RaceTime[];
    } catch {
      return [];
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this._items()));
  }

  list() { return this.items(); }

  get(id: string) { return this._items().find(i => i.id === id); }

  add(data: Omit<RaceTime, 'id'>) {
    const item: RaceTime = { id: simpleUUID(), ...data };
    this._items.update((arr: RaceTime[]) => [...arr, item]);
    this.persist();
    this.pushToServer('POST', item).catch(()=>{});
    return item;
  }

  update(id: string, data: Omit<RaceTime, 'id'>) {
    this._items.update((arr: RaceTime[]) => arr.map(i => i.id === id ? { id, ...data } : i));
    this.persist();
    this.pushToServer('PUT', { id, ...data }).catch(()=>{});
  }

  remove(id: string) {
    this._items.update((arr: RaceTime[]) => arr.filter(i => i.id !== id));
    this.persist();
    fetch(`${this.serverBase}/race-times/${id}`, { method: 'DELETE' }).catch(()=>{});
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
      if (Array.isArray(list) && list.length) {
        this._items.set(list);
        this.persist();
      }
    } catch { /* ignore offline */ } finally { this.syncing = false; }
  }

  private async pushToServer(method: 'POST'|'PUT', item: RaceTime) {
    const url = method === 'POST' ? `${this.serverBase}/race-times` : `${this.serverBase}/race-times/${item.id}`;
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
  }
}
