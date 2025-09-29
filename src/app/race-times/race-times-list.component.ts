import { Component, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RaceTimesService } from './race-times.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-race-times-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
  <div class="toolbar">
    <h2>Tiempos de Carrera</h2>
    <div class="actions">
      <a routerLink="/times/new">➕ Nuevo</a>
      <button (click)="logout()">Salir</button>
    </div>
  </div>
  <table *ngIf="items().length; else empty">
    <thead>
      <tr>
        <th>Corredor</th>
        <th>Carro</th>
        <th>Tiempo (s)</th>
        <th>Tramo</th>
        <th>Fecha</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      @for (t of items(); track t.id) {
        <tr>
          <td>{{ t.corredor }}</td>
            <td>{{ t.carro }}</td>
            <td>{{ t.tiempoSegundos }}</td>
            <td>{{ t.tramo }}</td>
            <td>{{ t.fecha | date:'short' }}</td>
            <td>
              <a [routerLink]="['/times', t.id, 'edit']">Editar</a>
              <button (click)="remove(t.id)">Eliminar</button>
            </td>
        </tr>
      }
    </tbody>
  </table>
  <ng-template #empty>
    <p>No hay registros. <a routerLink="/times/new">Crea el primero</a>.</p>
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

  remove(id: string) {
    if (confirm('¿Eliminar registro?')) this.svc.remove(id);
  }

  logout() { this.auth.logout(); }
}
