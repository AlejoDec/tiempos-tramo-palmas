import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RaceTimesService } from './race-times.service';
import { BackupService } from '../backup/backup.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-race-times-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <div class="toolbar">
    <h2>Tiempos de Carrera de Palmas - Medellin</h2>
    <p>Made by <a href="http://byttes.com" target="_blank" rel="noopener noreferrer">Byttes</a></p>
    <div class="actions" *ngIf="loggedIn(); else readOnlyBadge">
      <a routerLink="/times/new">➕ Nuevo</a>
      <button (click)="logout()">Salir</button>
      <button (click)="exportar()">Exportar JSON</button>
      <button (click)="subir()">Subir a API</button>
    </div>
    <ng-template #readOnlyBadge>
      <span class="readonly">Solo lectura (inicia sesión para editar)</span>
    </ng-template>
  </div>
  <div class="filters">
    <input placeholder="Filtrar (marca / corredor / modelo / tramo)" [(ngModel)]="filterInput" (keyup.enter)="aplicarFiltro()" />
    <button type="button" (click)="aplicarFiltro()">Aplicar</button>
    <button type="button" (click)="limpiarFiltro()" [disabled]="!appliedFilter() && !filterInput">Limpiar</button>
    <span class="badge" *ngIf="appliedFilter()">Filtro activo: "{{ appliedFilter() }}"</span>
  </div>
  <table *ngIf="filtered().length; else empty">
    <thead>
      <tr>
        <th>Corredor</th>
        <th>Marca de carro</th>
        <th>Modelo</th>
        <th>Tiempo</th>
        <th>Tramo</th>
        <th> Nota </th>
        <th *ngIf="loggedIn()">Acciones</th>
      </tr>
    </thead>
    <tbody>
      @for (t of filtered(); track t.id) {
        <tr>
          <td>{{ t.corredor }}</td>
            <td>{{ t.marca || '-' }}</td>
            <td>{{ t.carro }}</td>
            <td>{{ formatTiempo(t.tiempoSegundos) }}</td>
            <td>{{ t.tramo }}</td>
            <td> {{ t.nota || '-' }} </td>
            <td *ngIf="loggedIn()">
              <a [routerLink]="['/times', t.id, 'edit']">Editar</a>
              <button (click)="remove(t.id)">Eliminar</button>
            </td>
        </tr>
      }
    </tbody>
  </table>
  <ng-template #empty>
    <p>No hay registros. <span *ngIf="loggedIn(); else needLogin"> <a routerLink="/times/new">Crea el primero</a>.</span>
      <ng-template #needLogin>Inicia sesión para agregar uno.</ng-template>
    </p>
  </ng-template>
  `,
  styles: [`
    .toolbar { display:flex; justify-content:space-between; align-items:center; margin:1rem 0; }
    .actions { display:flex; gap:0.5rem; }
    table { width:100%; border-collapse:collapse; }
    th, td { padding:0.5rem; border:1px solid #ddd; }
    th { background:#f5f5f5; }
    button { cursor:pointer; }
  `]
})
export class RaceTimesListComponent {
  private svc = inject(RaceTimesService);
  private auth = inject(AuthService);
  private backup = inject(BackupService);
  items = computed(() => this.svc.items());
  filterInput = '';
  appliedFilter = signal('');
  filtered = computed(() => {
    const f = this.appliedFilter().trim().toLowerCase();
    return this.items()
      .filter(t => !f ||
        (t.marca||'').toLowerCase().includes(f) ||
        t.corredor.toLowerCase().includes(f) ||
        t.carro.toLowerCase().includes(f))
      .sort((a,b) => (a.marca||'').localeCompare(b.marca||''));
  });
  loggedIn = computed(() => this.auth.loggedIn());

  remove(id: string) {
    if (confirm('¿Eliminar registro?')) this.svc.remove(id);
  }

  logout() { this.auth.logout(); }

  aplicarFiltro() {
    this.appliedFilter.set(this.filterInput);
  }

  limpiarFiltro() {
    this.filterInput = '';
    this.appliedFilter.set('');
  }

  formatTiempo(seg: number) { return this.svc.formatTiempo(seg); }

  exportar() { this.backup.downloadJson(); }
  subir() { this.backup.uploadToServer(); }
}
