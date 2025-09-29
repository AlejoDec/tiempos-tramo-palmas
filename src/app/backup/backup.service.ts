import { Injectable, signal } from '@angular/core';

export interface BackupPayload {
  exportedAt: string;
  origin: string;
  data: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class BackupService {
  status = signal<string>('');

  private collectAll(): BackupPayload {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      try {
        const raw = localStorage.getItem(key);
        data[key] = raw ? JSON.parse(raw) : null;
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
    return {
      exportedAt: new Date().toISOString(),
      origin: location.origin,
      data
    };
  }

  exportJson(): string {
    return JSON.stringify(this.collectAll(), null, 2);
  }

  downloadJson(filename = 'backup-localstorage.json') {
    const blob = new Blob([this.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    this.status.set('Descarga generada');
    setTimeout(() => this.status.set(''), 2500);
  }

  async uploadToServer(endpoint = '/api/import-backup') {
    try {
      this.status.set('Subiendo respaldo...');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: this.exportJson()
      });
      if (!res.ok) throw new Error('Error HTTP ' + res.status);
      const json = await res.json();
      this.status.set('Servidor: ' + (json.message || 'OK'));
    } catch (e: any) {
      this.status.set('Error: ' + e.message);
    } finally {
      setTimeout(() => this.status.set(''), 4000);
    }
  }
}
