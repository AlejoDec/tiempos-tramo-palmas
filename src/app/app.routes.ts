import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RaceTimesListComponent } from './race-times/race-times-list.component';
import { RaceTimeFormComponent } from './race-times/race-time-form.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
			{ path: 'login', component: LoginComponent, data: { renderMode: 'client' } },
			{ path: 'times', component: RaceTimesListComponent, canActivate: [authGuard], data: { renderMode: 'client' } },
			{ path: 'times/new', component: RaceTimeFormComponent, canActivate: [authGuard], data: { renderMode: 'client' } },
			{ path: 'times/:id/edit', component: RaceTimeFormComponent, canActivate: [authGuard], data: { renderMode: 'client' } },
			{ path: '', pathMatch: 'full', redirectTo: 'times', data: { renderMode: 'client' } },
			{ path: '**', redirectTo: 'times', data: { renderMode: 'client' } }
];
