import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('mi-app-angular');
  private auth = inject(AuthService);
  private router = inject(Router);
  protected loggedIn = computed(() => this.auth.loggedIn());
  protected logout() { this.auth.logout(); }
  protected goLogin() { this.router.navigate(['/login']); }
}
