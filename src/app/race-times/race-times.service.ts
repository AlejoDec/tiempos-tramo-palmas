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
    return item;
  }

  update(id: string, data: Omit<RaceTime, 'id'>) {
    this._items.update((arr: RaceTime[]) => arr.map(i => i.id === id ? { id, ...data } : i));
    this.persist();
  }

  remove(id: string) {
    this._items.update((arr: RaceTime[]) => arr.filter(i => i.id !== id));
    this.persist();
  }
}
