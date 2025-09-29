import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

interface Credentials {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'app.user.session';
  private _loggedIn = signal<boolean>(this.hasStoredSession());
  readonly loggedIn = this._loggedIn.asReadonly();

  private hasStoredSession(): boolean {
    return !!localStorage.getItem(this.storageKey);
  }

  login({ username, password }: Credentials): boolean {
    // Credenciales fijas de ejemplo. En un backend real se validaría en el servidor.
    if (username === 'admin' && password === '1234') {
      localStorage.setItem(this.storageKey, JSON.stringify({ username, ts: Date.now() }));
      this._loggedIn.set(true);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    this._loggedIn.set(false);
    inject(Router).navigate(['/login']);
  }
}
