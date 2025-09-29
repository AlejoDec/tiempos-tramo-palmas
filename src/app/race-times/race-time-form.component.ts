import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RaceTimesService } from './race-times.service';
import { RaceTime } from './race-time.model';

@Component({
  selector: 'app-race-time-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="form-wrapper">
    <h2>{{ isEdit() ? 'Editar' : 'Nuevo' }} Tiempo</h2>
    <form (ngSubmit)="save()" #f="ngForm">
      <div class="row">
        <label>Corredor</label>
        <input name="corredor" required [(ngModel)]="model.corredor" />
      </div>
      <div class="row">
        <label>Carro</label>
        <input name="carro" required [(ngModel)]="model.carro" />
      </div>
      <div class="row">
        <label>Marca</label>
        <input name="marca" required [(ngModel)]="model.marca" />
      </div>
      <div class="row">
        <label>Tiempo (segundos)</label>
        <input name="tiempoSegundos" type="number" min="0" required [(ngModel)]="model.tiempoSegundos" />
      </div>
      <div class="row">
        <label>Tramo</label>
        <input name="tramo" required [(ngModel)]="model.tramo" />
      </div>
      <div class="row">
        <label>Fecha</label>
        <input name="fecha" type="datetime-local" required [(ngModel)]="model.fechaLocal" />
      </div>
      <div class="actions">
        <button type="submit" [disabled]="f.invalid">Guardar</button>
        <a routerLink="/times">Cancelar</a>
      </div>
    </form>
  </div>
  `,
  styles: [`
    .form-wrapper { max-width:480px; margin:1rem auto; padding:1.5rem; border:1px solid #ccc; border-radius:8px; }
    form { display:flex; flex-direction:column; gap:0.75rem; }
    .row { display:flex; flex-direction:column; }
    label { font-weight:600; margin-bottom:0.25rem; }
    input { padding:0.5rem; }
    .actions { display:flex; gap:0.75rem; }
    button { cursor:pointer; }
  `]
})
export class RaceTimeFormComponent {
  private svc = inject(RaceTimesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = signal(false);
  id: string | null = null;

  model: any = {
    corredor: '',
    carro: '',
    marca: '',
    tiempoSegundos: 0,
    tramo: '',
    fechaLocal: ''
  };

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const item = this.svc.get(id);
        if (item) {
          this.isEdit.set(true);
          this.id = id;
          this.model = {
            corredor: item.corredor,
            carro: item.carro,
            marca: item.marca || '',
            tiempoSegundos: item.tiempoSegundos,
            tramo: item.tramo,
            fechaLocal: this.toLocalInput(item.fecha)
          };
        }
      }
    });
  }

  private toLocalInput(iso: string) {
    const d = new Date(iso);
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0,16);
  }

  private toIso(localValue: string) {
    // localValue viene en formato yyyy-MM-ddTHH:mm
    return new Date(localValue).toISOString();
  }

  save() {
    const data = {
      corredor: this.model.corredor,
      carro: this.model.carro,
      marca: this.model.marca || '',
      tiempoSegundos: Number(this.model.tiempoSegundos),
      tramo: this.model.tramo,
      fecha: this.toIso(this.model.fechaLocal)
    };
    if (this.isEdit() && this.id) {
      this.svc.update(this.id, data);
    } else {
      this.svc.add(data);
    }
    this.router.navigate(['/times']);
  }
}
