import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.routes').then(m => m.LOGIN_ROUTES)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.routes').then(m => m.REGISTRO_ROUTES)
  },
  {
    path: 'dashboard-paciente',
    loadComponent: () => import('./pages/dashboard-paciente/dashboard-paciente.component').then(m => m.DashboardPacienteComponent)
  },
  {
    path: 'dashboard-especialista',
    loadComponent: () => import('./pages/dashboard-especialista/dashboard-especialista.component').then(m => m.DashboardEspecialistaComponent)
  },
  {
    path: 'dashboard-admin',
    loadComponent: () => import('./pages/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'mis-turnos-paciente',
    loadComponent: () => import('./pages/mis-turnos-paciente/mis-turnos-paciente.component').then(m => m.MisTurnosPacienteComponent)
  },
  {
    path: 'mis-turnos-especialista',
    loadComponent: () => import('./pages/mis-turnos-especialista/mis-turnos-especialista.component').then(m => m.MisTurnosEspecialistaComponent)
  },
  {
    path: 'mis-turnos-administrador',
    loadComponent: () => import('./pages/mis-turnos-administrador/mis-turnos-administrador.component').then(m => m.MisTurnosAdministradorComponent)
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./pages/mi-perfil/mi-perfil.component').then(m => m.MiPerfilComponent)
  },
  {
    path: 'turnos',
    loadComponent: () => import('./pages/turnos/turnos.component').then(m => m.TurnosComponent)
  },
  {
    path: 'crear-historia-clinica/:turnoId',
    loadComponent: () => import('./pages/crear-historia-clinica/crear-historia-clinica.component').then(m => m.CrearHistoriaClinicaComponent)
  },
  {
    path: 'historias-clinicas-admin',
    loadComponent: () => import('./pages/historias-clinicas-admin/historias-clinicas-admin.component').then(m => m.HistoriasClinicasAdminComponent)
  },
  {
    path: 'pacientes-especialista',
    loadComponent: () => import('./pages/pacientes-especialista/pacientes-especialista.component').then(m => m.PacientesEspecialistaComponent)
  },
  {
    path: 'estadisticas',
    loadComponent: () => import('./pages/estadisticas/estadisticas.component').then(m => m.EstadisticasComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
