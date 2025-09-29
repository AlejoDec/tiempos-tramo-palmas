import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="login-container">
    <h2>Ingreso</h2>
    <form (ngSubmit)="onSubmit()" #f="ngForm">
      <div>
        <label>Usuario</label>
        <input type="text" name="username" required [(ngModel)]="username" />
      </div>
      <div>
        <label>Contraseña</label>
        <input type="password" name="password" required [(ngModel)]="password" />
      </div>
      <button type="submit" [disabled]="f.invalid">Entrar</button>
      <p class="error" *ngIf="error()">Credenciales incorrectas</p>
    </form>
    <p><strong>Demo:</strong> usuario: <code>admin</code> / password: <code>1234</code></p>
  </div>
  `,
  styles: [`
    .login-container { max-width:360px;margin:2rem auto;padding:1.5rem;border:1px solid #ccc;border-radius:8px; }
    form div { margin-bottom:1rem; display:flex; flex-direction:column; }
    label { font-weight:600; margin-bottom:0.25rem; }
    input { padding:0.5rem; }
    button { padding:0.6rem 1.2rem; cursor:pointer; }
    .error { color:#c00; margin-top:0.5rem; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  private auth = inject(AuthService);
  private router = inject(Router);
  protected error = signal(false);

  onSubmit() {
    const ok = this.auth.login({ username: this.username, password: this.password });
    if (ok) {
      this.router.navigate(['/times']);
    } else {
      this.error.set(true);
      setTimeout(() => this.error.set(false), 3000);
    }
  }
}
