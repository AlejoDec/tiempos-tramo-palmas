import { Component, signal, computed, inject, HostListener } from '@angular/core';
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

  // Atajo global: Ctrl + N (o Cmd + N en macOS) para crear nuevo tiempo
  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcut(ev: KeyboardEvent) {
    if ((ev.shiftKey) && (ev.key === 't' || ev.key === 'T')) {
      // Evitar interferir cuando se escribe en campos de texto
      const target = ev.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (['INPUT','TEXTAREA','SELECT'].includes(tag) || target.isContentEditable) return;
      }
      ev.preventDefault();
      this.router.navigate(['/times/new']);
    }
    if ((ev.shiftKey) && (ev.key === 'Enter')) {
      // Guarda el formulario si está en modo edición
      const target = ev.target as HTMLElement | null;
      if (target) {
        const form = target.closest('form');
        if (form) {
          ev.preventDefault();
          form.requestSubmit();
        }
      }
    }
  }
}
