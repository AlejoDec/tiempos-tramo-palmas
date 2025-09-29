import { Component, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RaceTimesService } from './race-times.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-race-times-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
  template: `
  <div class="toolbar">
    <h2>Tiempos de Carrera</h2>
    <div class="actions" *ngIf="loggedIn(); else readOnlyBadge">
      <a routerLink="/times/new">➕ Nuevo</a>
      <button (click)="logout()">Salir</button>
    </div>
    <ng-template #readOnlyBadge>
      <span class="readonly">Solo lectura (inicia sesión para editar)</span>
    </ng-template>
  </div>
  <div class="filters">
    <input placeholder="Filtrar marca" [(ngModel)]="fMarca" />
    <input placeholder="Filtrar corredor" [(ngModel)]="fCorredor" />
    <input placeholder="Filtrar modelo" [(ngModel)]="fModelo" />
    <button (click)="limpiarFiltros()" type="button">Limpiar</button>
  </div>
  <table *ngIf="filtered().length; else empty">
    <thead>
      <tr>
        <th>Corredor</th>
        <th>Marca de carro</th>
        <th>Modelo</th>
        <th>Tiempo</th>
        <th>Tramo</th>
        <th>Fecha</th>
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
            <td>{{ t.fecha | date:'short' }}</td>
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
  items = computed(() => this.svc.items());
  fMarca = '';
  fCorredor = '';
  fModelo = '';
  filtered = computed(() => {
    const marca = this.fMarca.trim().toLowerCase();
    const corredor = this.fCorredor.trim().toLowerCase();
    const modelo = this.fModelo.trim().toLowerCase();
    return this.items()
      .filter(t => !marca || (t.marca||'').toLowerCase().includes(marca))
      .filter(t => !corredor || t.corredor.toLowerCase().includes(corredor))
      .filter(t => !modelo || t.carro.toLowerCase().includes(modelo))
      .sort((a,b) => (a.marca||'').localeCompare(b.marca||''));
  });
  loggedIn = computed(() => this.auth.loggedIn());

  remove(id: string) {
    if (confirm('¿Eliminar registro?')) this.svc.remove(id);
  }

  logout() { this.auth.logout(); }

  limpiarFiltros() {
    this.fMarca = this.fCorredor = this.fModelo = '';
  }

  formatTiempo(seg: number) { return this.svc.formatTiempo(seg); }
}
