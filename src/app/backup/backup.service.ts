import { Injectable, signal } from '@angular/core';

export interface BackupPayload {
  exportedAt: string;
  origin: string;
  data: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class BackupService {
  status = signal<string>('');

  private async collectAll(): Promise<BackupPayload> {
    const data: Record<string, unknown> = {};
    try {
      const res = await fetch('/api/race-times');
      if (res.ok) {
        const list = await res.json();
        data['app.race.times'] = list;
      }
    } catch {
      data['app.race.times'] = [];
    }
    return { exportedAt: new Date().toISOString(), origin: location.origin, data };
  }

  async exportJson(): Promise<string> {
    const payload = await this.collectAll();
    return JSON.stringify(payload, null, 2);
  }

  async downloadJson(filename = 'backup-race-times.json') {
    const json = await this.exportJson();
    const blob = new Blob([json], { type: 'application/json' });
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
      const body = await this.exportJson();
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
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
